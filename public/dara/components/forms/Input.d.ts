export interface InputProps {
  label: string;
  /** Helper line under the field. */
  hint?: string;
  /** Inline error IN WORDS ("Berat badan wajib diisi") — never color alone. Replaces hint. */
  error?: string;
  /** Unit shown inside the right edge, e.g. "kg", "cm". */
  suffix?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: any) => void;
  id?: string;
  style?: React.CSSProperties;
}
