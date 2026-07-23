import { sql } from '@/lib/db';

export type Subject = {
  id: number;
  name: string;
};

export type Grade = {
  id: number;
  subjectId: number;
  score: number;
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
    SELECT id, subject_id, score, label, recorded_at::text AS recorded_at
    FROM grades
    WHERE subject_id = ${subjectId}
    ORDER BY recorded_at ASC, id ASC
  `;
  return rows.map(mapGradeRow);
}

export async function getAllGradesBySubject(): Promise<Map<number, Grade[]>> {
  const rows = await sql`
    SELECT id, subject_id, score, label, recorded_at::text AS recorded_at
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

export async function addGrade(input: {
  subjectId: number;
  score: number;
  label: string | null;
  recordedAt: string;
}): Promise<void> {
  await sql`
    INSERT INTO grades (subject_id, score, label, recorded_at)
    VALUES (${input.subjectId}, ${input.score}, ${input.label}, ${input.recordedAt})
  `;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapGradeRow(r: any): Grade {
  return {
    id: r.id,
    subjectId: r.subject_id,
    score: Number(r.score),
    label: r.label,
    recordedAt: r.recorded_at,
  };
}
