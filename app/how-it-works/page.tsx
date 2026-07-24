import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
        ← Back to dashboard
      </Link>

      <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        How the app works, and why Improvement starts at zero
      </h1>

      <h2 className="mt-8 text-lg font-medium text-zinc-900 dark:text-zinc-50">What the app actually does</h2>

      <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
        Every time Sophia gets a grade back (a quiz, a test, homework), it gets typed into the app under her
        subject. It&apos;s entered as a fraction, like 9 out of 10, or 18 out of 20. The app works out the
        percentage on its own, so a 9/10 and an 18/20 both correctly show up as 90%, even though the raw numbers
        look different.
      </p>

      <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
        For every subject, and for all subjects combined, the app always shows two numbers:
      </p>

      <ul className="mt-4 space-y-3">
        <li className="border-l-2 border-zinc-200 pl-4 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">Her Grade</span>: the same kind of letter
          grade (A, B, C, D, F) you&apos;d see on a report card. It&apos;s the average of everything she&apos;s
          scored, turned into a letter.
        </li>
        <li className="border-l-2 border-zinc-200 pl-4 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">Her Improvement</span>: one number between
          -1 and +1 that says whether she&apos;s trending up or down lately.
        </li>
      </ul>

      <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
        There&apos;s also a simple checklist for her Qur&apos;an memorization and lessons, and a History page that
        writes down every change anyone makes: what changed, when, and who made it.
      </p>

      <h2 className="mt-10 text-lg font-medium text-zinc-900 dark:text-zinc-50">
        Why does Improvement start at zero, not at her current grade?
      </h2>

      <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-base text-zinc-900 dark:text-zinc-50">
          Grade tells you how good she is doing right now. Improvement tells you if that is changing lately, up or
          down. Zero simply means steady. It does not mean bad.
        </p>
      </div>

      <p className="mt-6 text-sm text-zinc-700 dark:text-zinc-300">Think of it like driving a car.</p>

      <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
        The speedometer tells you how fast you&apos;re going right now. That&apos;s her Grade, where she stands
        today.
      </p>

      <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
        Improvement is different. It&apos;s not the speedometer, it&apos;s whether your foot is on the gas or the
        brake. Are you speeding up, or slowing down? That has nothing to do with how fast you&apos;re already
        going.
      </p>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <svg viewBox="0 0 400 60" className="w-full" role="img" aria-label="A gauge from -1 to +1 with 0 marked as steady in the middle">
          <line x1="16" y1="24" x2="130" y2="24" className="stroke-red-600 dark:stroke-red-400" strokeWidth={3} strokeLinecap="round" />
          <line x1="130" y1="24" x2="270" y2="24" className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth={3} strokeLinecap="round" />
          <line x1="270" y1="24" x2="384" y2="24" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth={3} strokeLinecap="round" />
          <circle cx="200" cy="24" r="7" className="fill-white stroke-zinc-900 dark:fill-zinc-950 dark:stroke-zinc-50" strokeWidth={2.5} />
          <text x="16" y="50" className="fill-red-600 text-[11px] dark:fill-red-400">-1 declining</text>
          <text x="200" y="50" textAnchor="middle" className="fill-zinc-900 text-[11px] font-medium dark:fill-zinc-50">0 steady</text>
          <text x="384" y="50" textAnchor="end" className="fill-emerald-600 text-[11px] dark:fill-emerald-400">+1 improving</text>
        </svg>
      </div>

      <p className="mt-6 text-sm text-zinc-700 dark:text-zinc-300">
        If a car is cruising at a steady 60 mph, its acceleration is zero. That doesn&apos;t mean the car is
        broken, or that 60 mph is bad. It just means nothing is changing right now, in either direction.
      </p>

      <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
        That&apos;s exactly what a 0 Improvement score means for Sophia. It says steady, not behind and not ahead.
        It isn&apos;t the same question as her Grade, so it shouldn&apos;t share the same starting point.
      </p>

      <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
        Now imagine we did it the other way. If Improvement were measured against where she should be for her
        grade level, two problems show up right away:
      </p>

      <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
        <li>
          A child who&apos;s already excellent (an A student) but slipping a little would still look fine, because
          she&apos;s still doing great for her level. The warning sign gets missed.
        </li>
        <li>
          A child who&apos;s struggling (a D student) but working hard and steadily climbing would still look bad,
          because she&apos;s still behind where she should be. The good news gets missed.
        </li>
      </ul>

      <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
        Anchoring Improvement to her current level would hide the exact thing it&apos;s supposed to show. Keeping
        it anchored at zero instead, a fixed middle that never moves, means the number always means the same
        simple thing, for every subject, at every grade level, at every point in time: is she speeding up, or
        slowing down?
      </p>

      <p className="mt-6 border-t border-zinc-200 pt-6 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
        That&apos;s really the whole idea. Two numbers, answering two different questions. Grade says how good.
        Improvement says which way things are headed.
      </p>
    </div>
  );
}
