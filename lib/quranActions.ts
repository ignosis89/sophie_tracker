'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';
import { getQuranItemById, setQuranItemCompletion } from '@/lib/quran';
import { logQuranAudit } from '@/lib/audit';

export async function toggleQuranItemAction(formData: FormData): Promise<void> {
  const session = await requireSession();

  const itemId = Number(formData.get('itemId'));
  if (!Number.isFinite(itemId)) return;

  const item = await getQuranItemById(itemId);
  if (!item) return;

  const nowCompleted = !item.completed;
  const completedAt = nowCompleted ? new Date().toISOString().slice(0, 10) : null;

  await setQuranItemCompletion(itemId, nowCompleted, completedAt);
  await logQuranAudit({
    action: nowCompleted ? 'complete' : 'uncomplete',
    itemId,
    itemName: item.name,
    category: item.category,
    actor: session.name,
  });

  revalidatePath('/quran');
  revalidatePath('/history');
}
