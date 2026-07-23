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
