/**
 * @startingPoint section="Components" subtitle="Full-width quiz answer card with radio/checkbox affordance" viewport="700x300"
 */
export interface OptionCardProps {
  label: string;
  /** Optional second line, e.g. clarifying who the option fits. */
  description?: string;
  selected: boolean;
  /** true = checkbox semantics (multi-select questions). Default radio. */
  multi?: boolean;
  onSelect: () => void;
  style?: React.CSSProperties;
}
