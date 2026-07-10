export interface StepTimelineProps {
  steps: Array<{
    title: string;
    description?: string;
    /** Small tabular line, e.g. a date or dose ("0,25 mg · mulai 9 Juli"). */
    meta?: string;
    /** "done" | "current" | "upcoming". Default "upcoming". */
    state?: "done" | "current" | "upcoming";
  }>;
  style?: React.CSSProperties;
}
