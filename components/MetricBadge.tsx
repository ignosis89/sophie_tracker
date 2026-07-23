import { improvementTone, TONE_STYLES } from '@/lib/format';

export function MetricBadge({
  label,
  letter,
  improvement,
  size = 'default',
}: {
  label: string;
  letter?: string | null;
  improvement?: number | null;
  size?: 'default' | 'large';
}) {
  const isImprovement = improvement !== undefined;
  const isLarge = size === 'large';

  return (
    <div
      className={`flex-1 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 ${
        isLarge ? 'px-8 py-6' : 'px-5 py-4'
      }`}
    >
      <p
        className={`font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 ${
          isLarge ? 'text-sm' : 'text-xs'
        }`}
      >
        {label}
      </p>
      {isImprovement ? (
        <ImprovementValue value={improvement} large={isLarge} />
      ) : (
        <p className={`mt-1 font-semibold text-zinc-900 dark:text-zinc-50 ${isLarge ? 'text-6xl' : 'text-2xl'}`}>
          {letter ?? '—'}
        </p>
      )}
    </div>
  );
}

function ImprovementValue({ value, large }: { value: number | null | undefined; large: boolean }) {
  if (value === null || value === undefined) {
    return (
      <p className={`mt-1 font-medium text-zinc-400 dark:text-zinc-600 ${large ? 'text-2xl' : 'text-lg'}`}>
        Not enough data
      </p>
    );
  }

  const { arrow, className } = TONE_STYLES[improvementTone(value)];

  return (
    <p className={`mt-1 font-semibold ${className} ${large ? 'text-6xl' : 'text-2xl'}`}>
      {arrow} {value.toFixed(2)}
    </p>
  );
}
