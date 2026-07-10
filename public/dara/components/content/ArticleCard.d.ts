export interface ArticleCardProps {
  /** e.g. "Berat badan" | "Kontrasepsi" — terracotta eyebrow. */
  category?: string;
  title: string;
  excerpt?: string;
  /** Byline name, e.g. "dr. Ratna Wijaya" — renders "Ditinjau secara medis oleh …". */
  reviewer?: string;
  imageUrl?: string;
  /** Monospace label inside the striped placeholder. */
  imageLabel?: string;
  href?: string;
  style?: React.CSSProperties;
}
