export interface OrderCardProps {
  /** e.g. "Pesanan #DR-20260709-114" — tabular numerals. */
  orderNumber: string;
  /** What's in the order, e.g. "Program Berat Badan — bulan ke-2". */
  title: string;
  /** "delivery" | "pickup" (klinik partner, with map pin). Default "delivery". */
  type?: "delivery" | "pickup";
  /** Short status, e.g. "Dalam perjalanan". */
  statusLabel?: string;
  /** e.g. "Tiba diperkirakan 11 Juli 2026". */
  eta?: string;
  address?: string;
  /** Show the neutral-sender discretion line. Default true. */
  discreet?: boolean;
  style?: React.CSSProperties;
}
