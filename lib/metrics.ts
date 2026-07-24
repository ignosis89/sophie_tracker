import {
  GRADE_SCALE,
  TREND_WINDOW_SIZE,
  MIN_ENTRIES_FOR_TREND,
  IMPROVEMENT_SCALE_POINTS,
} from '@/lib/constants';
import type { Grade } from '@/lib/grades';

export function letterGradeFromAverage(average: number | null): string | null {
  if (average === null) return null;
  for (const { min, letter } of GRADE_SCALE) {
    if (average >= min) return letter;
  }
  return 'F';
}

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function byDate(a: { recordedAt: string }, b: { recordedAt: string }): number {
  return new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime();
}

/** `grades` must already be sorted ascending by date. Operates on percentage, not raw points. */
export function computeImprovement(grades: { percentage: number }[]): number | null {
  const total = grades.length;
  if (total < MIN_ENTRIES_FOR_TREND) return null;

  // Shrink the window for sparse data instead of refusing once the minimum is met.
  const n = Math.min(TREND_WINDOW_SIZE, Math.floor(total / 2));
  const recent = grades.slice(total - n);
  const older = grades.slice(total - 2 * n, total - n);

  const diff = mean(recent.map((g) => g.percentage)) - mean(older.map((g) => g.percentage));
  return clamp(diff / IMPROVEMENT_SCALE_POINTS, -1, 1);
}

export type SubjectMetrics = {
  average: number | null;
  letter: string | null;
  improvement: number | null;
  count: number;
};

export function computeSubjectMetrics(grades: Grade[]): SubjectMetrics {
  const sorted = [...grades].sort(byDate);
  const count = sorted.length;
  const average = count === 0 ? null : mean(sorted.map((g) => g.percentage));

  return {
    average,
    letter: letterGradeFromAverage(average),
    improvement: computeImprovement(sorted),
    count,
  };
}

export type DateRangeParams = { start?: string; end?: string };

export function parseDateRangeParams(
  searchParams: Record<string, string | string[] | undefined>
): DateRangeParams {
  const start = searchParams.start;
  const end = searchParams.end;
  return {
    start: (Array.isArray(start) ? start[0] : start) || undefined,
    end: (Array.isArray(end) ? end[0] : end) || undefined,
  };
}

/** recordedAt is 'YYYY-MM-DD', so plain string comparison sorts chronologically. */
export function filterByDateRange<T extends { recordedAt: string }>(
  grades: T[],
  { start, end }: DateRangeParams
): T[] {
  return grades.filter((g) => (!start || g.recordedAt >= start) && (!end || g.recordedAt <= end));
}

/** Year-to-date: Jan 1 of the current year through today, both in local time. */
export function getDefaultDateRange(): { start: string; end: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    start: `${now.getFullYear()}-01-01`,
    end: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
  };
}

/**
 * Average is equal-weighted per subject (report-card style, so a subject with
 * many entries doesn't drown out one with few). Improvement pools every grade
 * across subjects by date, so recent activity in any subject shows up in the
 * trend. These use different weighting on purpose - don't unify them.
 */
export function computeAggregateMetrics(subjectGrades: Grade[][]): SubjectMetrics {
  const subjectAverages = subjectGrades
    .map((grades) => (grades.length === 0 ? null : mean(grades.map((g) => g.percentage))))
    .filter((avg): avg is number => avg !== null);

  const average = subjectAverages.length === 0 ? null : mean(subjectAverages);

  const pooledGrades = subjectGrades.flat().sort(byDate);

  return {
    average,
    letter: letterGradeFromAverage(average),
    improvement: computeImprovement(pooledGrades),
    count: pooledGrades.length,
  };
}
