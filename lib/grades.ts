import { sql } from '@/lib/db';

export type Subject = {
  id: number;
  name: string;
};

export type Grade = {
  id: number;
  subjectId: number;
  pointsEarned: number;
  pointsPossible: number;
  percentage: number;
  label: string | null;
  recordedAt: string;
};

export async function getSubjects(): Promise<Subject[]> {
  const rows = await sql`SELECT id, name FROM subjects ORDER BY name ASC`;
  return rows.map((r) => ({ id: r.id, name: r.name }));
}

export async function getSubjectById(id: number): Promise<Subject | null> {
  const rows = await sql`SELECT id, name FROM subjects WHERE id = ${id}`;
  return rows[0] ? { id: rows[0].id, name: rows[0].name } : null;
}

export async function createSubject(name: string): Promise<void> {
  await sql`
    INSERT INTO subjects (name) VALUES (${name})
    ON CONFLICT (name) DO NOTHING
  `;
}

export async function getGradesBySubject(subjectId: number): Promise<Grade[]> {
  const rows = await sql`
    SELECT id, subject_id, points_earned, points_possible, label, recorded_at::text AS recorded_at
    FROM grades
    WHERE subject_id = ${subjectId}
    ORDER BY recorded_at ASC, id ASC
  `;
  return rows.map(mapGradeRow);
}

export async function getAllGradesBySubject(): Promise<Map<number, Grade[]>> {
  const rows = await sql`
    SELECT id, subject_id, points_earned, points_possible, label, recorded_at::text AS recorded_at
    FROM grades
    ORDER BY recorded_at ASC, id ASC
  `;
  const bySubject = new Map<number, Grade[]>();
  for (const row of rows) {
    const grade = mapGradeRow(row);
    const existing = bySubject.get(grade.subjectId);
    if (existing) {
      existing.push(grade);
    } else {
      bySubject.set(grade.subjectId, [grade]);
    }
  }
  return bySubject;
}

export async function getGradeById(id: number): Promise<Grade | null> {
  const rows = await sql`
    SELECT id, subject_id, points_earned, points_possible, label, recorded_at::text AS recorded_at
    FROM grades WHERE id = ${id}
  `;
  return rows[0] ? mapGradeRow(rows[0]) : null;
}

export async function addGrade(input: {
  subjectId: number;
  pointsEarned: number;
  pointsPossible: number;
  label: string | null;
  recordedAt: string;
}): Promise<number> {
  const rows = await sql`
    INSERT INTO grades (subject_id, points_earned, points_possible, label, recorded_at)
    VALUES (${input.subjectId}, ${input.pointsEarned}, ${input.pointsPossible}, ${input.label}, ${input.recordedAt})
    RETURNING id
  `;
  return rows[0].id;
}

export async function updateGrade(
  id: number,
  input: { pointsEarned: number; pointsPossible: number; label: string | null; recordedAt: string }
): Promise<void> {
  await sql`
    UPDATE grades
    SET points_earned = ${input.pointsEarned}, points_possible = ${input.pointsPossible},
        label = ${input.label}, recorded_at = ${input.recordedAt}
    WHERE id = ${id}
  `;
}

export async function deleteGrade(id: number): Promise<void> {
  await sql`DELETE FROM grades WHERE id = ${id}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapGradeRow(r: any): Grade {
  const pointsEarned = Number(r.points_earned);
  const pointsPossible = Number(r.points_possible);
  return {
    id: r.id,
    subjectId: r.subject_id,
    pointsEarned,
    pointsPossible,
    percentage: (pointsEarned / pointsPossible) * 100,
    label: r.label,
    recordedAt: r.recorded_at,
  };
}
