/**
 * @startingPoint section="Components" subtitle="Primary terracotta / secondary outline / quiet text" viewport="700x260"
 */
export interface ButtonProps {
  /** "primary" (terracotta — max one per screen) | "secondary" (outline) | "quiet" (text-only). Default "primary". */
  variant?: "primary" | "secondary" | "quiet";
  /** "md" (44px) | "lg" (52px — quiz CTAs, checkout). Default "md". */
  size?: "md" | "lg";
  /** Stretch to container width — the default on mobile CTAs. */
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}
