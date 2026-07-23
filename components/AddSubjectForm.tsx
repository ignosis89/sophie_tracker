import { addSubjectAction } from '@/lib/actions';

export function AddSubjectForm() {
  return (
    <form action={addSubjectAction} className="flex gap-2">
      <input
        type="text"
        name="name"
        required
        placeholder="New subject name"
        className="flex-1 rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-zinc-100"
      />
      <button
        type="submit"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
      >
        Add Subject
      </button>
    </form>
  );
}
