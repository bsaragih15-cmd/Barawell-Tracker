import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Inter, Source_Serif_4 } from 'next/font/google';
import './dara.css';
import { Footer } from './ui';

const inter = Inter({ subsets: ['latin'], variable: '--font-ui-next' });
const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-display-next', weight: 'variable' });

export const metadata: Metadata = {
  title: 'Dara — Perawatan kesehatan perempuan, tanpa drama',
  description:
    'Program berat badan dengan dokter, pil KB diantar ke rumah, perawatan kulit & rambut resep, dan kesehatan mental — online, diskret, terdaftar BPOM.',
};

const NAV = [
  { href: '/dara/berat-badan', label: 'Berat badan' },
  { href: '/dara/pil-kb', label: 'Pil KB' },
  { href: '/dara/kulit', label: 'Kulit' },
  { href: '/dara/rambut', label: 'Rambut' },
  { href: '/dara/kesehatan-mental', label: 'Mental' },
];

export default function DaraLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`dara ${inter.variable} ${serif.variable}`}
      style={
        {
          '--font-ui': 'var(--font-ui-next), -apple-system, "Segoe UI", "Helvetica Neue", sans-serif',
          '--font-display': 'var(--font-display-next), "Iowan Old Style", Georgia, serif',
          display: 'flex',
          flexDirection: 'column',
        } as React.CSSProperties
      }
    >
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: 'color-mix(in srgb, var(--dara-canvas) 92%, transparent)',
          backdropFilter: 'blur(8px)',
          borderBottom: 'var(--border-hairline)',
        }}
      >
        <div className="dara-wrap" style={{ display: 'flex', alignItems: 'center', gap: 20, minHeight: 60 }}>
          <Link href="/dara" style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', letterSpacing: '-0.015em' }}>
            Dara
          </Link>
          <nav style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginLeft: 'auto' }} aria-label="Kategori">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none', padding: '8px 12px', borderRadius: 'var(--radius-pill)' }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
