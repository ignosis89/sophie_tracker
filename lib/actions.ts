'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSessionToken, requireSession } from '@/lib/auth';
import { createSubject, addGrade } from '@/lib/grades';
import { SESSION_COOKIE_NAME, SESSION_DURATION_MS } from '@/lib/constants';

export type LoginState = { error?: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get('password');

  if (typeof password !== 'string' || password.length === 0 || password !== process.env.SITE_PASSWORD) {
    return { error: 'Incorrect password' };
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000,
  });

  redirect('/');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect('/login');
}

export async function addSubjectAction(formData: FormData): Promise<void> {
  await requireSession();

  const name = formData.get('name');
  if (typeof name !== 'string' || !name.trim()) return;

  await createSubject(name.trim());
  revalidatePath('/');
}

export async function addGradeAction(formData: FormData): Promise<void> {
  await requireSession();

  const subjectId = Number(formData.get('subjectId'));
  const score = Number(formData.get('score'));
  const label = formData.get('label');
  const recordedAt = formData.get('recordedAt');

  if (!Number.isFinite(subjectId) || !Number.isFinite(score) || score < 0 || score > 100) return;
  if (typeof recordedAt !== 'string' || !recordedAt) return;

  await addGrade({
    subjectId,
    score,
    label: typeof label === 'string' && label.trim() ? label.trim() : null,
    recordedAt,
  });

  revalidatePath('/');
  revalidatePath(`/subjects/${subjectId}`);
}
