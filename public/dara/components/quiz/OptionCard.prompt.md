One quiz answer — full-width tap target (≥60px), radio or checkbox affordance, terracotta when selected.

```jsx
<OptionCard label="Menurunkan berat badan" description="Program dengan pendampingan dokter" selected={v === "bb"} onSelect={() => pick("bb")} />
<OptionCard multi label="Sakit kepala" selected={s.has("sk")} onSelect={() => toggle("sk")} />
```

Parent owns auto-advance (delay ~350ms after single-select so the state change is visible).
