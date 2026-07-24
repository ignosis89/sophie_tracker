export type Tone = 'up' | 'down' | 'flat';

export function improvementTone(value: number): Tone {
  if (value > 0.02) return 'up';
  if (value < -0.02) return 'down';
  return 'flat';
}

export const TONE_STYLES: Record<Tone, { arrow: string; className: string }> = {
  up: { arrow: '▲', className: 'text-emerald-600 dark:text-emerald-400' },
  down: { arrow: '▼', className: 'text-red-600 dark:text-red-400' },
  flat: { arrow: '→', className: 'text-zinc-500 dark:text-zinc-400' },
};

/** Builds a `?start=...&end=...` query string to carry the active date filter across links. */
export function dateRangeQuery({ start, end }: { start?: string; end?: string }): string {
  const params: Record<string, string> = {};
  if (start) params.start = start;
  if (end) params.end = end;
  const search = new URLSearchParams(params).toString();
  return search ? `?${search}` : '';
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
