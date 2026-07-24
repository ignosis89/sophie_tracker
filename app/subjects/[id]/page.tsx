import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSubjectById, getGradesBySubject } from '@/lib/grades';
import { computeSubjectMetrics, filterByDateRange, parseDateRangeParams, getDefaultDateRange } from '@/lib/metrics';
import { MetricBadge } from '@/components/MetricBadge';
import { GradeHistoryChart } from '@/components/GradeHistoryChart';
import { GradeHistoryTable } from '@/components/GradeHistoryTable';
import { AddGradeForm } from '@/components/AddGradeForm';
import { DateRangePicker } from '@/components/DateRangePicker';
import { dateRangeQuery } from '@/lib/format';

export default async function SubjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const subjectId = Number(id);

  const rawParams = await searchParams;
  if (!rawParams.start && !rawParams.end && !rawParams.range) {
    const defaultRange = getDefaultDateRange();
    redirect(`/subjects/${id}?start=${defaultRange.start}&end=${defaultRange.end}`);
  }
  const { start, end } = parseDateRangeParams(rawParams);

  const subject = Number.isFinite(subjectId) ? await getSubjectById(subjectId) : null;
  if (!subject) notFound();

  const allGrades = await getGradesBySubject(subject.id);
  const grades = filterByDateRange(allGrades, { start, end });
  const metrics = computeSubjectMetrics(grades);
  const query = dateRangeQuery({ start, end });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href={`/${query}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{subject.name}</h1>

      <div className="mt-6">
        <DateRangePicker action={`/subjects/${subject.id}`} start={start} end={end} />
      </div>

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
