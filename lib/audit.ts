import { sql } from '@/lib/db';

export type GradeSnapshot = {
  pointsEarned: number;
  pointsPossible: number;
  label: string | null;
  recordedAt: string;
};

export type AuditAction = 'add' | 'edit' | 'delete';

export type AuditLogEntry = {
  id: number;
  action: AuditAction;
  gradeId: number | null;
  subjectName: string;
  actor: string | null;
  before: GradeSnapshot | null;
  after: GradeSnapshot | null;
  occurredAt: string;
};

export async function logAudit(entry: {
  action: AuditAction;
  gradeId: number | null;
  subjectId: number;
  subjectName: string;
  actor: string;
  before: GradeSnapshot | null;
  after: GradeSnapshot | null;
}): Promise<void> {
  await sql`
    INSERT INTO grade_audit_log (action, grade_id, subject_id, subject_name, actor, before_data, after_data)
    VALUES (
      ${entry.action},
      ${entry.gradeId},
      ${entry.subjectId},
      ${entry.subjectName},
      ${entry.actor},
      ${entry.before ? JSON.stringify(entry.before) : null},
      ${entry.after ? JSON.stringify(entry.after) : null}
    )
  `;
}

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  const rows = await sql`
    SELECT
      id, action, grade_id, subject_name, actor,
      before_data::text AS before_data,
      after_data::text AS after_data,
      occurred_at::text AS occurred_at
    FROM grade_audit_log
    ORDER BY occurred_at DESC, id DESC
  `;
  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    gradeId: r.grade_id,
    subjectName: r.subject_name,
    actor: r.actor,
    before: r.before_data ? JSON.parse(r.before_data) : null,
    after: r.after_data ? JSON.parse(r.after_data) : null,
    occurredAt: r.occurred_at,
  }));
}

function formatSnapshotScore(s: GradeSnapshot): string {
  const percentage = Math.round((s.pointsEarned / s.pointsPossible) * 100);
  return `${s.pointsEarned}/${s.pointsPossible} (${percentage}%)`;
}

export function describeAuditEntry(entry: AuditLogEntry): string {
  if (entry.action === 'add' && entry.after) {
    return `Added ${formatSnapshotScore(entry.after)}${entry.after.label ? ` (${entry.after.label})` : ''} on ${entry.after.recordedAt}`;
  }
  if (entry.action === 'delete' && entry.before) {
    return `Deleted ${formatSnapshotScore(entry.before)}${entry.before.label ? ` (${entry.before.label})` : ''} from ${entry.before.recordedAt}`;
  }
  if (entry.action === 'edit' && entry.before && entry.after) {
    const changes: string[] = [];
    if (entry.before.pointsEarned !== entry.after.pointsEarned || entry.before.pointsPossible !== entry.after.pointsPossible) {
      changes.push(`score ${formatSnapshotScore(entry.before)} → ${formatSnapshotScore(entry.after)}`);
    }
    if (entry.before.label !== entry.after.label) {
      changes.push(`label "${entry.before.label ?? '—'}" → "${entry.after.label ?? '—'}"`);
    }
    if (entry.before.recordedAt !== entry.after.recordedAt) {
      changes.push(`date ${entry.before.recordedAt} → ${entry.after.recordedAt}`);
    }
    return changes.length > 0 ? changes.join(', ') : 'No changes';
  }
  return '—';
}

export type QuranAuditAction = 'complete' | 'uncomplete';

export type QuranAuditLogEntry = {
  id: number;
  action: QuranAuditAction;
  itemId: number | null;
  itemName: string;
  category: string;
  actor: string | null;
  occurredAt: string;
};

export async function logQuranAudit(entry: {
  action: QuranAuditAction;
  itemId: number;
  itemName: string;
  category: string;
  actor: string;
}): Promise<void> {
  await sql`
    INSERT INTO quran_audit_log (action, item_id, item_name, category, actor)
    VALUES (${entry.action}, ${entry.itemId}, ${entry.itemName}, ${entry.category}, ${entry.actor})
  `;
}

export async function getQuranAuditLog(): Promise<QuranAuditLogEntry[]> {
  const rows = await sql`
    SELECT id, action, item_id, item_name, category, actor, occurred_at::text AS occurred_at
    FROM quran_audit_log
    ORDER BY occurred_at DESC, id DESC
  `;
  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    itemId: r.item_id,
    itemName: r.item_name,
    category: r.category,
    actor: r.actor,
    occurredAt: r.occurred_at,
  }));
}
