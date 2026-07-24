import Link from 'next/link';
import type { Subject } from '@/lib/grades';
import type { SubjectMetrics } from '@/lib/metrics';
import { improvementTone, TONE_STYLES } from '@/lib/format';

export function SubjectCard({
  subject,
  metrics,
  query = '',
}: {
  subject: Subject;
  metrics: SubjectMetrics;
  query?: string;
}) {
  return (
    <Link
      href={`/subjects/${subject.id}${query}`}
      className="block rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
    >
      <p className="font-medium text-zinc-900 dark:text-zinc-50">{subject.name}</p>
      <div className="mt-3 flex items-center gap-4 text-sm">
        <span className="font-semibold text-zinc-900 dark:text-zinc-50">{metrics.letter ?? 'No grades'}</span>
        {metrics.improvement !== null ? (
          <ImprovementTag value={metrics.improvement} />
        ) : (
          metrics.count > 0 && <span className="text-zinc-400 dark:text-zinc-600">Not enough data</span>
        )}
      </div>
    </Link>
  );
}

function ImprovementTag({ value }: { value: number }) {
  const { arrow, className } = TONE_STYLES[improvementTone(value)];
  return (
    <span className={className}>
      {arrow} {value.toFixed(2)}
    </span>
  );
}
