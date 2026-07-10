Plan card: value stack first, price after, prepay toggle (1/3/6 bln) with savings notes.

```jsx
<PlanCard
  planName="Program Berat Badan"
  medication="Semaglutide pen mingguan"
  features={["Konsultasi & tinjauan dokter", "Pendampingan pengaturan dosis", "Pengiriman diskret tiap bulan"]}
  prices={{ 1: { perMonth: 3900000 }, 3: { perMonth: 3500000, total: 10500000, savings: "hemat 10%" }, 6: { perMonth: 3200000, total: 19200000, savings: "hemat 18%" } }}
  ctaLabel="Mulai program"
  onCta={go}
/>
```

Prices in `Rp 3.900.000` format (auto), tabular numerals. Never hide the total for prepaid terms.
