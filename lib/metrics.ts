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

/** `grades` must already be sorted ascending by date. */
export function computeImprovement(grades: { score: number }[]): number | null {
  const total = grades.length;
  if (total < MIN_ENTRIES_FOR_TREND) return null;

  // Shrink the window for sparse data instead of refusing once the minimum is met.
  const n = Math.min(TREND_WINDOW_SIZE, Math.floor(total / 2));
  const recent = grades.slice(total - n);
  const older = grades.slice(total - 2 * n, total - n);

  const diff = mean(recent.map((g) => g.score)) - mean(older.map((g) => g.score));
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
  const average = count === 0 ? null : mean(sorted.map((g) => g.score));

  return {
    average,
    letter: letterGradeFromAverage(average),
    improvement: computeImprovement(sorted),
    count,
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
    .map((grades) => (grades.length === 0 ? null : mean(grades.map((g) => g.score))))
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
