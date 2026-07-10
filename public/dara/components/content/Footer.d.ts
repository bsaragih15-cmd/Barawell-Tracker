export interface FooterProps {
  /** Wordmark text. Default "Dara" (plain serif type — no logo asset exists yet). */
  brand?: string;
  columns?: Array<{ title: string; links: string[] }>;
  /** Legal identifier lines (PT, telemedicine disclosure, PSE/BPOM). */
  legal?: string[];
  style?: React.CSSProperties;
}
