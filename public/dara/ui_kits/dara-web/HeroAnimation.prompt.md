Simple autoplay hero matching the Hers reference: warm brown gradient, two product pens floating with a gentle idle bob, and a circular gold text badge (“DOSIS TINGGI • BARU”) that rotates on its own — no scrolling. Respects prefers-reduced-motion (stops motion, keeps composition).

```jsx
<HeroAnimation onStartQuiz={goToQuiz} />
```

Assets: `assets/pen-ozempic.png` + `assets/pen-mounjaro.png` (transparent cutouts). Mounjaro's bottom bleeds off-frame on purpose (hides its dose-window end).
