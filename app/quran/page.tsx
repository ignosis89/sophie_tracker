import { getQuranItems, QURAN_CATEGORY_ORDER } from '@/lib/quran';
import { toggleQuranItemAction } from '@/lib/quranActions';
import { NavTabs } from '@/components/NavTabs';
import { LogoutButton } from '@/components/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function QuranPage() {
  const items = await getQuranItems();
  const completedCount = items.filter((i) => i.completed).length;

  const byCategory = QURAN_CATEGORY_ORDER.map((category) => ({
    category,
    items: items.filter((i) => i.category === category),
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Quran Tracker</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {completedCount} of {items.length} complete
          </p>
        </div>
        <LogoutButton />
      </div>

      <NavTabs current="quran" />

      <div className="mt-6 space-y-8">
        {byCategory.map(({ category, items: categoryItems }) => (
          <section key={category}>
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {category}{' '}
              <span className="font-normal text-zinc-400 dark:text-zinc-600">
                ({categoryItems.filter((i) => i.completed).length}/{categoryItems.length})
              </span>
            </h2>
            <ul className="mt-2 divide-y divide-zinc-100 dark:divide-zinc-900">
              {categoryItems.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-2">
                  <form action={toggleQuranItemAction}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <button
                      type="submit"
                      aria-pressed={item.completed}
                      aria-label={item.completed ? `Mark ${item.name} incomplete` : `Mark ${item.name} complete`}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border text-sm ${
                        item.completed
                          ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500'
                          : 'border-zinc-300 text-transparent dark:border-zinc-700'
                      }`}
                    >
                      ✓
                    </button>
                  </form>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm ${
                        item.completed
                          ? 'text-zinc-500 line-through dark:text-zinc-500'
                          : 'text-zinc-900 dark:text-zinc-50'
                      }`}
                    >
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-600">{item.description}</p>
                    )}
                  </div>
                  {item.completedAt && (
                    <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-600">{item.completedAt}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
