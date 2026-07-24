import Link from 'next/link';

const TABS = [
  { href: '/', key: 'dashboard', label: 'Dashboard' },
  { href: '/quran', key: 'quran', label: 'Quran' },
  { href: '/history', key: 'history', label: 'History' },
] as const;

export function NavTabs({ current }: { current: 'dashboard' | 'quran' | 'history' }) {
  return (
    <nav className="mt-4 flex gap-4 border-b border-zinc-200 text-sm dark:border-zinc-800">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`-mb-px border-b-2 pb-2 ${
            current === tab.key
              ? 'border-zinc-900 font-medium text-zinc-900 dark:border-zinc-50 dark:text-zinc-50'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
