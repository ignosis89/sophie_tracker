import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSubjects, getAllGradesBySubject } from '@/lib/grades';
import {
  computeSubjectMetrics,
  computeAggregateMetrics,
  filterByDateRange,
  parseDateRangeParams,
  getDefaultDateRange,
} from '@/lib/metrics';
import { MetricBadge } from '@/components/MetricBadge';
import { SubjectCard } from '@/components/SubjectCard';
import { AddSubjectForm } from '@/components/AddSubjectForm';
import { LogoutButton } from '@/components/LogoutButton';
import { DateRangePicker } from '@/components/DateRangePicker';
import { NavTabs } from '@/components/NavTabs';
import { dateRangeQuery } from '@/lib/format';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  if (!rawParams.start && !rawParams.end && !rawParams.range) {
    const defaultRange = getDefaultDateRange();
    redirect(`/?start=${defaultRange.start}&end=${defaultRange.end}`);
  }

  const { start, end } = parseDateRangeParams(rawParams);
  const [subjects, gradesBySubject] = await Promise.all([getSubjects(), getAllGradesBySubject()]);

  const filteredGradesBySubject = subjects.map((s) => filterByDateRange(gradesBySubject.get(s.id) ?? [], { start, end }));

  const subjectSummaries = subjects.map((subject, i) => ({
    subject,
    metrics: computeSubjectMetrics(filteredGradesBySubject[i]),
  }));

  const aggregate = computeAggregateMetrics(filteredGradesBySubject);
  const query = dateRangeQuery({ start, end });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Sophia&apos;s Grades</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Overall performance across all subjects</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/how-it-works" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
            How this works
          </Link>
          <LogoutButton />
        </div>
      </div>

      <NavTabs current="dashboard" />

      <div className="mt-6">
        <DateRangePicker action="/" start={start} end={end} />
      </div>

      <div className="mt-6 flex gap-4">
        <MetricBadge label="Overall Grade" letter={aggregate.letter} size="large" />
        <MetricBadge label="Improvement" improvement={aggregate.improvement} size="large" />
      </div>

      <h2 className="mt-10 text-lg font-medium text-zinc-900 dark:text-zinc-50">Subjects</h2>
      {subjectSummaries.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No subjects yet — add one below to get started.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {subjectSummaries.map(({ subject, metrics }) => (
            <SubjectCard key={subject.id} subject={subject} metrics={metrics} query={query} />
          ))}
        </div>
      )}

      <div className="mt-10">
        <AddSubjectForm />
      </div>
    </div>
  );
}
