import { sql } from '@/lib/db';

export const QURAN_CATEGORY_ORDER = ['Salah', 'Qaida', 'Surahs'];

export type QuranItem = {
  id: number;
  category: string;
  name: string;
  description: string | null;
  sortOrder: number;
  completed: boolean;
  completedAt: string | null;
};

export async function getQuranItems(): Promise<QuranItem[]> {
  const rows = await sql`
    SELECT id, category, name, description, sort_order, completed, completed_at::text AS completed_at
    FROM quran_items
    ORDER BY sort_order
  `;
  const items = rows.map(mapItemRow);
  return items.sort(
    (a, b) => QURAN_CATEGORY_ORDER.indexOf(a.category) - QURAN_CATEGORY_ORDER.indexOf(b.category) || a.sortOrder - b.sortOrder
  );
}

export async function getQuranItemById(id: number): Promise<QuranItem | null> {
  const rows = await sql`
    SELECT id, category, name, description, sort_order, completed, completed_at::text AS completed_at
    FROM quran_items WHERE id = ${id}
  `;
  return rows[0] ? mapItemRow(rows[0]) : null;
}

export async function setQuranItemCompletion(
  id: number,
  completed: boolean,
  completedAt: string | null
): Promise<void> {
  await sql`
    UPDATE quran_items SET completed = ${completed}, completed_at = ${completedAt}
    WHERE id = ${id}
  `;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapItemRow(r: any): QuranItem {
  return {
    id: r.id,
    category: r.category,
    name: r.name,
    description: r.description,
    sortOrder: r.sort_order,
    completed: r.completed,
    completedAt: r.completed_at,
  };
}
