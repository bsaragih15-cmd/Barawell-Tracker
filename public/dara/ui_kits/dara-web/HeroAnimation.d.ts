export interface HeroAnimationProps {
  /** Fallback journey entry — used when onSelectProduct is not given. */
  onStartQuiz?: (productId?: string) => void;
  /** Fires when a lineup card is tapped ("wegovy" | "mounjaro" | "oral"). */
  onSelectProduct?: (productId: string) => void;
  /** Background theme. */
  variant?: "caramel" | "clay" | "blush" | "spotlight" | "dusk";
  /** Fixed frame height (px) when embedded; defaults to 90vh. */
  frameHeight?: number;
  /** Base path for image assets. Default "../../assets/". */
  assetBase?: string;
}
