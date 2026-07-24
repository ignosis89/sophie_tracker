import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSubjectById, getGradeById } from '@/lib/grades';
import { editGradeAction } from '@/lib/actions';

const inputClasses =
  'w-full min-w-0 rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-zinc-100';

export default async function EditGradePage({
  params,
}: {
  params: Promise<{ id: string; gradeId: string }>;
}) {
  const { id, gradeId } = await params;
  const subjectId = Number(id);
  const parsedGradeId = Number(gradeId);

  const subject = Number.isFinite(subjectId) ? await getSubjectById(subjectId) : null;
  const grade = Number.isFinite(parsedGradeId) ? await getGradeById(parsedGradeId) : null;
  if (!subject || !grade || grade.subjectId !== subject.id) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/subjects/${subject.id}`}
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
      >
        ← Back to {subject.name}
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Edit grade</h1>

      <form action={editGradeAction} className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <input type="hidden" name="gradeId" value={grade.id} />
        <div className="flex items-center gap-1">
          <input
            type="number"
            name="pointsEarned"
            min={0}
            step="0.01"
            required
            defaultValue={grade.pointsEarned}
            className={inputClasses}
          />
          <span className="text-zinc-400 dark:text-zinc-600">/</span>
          <input
            type="number"
            name="pointsPossible"
            min={0.01}
            step="0.01"
            required
            defaultValue={grade.pointsPossible}
            className={inputClasses}
          />
        </div>
        <input type="date" name="recordedAt" required defaultValue={grade.recordedAt} className={inputClasses} />
        <input
          type="text"
          name="label"
          placeholder="Label (optional)"
          defaultValue={grade.label ?? ''}
          className={inputClasses}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
          >
            Save
          </button>
          <Link
            href={`/subjects/${subject.id}`}
            className="flex items-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
