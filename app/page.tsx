import { getSubjects, getAllGradesBySubject } from '@/lib/grades';
import { computeSubjectMetrics, computeAggregateMetrics } from '@/lib/metrics';
import { MetricBadge } from '@/components/MetricBadge';
import { SubjectCard } from '@/components/SubjectCard';
import { AddSubjectForm } from '@/components/AddSubjectForm';
import { LogoutButton } from '@/components/LogoutButton';

export default async function DashboardPage() {
  const [subjects, gradesBySubject] = await Promise.all([getSubjects(), getAllGradesBySubject()]);

  const subjectSummaries = subjects.map((subject) => {
    const grades = gradesBySubject.get(subject.id) ?? [];
    return { subject, metrics: computeSubjectMetrics(grades) };
  });

  const aggregate = computeAggregateMetrics(subjects.map((s) => gradesBySubject.get(s.id) ?? []));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Sophia&apos;s Grades</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Overall performance across all subjects</p>
        </div>
        <LogoutButton />
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
            <SubjectCard key={subject.id} subject={subject} metrics={metrics} />
          ))}
        </div>
      )}

      <div className="mt-10">
        <AddSubjectForm />
      </div>
    </div>
  );
}
