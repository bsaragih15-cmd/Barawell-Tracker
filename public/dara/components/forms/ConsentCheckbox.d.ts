export interface ConsentCheckboxProps {
  /** NEVER default to true — consent is opt-in by design. */
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Plain-language consent copy; may contain links to full terms. */
  children: React.ReactNode;
  style?: React.CSSProperties;
}
