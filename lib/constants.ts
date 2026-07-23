export const GRADE_SCALE = [
  { min: 93, letter: 'A' },
  { min: 90, letter: 'A-' },
  { min: 87, letter: 'B+' },
  { min: 83, letter: 'B' },
  { min: 80, letter: 'B-' },
  { min: 77, letter: 'C+' },
  { min: 73, letter: 'C' },
  { min: 70, letter: 'C-' },
  { min: 67, letter: 'D+' },
  { min: 63, letter: 'D' },
  { min: 60, letter: 'D-' },
  { min: 0, letter: 'F' },
] as const;

// N: how many recent/prior entries are averaged and compared for the trend.
export const TREND_WINDOW_SIZE = 5;
// Minimum total entries before a trend is shown at all.
export const MIN_ENTRIES_FOR_TREND = 4;
// A 20-percentage-point swing between the recent and prior window == a trend of +/-1.0.
export const IMPROVEMENT_SCALE_POINTS = 20;

export const SESSION_COOKIE_NAME = 'session';
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
