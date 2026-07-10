export interface ProgressBarProps {
  /** 0–1 fraction of quiz completed. */
  value: number;
  /** Accessible label. Default "Kemajuan kuis". */
  label?: string;
  style?: React.CSSProperties;
}
