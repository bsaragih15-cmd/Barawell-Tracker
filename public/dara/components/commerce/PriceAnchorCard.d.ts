export interface PriceAnchorCardProps {
  /** The DIY-apotek anchor: { eyebrow, price, note }. */
  left: { eyebrow: string; price: string; note: string };
  /** The Dara program (terracotta border): { eyebrow, price, note }. */
  right: { eyebrow: string; price: string; note: string };
  style?: React.CSSProperties;
}
