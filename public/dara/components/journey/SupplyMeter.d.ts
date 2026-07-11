export interface SupplyMeterProps {
  /** Days in the current pack. Default 28. */
  totalDays?: number;
  remainingDays: number;
  /** Formatted date for the refill notice, e.g. "15 Juli 2026". */
  refillDate?: string;
  style?: React.CSSProperties;
}
