-- 0010 · Dara product v1 — cases + plans for the women's-health funnel.
-- Additive only; nothing here touches the cockpit model (config/stages/initiatives).
--
-- Access model (v1 shortcut, mirrors 0003's posture): the app talks to Postgres
-- through the server-side client. Anon policies are scoped to what the funnel
-- needs — insert a case, read/update a single case by its unguessable uuid.
-- Replace with Supabase Auth per BACKLOG when accounts land.

create extension if not exists pgcrypto;

-- ── Plans: the sellable programs (seeded; admin assigns one per case) ──
create table if not exists dara_plans (
  id          text primary key,          -- 'bb-glp1-wegovy', 'kb-pill', …
  category    text not null,             -- bb | kb | kulit | rambut | mental
  tier        text,                      -- glp1 | oral | null
  name        text not null,
  medication  text,                      -- display label; doctor's call
  fulfillment text not null default 'delivery' check (fulfillment in ('delivery','clinic_pickup')),
  monthly_price bigint not null,         -- Rp, per month at 1-month term
  price_3mo   bigint,                    -- Rp per month on 3-month prepay
  price_6mo   bigint,                    -- Rp per month on 6-month prepay
  features    jsonb not null default '[]',
  active      boolean not null default true
);

-- ── Cases: one row per funnel submission; uuid doubles as the access token ──
create table if not exists dara_cases (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  category    text not null,             -- bb | kb | kulit | rambut | cemas | tidur
  routed_tier text,                      -- glp1 | oral | estrogen_free | …
  med_pref    text,                      -- wegovy | mounjaro | null (preference, not purchase)
  answers     jsonb not null default '{}',
  flagged     boolean not null default false,  -- crisis flag → human follow-up
  -- contact (no auth in v1)
  full_name   text not null,
  wa_number   text not null,
  city        text,
  -- consents (versioned text lives in the app; store acceptance)
  consent_tele    boolean not null default false,
  consent_privacy boolean not null default false,
  -- state machine
  status      text not null default 'in_review'
              check (status in ('in_review','needs_info','approved','rejected','paid','cancelled')),
  plan_id     text references dara_plans(id),
  term_months int,
  doctor_note text,
  paid_at     timestamptz
);

create index if not exists dara_cases_status_idx on dara_cases (status, created_at desc);

alter table dara_plans enable row level security;
alter table dara_cases enable row level security;

-- Plans are public catalog data.
drop policy if exists dara_plans_read on dara_plans;
create policy dara_plans_read on dara_plans for select using (true);

-- Funnel: anyone may create a case; reads/updates go through the server layer
-- which always filters by the case uuid (unguessable). Column-level guarding of
-- status transitions is enforced in server actions, not RLS, in v1.
drop policy if exists dara_cases_insert on dara_cases;
create policy dara_cases_insert on dara_cases for insert with check (true);
drop policy if exists dara_cases_select on dara_cases;
create policy dara_cases_select on dara_cases for select using (true);
drop policy if exists dara_cases_update on dara_cases;
create policy dara_cases_update on dara_cases for update using (true);

-- ── Seed plans (placeholder pricing per PRD §9; finance to confirm) ──
insert into dara_plans (id, category, tier, name, medication, fulfillment, monthly_price, price_3mo, price_6mo, features) values
  ('bb-glp1-wegovy',   'bb', 'glp1', 'Program GLP-1 — Wegovy',   'Wegovy® (semaglutide), suntik mingguan',   'clinic_pickup', 3900000, 3500000, 3300000,
   '["Konsultasi & tinjauan dokter","Titrasi dosis diatur bertahap","Pendampingan makan & aktivitas","Cek gejala prioritas","Obat diambil di klinik partner"]'),
  ('bb-glp1-mounjaro', 'bb', 'glp1', 'Program GLP-1 — Mounjaro', 'Mounjaro® (tirzepatide), suntik mingguan', 'clinic_pickup', 4400000, 4100000, 3900000,
   '["Konsultasi & tinjauan dokter","Titrasi dosis diatur bertahap","Pendampingan makan & aktivitas","Cek gejala prioritas","Obat diambil di klinik partner"]'),
  ('bb-oral',          'bb', 'oral', 'Program Oral',             'Obat oral + pendampingan ahli gizi',        'delivery',       749000,  649000,  599000,
   '["Konsultasi & tinjauan dokter","Obat oral diantar ke rumah","Pendampingan ahli gizi","Check-in mingguan"]'),
  ('kb-pill',          'kb', null,   'Langganan Pil KB',         'Pil KB sesuai resep dokter',                'delivery',       149000,  139000,  129000,
   '["Tinjauan dokter & resep","Diantar diskret ke rumah","Kiriman ulang otomatis, 6 hari sebelum habis","Ganti jenis kapan saja lewat pesan"]'),
  ('kulit-rx',         'kulit', null,'Rangkaian Kulit Resep',    'Formula resep (mis. tretinoin / azelaic)',  'delivery',       249000,  219000,  199000,
   '["Tinjauan dokter & resep","Rutinitas lengkap sekali paket","Foto progres bulanan","Sesuaikan formula lewat pesan"]'),
  ('rambut-rx',        'rambut', null,'Paket Rambut',            'Minoxidil topikal + suplemen',              'delivery',       299000,  269000,  249000,
   '["Tinjauan dokter","Minoxidil + suplemen tiap bulan","Foto progres bulanan","Ekspektasi jujur: hasil 3–6 bulan"]'),
  ('cemas-care',       'cemas', null,'Program Cemas',            'Obat sesuai resep + check-in dokter bulanan','delivery',      349000,  319000,  299000,
   '["Tinjauan & resep dokter","Check-in dokter tiap bulan","Pesan tim care kapan saja","Bukan golongan psikotropika"]'),
  ('tidur-care',       'tidur', null,'Program Tidur',            'Melatonin + program kebiasaan tidur',       'delivery',       199000,  179000,  169000,
   '["Asesmen pola tidur","Melatonin non-resep","Program kebiasaan 8 minggu","Check-in tim care"]')
on conflict (id) do nothing;
