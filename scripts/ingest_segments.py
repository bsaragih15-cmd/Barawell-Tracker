#!/usr/bin/env python3
"""Parse Barawell's block-format order history and load/emit segmentation marts.

No PII is written to git. Input can be a local CSV or the Google Sheet CSV export.
Classification is defined by migration 0004 generated columns; this ETL only parses,
normalizes, and writes raw mart rows.
"""
from __future__ import annotations
import argparse,csv,hashlib,json,os,re,sys,urllib.parse,urllib.request
from collections import Counter
from datetime import date,datetime
from pathlib import Path

MONTHS={'Jan':1,'Feb':2,'Mar':3,'Apr':4,'Mei':5,'Jun':6,'Jul':7,'Agu':8,'Sep':9,'Okt':10,'Nov':11,'Des':12}
DATE_RE=re.compile(r'^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$')
MONEY_RE=re.compile(r'Rp\s*([\d.,]+)',re.I)
ORDER_RE=re.compile(r'Order\s+(\d+)\s*\(bayar\s+(\d+)\)',re.I)
BOX_RE=re.compile(r'Total box\s+(\d+)',re.I)
CHANNELS=('website','whatsapp','tokopedia','shopee')
STATUSES=('delivered','shipped','completed','paid','cancelled','canceled','refunded','pending','processing')

def parse_date(s:str)->date:
 m=DATE_RE.match(s.strip());
 if not m or m.group(2) not in MONTHS: raise ValueError(f'bad Indonesian date: {s!r}')
 return date(int(m.group(3)),MONTHS[m.group(2)],int(m.group(1)))

def money(s:str)->int:
 m=MONEY_RE.search(s or '')
 if not m:return 0
 raw=m.group(1)
 # Sheet display uses dots for thousands; order rows may use commas.
 return int(re.sub(r'\D','',raw))

def flags(text:str)->dict[str,bool]:
 t=(text or '').lower()
 return {'has_s50':bool(re.search(r'sildenafil\s*50',t)),'has_s100':bool(re.search(r'sildenafil\s*100',t)),
         'has_bara':'baralast' in t or bool(re.search(r'\bbara\b',t)),'has_tada':'tadalafil' in t or 'tada' in t}

def stable_id(phone:str,name:str,first:date)->str:
 return hashlib.sha256(f'{phone.strip()}|{name.strip().lower()}|{first.isoformat()}'.encode()).hexdigest()[:24]

def channel_group(ch:str)->str:
 c=ch.lower(); return 'owned' if c in ('website','whatsapp') else 'marketplace' if c in ('tokopedia','shopee') else 'other'

def read_rows(path:str|None,sheet_id:str,gid:str):
 if path:
  fh=open(path,newline='',encoding='utf-8-sig'); return list(csv.reader(fh))
 url=f'https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}'
 with urllib.request.urlopen(url,timeout=60) as r:
  return list(csv.reader(r.read().decode('utf-8-sig').splitlines()))

def parse(rows):
 customers=[]; orders=[]; i=0
 while i<len(rows):
  row=rows[i]+['']*8
  if i+3>=len(rows) or not row[0].strip() or not (rows[i+1] and str(rows[i+1][0]).strip().startswith('HP')):
   i+=1; continue
  name=row[0].strip(); summary=(rows[i+1]+['']*8); products=(rows[i+2]+[''])[0].replace('Produk dipesan:','').strip()
  phone=summary[0].replace('HP','',1).strip(); city=summary[1].replace('Kota','',1).strip()
  declared=int(ORDER_RE.search(summary[2]).group(2)) if ORDER_RE.search(summary[2]) else 0
  total_boxes=int(BOX_RE.search(summary[3]).group(1)) if BOX_RE.search(summary[3]) else 0
  lifetime=money(summary[4]); j=i+4
  if j<len(rows) and rows[j] and rows[j][0].strip()=='Tanggal': j+=1
  block=[]
  while j<len(rows):
   rr=rows[j]
   if not rr or not any(str(x).strip() for x in rr):
    if j+2<len(rows) and rows[j+1] and not any(str(x).strip() for x in rows[j+1]): break
    j+=1; continue
   try: od=parse_date(str(rr[0]))
   except Exception: break
   vals=[str(x).strip() for x in rr]
   joined='|'.join(vals).lower()
   channel=next((c for c in CHANNELS if c in joined),'other')
   status=next((s for s in STATUSES if s in joined),'unknown')
   oid=vals[1] if len(vals)>1 and vals[1] else hashlib.sha256('|'.join(vals).encode()).hexdigest()[:20]
   product=vals[2] if len(vals)>2 else ''
   boxes=next((int(v) for v in vals[3:] if v.isdigit()),0)
   revenue=next((money(v) for v in vals if 'rp' in v.lower()),0)
   block.append({'order_id':oid,'order_date':od,'revenue_rp':revenue,'boxes':boxes,'status':status,'channel':channel,'product_text':product,**flags(product)})
   j+=1
  if not block: i+=1; continue
  block.sort(key=lambda x:(x['order_date'],x['order_id']))
  cid=stable_id(phone,name,block[0]['order_date']); counts=Counter(x['channel'] for x in block)
  customer={'customer_id':cid,'name':name,'city':city or None,'first_order':block[0]['order_date'],'last_order':block[-1]['order_date'],
   'order_count':len(block),'lifetime_rp':lifetime or sum(x['revenue_rp'] for x in block),'total_boxes':total_boxes or sum(x['boxes'] for x in block),
   'product_text':products,'primary_channel':counts.most_common(1)[0][0],'owned_orders':sum(counts[x] for x in ('website','whatsapp')),
   'marketplace_orders':sum(counts[x] for x in ('tokopedia','shopee')),**flags(products)}
  customers.append(customer)
  for n,o in enumerate(block,1): orders.append({**o,'customer_id':cid,'order_number':n,'channel_group':channel_group(o['channel'])})
  i=max(j,i+1)
 if not customers: raise RuntimeError('No customer blocks parsed')
 max_date=max(c['last_order'] for c in customers)
 for c in customers:c['dataset_max_date']=max_date
 return customers,orders

def sql_literal(v):
 if v is None:return 'null'
 if isinstance(v,bool):return 'true' if v else 'false'
 if isinstance(v,(int,float)):return str(v)
 if isinstance(v,(date,datetime)):return "'%s'"%v.isoformat()
 return "'%s'"%str(v).replace("'","''")

def emit_sql(customers,orders,path):
 cols_c=list(customers[0]); cols_o=list(orders[0]); out=['begin;','truncate segment_orders, segment_customers;']
 for table,cols,data in [('segment_customers',cols_c,customers),('segment_orders',cols_o,orders)]:
  for row in data: out.append(f"insert into {table} ({','.join(cols)}) values ({','.join(sql_literal(row[c]) for c in cols)});")
 out+=['commit;']; Path(path).write_text('\n'.join(out),encoding='utf-8')

def rest_load(customers,orders,url,key):
 headers={'apikey':key,'Authorization':f'Bearer {key}','Content-Type':'application/json','Prefer':'resolution=merge-duplicates'}
 def request(method,path,payload=None):
  req=urllib.request.Request(url.rstrip('/')+'/rest/v1/'+path,data=json.dumps(payload,default=str).encode() if payload is not None else None,headers=headers,method=method)
  with urllib.request.urlopen(req,timeout=120) as r:r.read()
 request('DELETE','segment_orders?order_id=not.is.null'); request('DELETE','segment_customers?customer_id=not.is.null')
 for data,path in ((customers,'segment_customers'),(orders,'segment_orders')):
  for k in range(0,len(data),500): request('POST',path,data[k:k+500])

def main():
 p=argparse.ArgumentParser(); p.add_argument('--csv'); p.add_argument('--sheet-id',default='13Q5WuF_HxNOgIJ-Ly1ahHnyRIx7S05mwrGZ6oX4riDY'); p.add_argument('--gid',default='1630987426')
 p.add_argument('--sql-out',default='segment_marts.sql'); p.add_argument('--load',action='store_true'); a=p.parse_args()
 customers,orders=parse(read_rows(a.csv,a.sheet_id,a.gid)); emit_sql(customers,orders,a.sql_out)
 print(f'parsed customers={len(customers)} orders={len(orders)} dataset_max={max(c["last_order"] for c in customers)}')
 if a.load:
  url=os.environ.get('NEXT_PUBLIC_SUPABASE_URL'); key=os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
  if not url or not key: raise SystemExit('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required for --load')
  rest_load(customers,orders,url,key); print('loaded live marts')
if __name__=='__main__': main()
