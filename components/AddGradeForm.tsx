import { addGradeAction } from '@/lib/actions';

const inputClasses =
  'rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-zinc-100';

export function AddGradeForm({ subjectId }: { subjectId: number }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={addGradeAction} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <input type="hidden" name="subjectId" value={subjectId} />
      <input
        type="number"
        name="score"
        min={0}
        max={100}
        step="0.1"
        required
        placeholder="Score (0-100)"
        className={inputClasses}
      />
      <input type="date" name="recordedAt" required defaultValue={today} className={inputClasses} />
      <input type="text" name="label" placeholder="Label (optional)" className={inputClasses} />
      <button
        type="submit"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
      >
        Add Grade
      </button>
    </form>
  );
}
