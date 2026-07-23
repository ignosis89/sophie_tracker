import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSubjectById, getGradesBySubject } from '@/lib/grades';
import { computeSubjectMetrics } from '@/lib/metrics';
import { MetricBadge } from '@/components/MetricBadge';
import { GradeHistoryChart } from '@/components/GradeHistoryChart';
import { GradeHistoryTable } from '@/components/GradeHistoryTable';
import { AddGradeForm } from '@/components/AddGradeForm';

export default async function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subjectId = Number(id);

  const subject = Number.isFinite(subjectId) ? await getSubjectById(subjectId) : null;
  if (!subject) notFound();

  const grades = await getGradesBySubject(subject.id);
  const metrics = computeSubjectMetrics(grades);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{subject.name}</h1>

      <div className="mt-6 flex gap-4">
        <MetricBadge label="Grade" letter={metrics.letter} />
        <MetricBadge label="Improvement" improvement={metrics.improvement} />
      </div>

      {grades.length > 0 && (
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <GradeHistoryChart grades={grades} />
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">Grade history</h2>
        <GradeHistoryTable grades={grades} />
      </div>

      <div className="mt-8">
        <h2 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">Add a grade</h2>
        <AddGradeForm subjectId={subject.id} />
      </div>
    </div>
  );
}
