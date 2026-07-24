import { sql } from '@/lib/db';

export type User = {
  id: number;
  name: string;
  passwordHash: string | null;
  isAdmin: boolean;
};

export async function getUserNames(): Promise<string[]> {
  const rows = await sql`SELECT name FROM users ORDER BY id ASC`;
  return rows.map((r) => r.name);
}

export async function getUserByName(name: string): Promise<User | null> {
  const rows = await sql`SELECT id, name, password_hash, is_admin FROM users WHERE name = ${name}`;
  const r = rows[0];
  return r ? { id: r.id, name: r.name, passwordHash: r.password_hash, isAdmin: r.is_admin } : null;
}

export async function setUserPassword(id: number, passwordHash: string): Promise<void> {
  await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${id}`;
}
