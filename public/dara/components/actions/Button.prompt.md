Button in three intents: primary terracotta (the one action that matters), secondary outline, quiet text.

```jsx
<Button size="lg" fullWidth onClick={start}>Mulai konsultasi</Button>
<Button variant="secondary">Pelajari dulu</Button>
<Button variant="quiet">Lewati</Button>
```

Rules: max one primary per screen; labels are verbs in sentence case ("Mulai konsultasi", never "MULAI!"); no medication "Beli" buttons — CTAs lead to the quiz/consult.
