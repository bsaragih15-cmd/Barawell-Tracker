export interface TrendChartProps {
  /** Weekly check-ins, oldest first: { value: number; label?: string } (label = short week/date). */
  points: Array<{ value: number; label?: string }>;
  /** Default "kg". */
  unit?: string;
  /** Overrides the auto "{n} minggu" period text in the summary, e.g. "68 minggu". */
  rangeLabel?: string;
  /** Honest framing line under the chart, e.g. "Banyak orang turun 5–10% dalam 3 bulan — trennya yang dilihat dokter, bukan angka harian." */
  goalNote?: string;
  style?: React.CSSProperties;
}
