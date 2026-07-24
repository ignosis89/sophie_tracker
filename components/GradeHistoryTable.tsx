import Link from 'next/link';
import type { Grade } from '@/lib/grades';
import { DeleteGradeButton } from '@/components/DeleteGradeButton';

export function GradeHistoryTable({ grades }: { grades: Grade[] }) {
  if (grades.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">No grades in this range.</p>;
  }

  const rows = [...grades].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <th className="py-2 pr-4 font-medium">Date</th>
          <th className="py-2 pr-4 font-medium">Label</th>
          <th className="py-2 pr-4 text-right font-medium">Score</th>
          <th className="py-2 pr-4 text-right font-medium">%</th>
          <th className="py-2 pl-4 text-right font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((grade) => (
          <tr key={grade.id} className="border-b border-zinc-100 dark:border-zinc-900">
            <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">{grade.recordedAt}</td>
            <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">{grade.label ?? '—'}</td>
            <td className="py-2 pr-4 text-right text-zinc-700 dark:text-zinc-300">
              {grade.pointsEarned}/{grade.pointsPossible}
            </td>
            <td className="py-2 pr-4 text-right font-medium text-zinc-900 dark:text-zinc-50">
              {Math.round(grade.percentage)}%
            </td>
            <td className="py-2 pl-4">
              <div className="flex justify-end gap-3">
                <Link
                  href={`/subjects/${grade.subjectId}/grades/${grade.id}/edit`}
                  className="text-zinc-500 hover:underline dark:text-zinc-400"
                >
                  Edit
                </Link>
                <DeleteGradeButton gradeId={grade.id} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
