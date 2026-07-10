/**
 * @startingPoint section="Components" subtitle="Plan with value stack, 1/3/6-bln prepay toggle, price after value" viewport="700x560"
 */
export interface PlanCardProps {
  /** e.g. "Program Berat Badan" */
  planName: string;
  /** e.g. "Semaglutide pen mingguan" — generic naming unless told otherwise. */
  medication: string;
  /** Show the "Terdaftar BPOM" badge. Default true. */
  bpom?: boolean;
  /** The value stack — listed BEFORE the price (konsultasi, pendampingan, titrasi, refill). */
  features: string[];
  /** Keyed by term (1|3|6): { perMonth: number; total?: number; savings?: string }. */
  prices: Record<number, { perMonth: number; total?: number; savings?: string }>;
  defaultTerm?: 1 | 3 | 6;
  ctaLabel?: string;
  onCta?: () => void;
  style?: React.CSSProperties;
}
