export interface StatusChipProps {
  /** "in_review" (sage outline) | "approved" (sage solid) | "needs_info" (info blue) | "rejected" (neutral, kind copy). */
  status: "in_review" | "approved" | "needs_info" | "rejected";
  /** Override the default Indonesian label. */
  label?: string;
  style?: React.CSSProperties;
}
