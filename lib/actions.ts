'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSessionToken, requireSession, hashPassword, verifyPassword } from '@/lib/auth';
import { createSubject, addGrade, updateGrade, deleteGrade, getGradeById, getSubjectById } from '@/lib/grades';
import { getUserByName, setUserPassword } from '@/lib/users';
import { logAudit } from '@/lib/audit';
import { SESSION_COOKIE_NAME, SESSION_DURATION_MS } from '@/lib/constants';

export type LoginState = { error?: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const name = formData.get('name');
  const password = formData.get('password');

  if (typeof name !== 'string' || !name) {
    return { error: 'Select your name' };
  }
  if (typeof password !== 'string' || password.length === 0) {
    return { error: 'Enter a password' };
  }

  const user = await getUserByName(name);
  if (!user) {
    return { error: 'Unknown user' };
  }

  if (user.passwordHash === null) {
    // First time this account is used - whatever is submitted becomes its password.
    const passwordHash = await hashPassword(password);
    await setUserPassword(user.id, passwordHash);
  } else {
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { error: 'Incorrect password' };
    }
  }

  const token = await createSessionToken({ userId: user.id, name: user.name, isAdmin: user.isAdmin });
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
  const session = await requireSession();

  const subjectId = Number(formData.get('subjectId'));
  const pointsEarned = Number(formData.get('pointsEarned'));
  const pointsPossible = Number(formData.get('pointsPossible'));
  const label = formData.get('label');
  const recordedAt = formData.get('recordedAt');

  if (!Number.isFinite(subjectId)) return;
  if (!Number.isFinite(pointsEarned) || pointsEarned < 0) return;
  if (!Number.isFinite(pointsPossible) || pointsPossible <= 0) return;
  if (typeof recordedAt !== 'string' || !recordedAt) return;

  const subject = await getSubjectById(subjectId);
  if (!subject) return;

  const after = {
    pointsEarned,
    pointsPossible,
    label: typeof label === 'string' && label.trim() ? label.trim() : null,
    recordedAt,
  };

  const gradeId = await addGrade({ subjectId, ...after });
  await logAudit({ action: 'add', gradeId, subjectId, subjectName: subject.name, actor: session.name, before: null, after });

  revalidatePath('/');
  revalidatePath(`/subjects/${subjectId}`);
  revalidatePath('/history');
}

export async function editGradeAction(formData: FormData): Promise<void> {
  const session = await requireSession();

  const gradeId = Number(formData.get('gradeId'));
  const pointsEarned = Number(formData.get('pointsEarned'));
  const pointsPossible = Number(formData.get('pointsPossible'));
  const label = formData.get('label');
  const recordedAt = formData.get('recordedAt');

  if (!Number.isFinite(gradeId)) return;
  if (!Number.isFinite(pointsEarned) || pointsEarned < 0) return;
  if (!Number.isFinite(pointsPossible) || pointsPossible <= 0) return;
  if (typeof recordedAt !== 'string' || !recordedAt) return;

  const existing = await getGradeById(gradeId);
  if (!existing) return;

  const subject = await getSubjectById(existing.subjectId);
  if (!subject) return;

  const before = {
    pointsEarned: existing.pointsEarned,
    pointsPossible: existing.pointsPossible,
    label: existing.label,
    recordedAt: existing.recordedAt,
  };
  const after = {
    pointsEarned,
    pointsPossible,
    label: typeof label === 'string' && label.trim() ? label.trim() : null,
    recordedAt,
  };

  await updateGrade(gradeId, after);
  await logAudit({
    action: 'edit',
    gradeId,
    subjectId: subject.id,
    subjectName: subject.name,
    actor: session.name,
    before,
    after,
  });

  revalidatePath('/');
  revalidatePath(`/subjects/${existing.subjectId}`);
  revalidatePath('/history');
  redirect(`/subjects/${existing.subjectId}`);
}

export async function deleteGradeAction(formData: FormData): Promise<void> {
  const session = await requireSession();

  const gradeId = Number(formData.get('gradeId'));
  if (!Number.isFinite(gradeId)) return;

  const existing = await getGradeById(gradeId);
  if (!existing) return;

  const subject = await getSubjectById(existing.subjectId);
  if (!subject) return;

  const before = {
    pointsEarned: existing.pointsEarned,
    pointsPossible: existing.pointsPossible,
    label: existing.label,
    recordedAt: existing.recordedAt,
  };

  await deleteGrade(gradeId);
  await logAudit({
    action: 'delete',
    gradeId,
    subjectId: subject.id,
    subjectName: subject.name,
    actor: session.name,
    before,
    after: null,
  });

  revalidatePath('/');
  revalidatePath(`/subjects/${existing.subjectId}`);
  revalidatePath('/history');
}
