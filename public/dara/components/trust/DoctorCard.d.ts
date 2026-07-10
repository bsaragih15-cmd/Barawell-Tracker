export interface DoctorCardProps {
  /** e.g. "dr. Ratna Wijaya" */
  name: string;
  /** STR number line, e.g. "31.2.1.404.…" — rendered with "STR " prefix. */
  str?: string;
  /** e.g. "Dokter umum · konsultan program berat badan" */
  specialty?: string;
  /** Real photo when provided; otherwise a striped placeholder circle. */
  photoUrl?: string;
  /** Borderless inline layout (for plan-reveal headers, bylines). */
  compact?: boolean;
  style?: React.CSSProperties;
}
