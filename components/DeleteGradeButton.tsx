'use client';

import { deleteGradeAction } from '@/lib/actions';

export function DeleteGradeButton({ gradeId }: { gradeId: number }) {
  return (
    <form
      action={deleteGradeAction}
      onSubmit={(e) => {
        if (!confirm('Delete this grade? This cannot be undone.')) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="gradeId" value={gradeId} />
      <button type="submit" className="text-red-600 hover:underline dark:text-red-400">
        Delete
      </button>
    </form>
  );
}
