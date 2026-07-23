import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    console.log('Migration complete: subjects, grades tables are up to date.');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exitCode = 1;
});
