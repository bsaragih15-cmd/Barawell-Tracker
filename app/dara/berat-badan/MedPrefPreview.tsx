'use client';
import React from 'react';
import { MedicationCard } from '../ui';

/* Landing-page preview of the preference module. Interactive but stateless
   beyond the visual — the real preference is captured inside the quiz. */
export function MedPrefPreview() {
  const [pref, setPref] = React.useState<string | null>(null);
  return (
    <div role="radiogroup" aria-label="Preferensi obat GLP-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
      <MedicationCard name="Wegovy®" molecule="semaglutide" cadence="1× / minggu" results="hingga ±15%" priceLabel="Rp 3.900.000/bln" img="/dara/assets/pen-wegovy.png" selected={pref === 'wegovy'} onSelect={() => setPref('wegovy')} />
      <MedicationCard name="Mounjaro®" molecule="tirzepatide" cadence="1× / minggu" results="hingga ±20%" priceLabel="Rp 4.400.000/bln" img="/dara/assets/pen-mounjaro-cut.png" selected={pref === 'mounjaro'} onSelect={() => setPref('mounjaro')} />
    </div>
  );
}
