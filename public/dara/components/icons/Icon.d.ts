export interface IconProps {
  /** One of: "check" | "chevron-down" | "arrow-right" | "x" | "map-pin" | "shield-check" | "clock" | "plus" */
  name: string;
  /** Square size in px. Default 20. */
  size?: number;
  /** Stroke weight. Default 1.75 — keep consistent across a screen. */
  strokeWidth?: number;
  style?: React.CSSProperties;
}
