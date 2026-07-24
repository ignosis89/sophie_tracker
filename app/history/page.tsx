import {
  getAuditLog,
  describeAuditEntry,
  getQuranAuditLog,
  type AuditAction,
  type QuranAuditAction,
} from '@/lib/audit';
import { LogoutButton } from '@/components/LogoutButton';
import { NavTabs } from '@/components/NavTabs';
import { formatTimestamp } from '@/lib/format';

export const dynamic = 'force-dynamic';

const GRADE_ACTION_STYLES: Record<AuditAction, string> = {
  add: 'text-emerald-600 dark:text-emerald-400',
  edit: 'text-blue-600 dark:text-blue-400',
  delete: 'text-red-600 dark:text-red-400',
};

const GRADE_ACTION_LABELS: Record<AuditAction, string> = {
  add: 'Added',
  edit: 'Edited',
  delete: 'Deleted',
};

const QURAN_ACTION_STYLES: Record<QuranAuditAction, string> = {
  complete: 'text-emerald-600 dark:text-emerald-400',
  uncomplete: 'text-zinc-500 dark:text-zinc-400',
};

const QURAN_ACTION_LABELS: Record<QuranAuditAction, string> = {
  complete: 'Completed',
  uncomplete: 'Unmarked',
};

type Row = {
  key: string;
  occurredAt: string;
  actionLabel: string;
  actionClass: string;
  subject: string;
  details: string;
  actor: string;
};

export default async function HistoryPage() {
  const [gradeEntries, quranEntries] = await Promise.all([getAuditLog(), getQuranAuditLog()]);

  const rows: Row[] = [
    ...gradeEntries.map((entry) => ({
      key: `grade-${entry.id}`,
      occurredAt: entry.occurredAt,
      actionLabel: GRADE_ACTION_LABELS[entry.action],
      actionClass: GRADE_ACTION_STYLES[entry.action],
      subject: entry.subjectName,
      details: describeAuditEntry(entry),
      actor: entry.actor ?? '—',
    })),
    ...quranEntries.map((entry) => ({
      key: `quran-${entry.id}`,
      occurredAt: entry.occurredAt,
      actionLabel: QURAN_ACTION_LABELS[entry.action],
      actionClass: QURAN_ACTION_STYLES[entry.action],
      subject: `Quran - ${entry.category}`,
      details: entry.itemName,
      actor: entry.actor ?? '—',
    })),
  ].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">History</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Every grade and Quran item added, edited, completed, or deleted</p>
        </div>
        <LogoutButton />
      </div>

      <NavTabs current="history" />

      <div className="mt-6">
        {rows.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No activity yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="py-2 pr-4 font-medium">When</th>
                <th className="py-2 pr-4 font-medium">By</th>
                <th className="py-2 pr-4 font-medium">Action</th>
                <th className="py-2 pr-4 font-medium">Subject</th>
                <th className="py-2 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="whitespace-nowrap py-2 pr-4 text-zinc-500 dark:text-zinc-400">
                    {formatTimestamp(row.occurredAt)}
                  </td>
                  <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">{row.actor}</td>
                  <td className={`py-2 pr-4 font-medium ${row.actionClass}`}>{row.actionLabel}</td>
                  <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">{row.subject}</td>
                  <td className="py-2 text-zinc-700 dark:text-zinc-300">{row.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
