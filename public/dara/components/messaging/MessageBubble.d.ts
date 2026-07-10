export interface MessageBubbleProps {
  /** "doctor" (white card, left) | "patient" (blush, right). */
  from: "doctor" | "patient";
  /** Shown above doctor messages, e.g. "dr. Ratna Wijaya". */
  author?: string;
  text: string;
  /** e.g. "09.14" or "Kemarin, 16.02". */
  time?: string;
  style?: React.CSSProperties;
}
