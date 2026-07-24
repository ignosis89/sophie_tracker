import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { Client } from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scrypt = promisify(scryptCallback);

// Kept in sync by hand with lib/auth.ts's hashPassword - this script runs as
// plain Node (no TS build step), so it can't import that file directly.
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function seedUsers(client) {
  const existing = await client.query('SELECT name FROM users');
  const existingNames = new Set(existing.rows.map((r) => r.name));

  const seeds = [
    { name: 'Aisha', password: null, isAdmin: false },
    { name: 'Suhaib', password: null, isAdmin: false },
    { name: 'Admin', password: 'Applepie1', isAdmin: true },
  ];

  for (const seed of seeds) {
    if (existingNames.has(seed.name)) continue;
    const passwordHash = seed.password ? await hashPassword(seed.password) : null;
    await client.query('INSERT INTO users (name, password_hash, is_admin) VALUES ($1, $2, $3)', [
      seed.name,
      passwordHash,
      seed.isAdmin,
    ]);
    console.log(`Seeded user: ${seed.name}`);
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set (add it to .env.local)');
  }

  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query(schemaSql);
    await seedUsers(client);
    console.log('Migration complete: schema and seed data are up to date.');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exitCode = 1;
});
