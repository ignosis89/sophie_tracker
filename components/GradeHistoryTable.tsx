import type { Grade } from '@/lib/grades';

export function GradeHistoryTable({ grades }: { grades: Grade[] }) {
  if (grades.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">No grades recorded yet.</p>;
  }

  const rows = [...grades].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <th className="py-2 font-medium">Date</th>
          <th className="py-2 font-medium">Label</th>
          <th className="py-2 text-right font-medium">Score</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((grade) => (
          <tr key={grade.id} className="border-b border-zinc-100 dark:border-zinc-900">
            <td className="py-2 text-zinc-700 dark:text-zinc-300">{grade.recordedAt}</td>
            <td className="py-2 text-zinc-700 dark:text-zinc-300">{grade.label ?? '—'}</td>
            <td className="py-2 text-right font-medium text-zinc-900 dark:text-zinc-50">{grade.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
