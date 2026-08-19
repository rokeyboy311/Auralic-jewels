import fs from 'fs';
import path from 'path';
import { getDbPool } from './connection';

async function runMigration() {
  const pool = getDbPool();
  if (!pool) {
    console.error('Migration halted: DATABASE_URL is not set.');
    process.exit(1);
  }

  try {
    console.log('Beginning database migration...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schemaSql);
    console.log('Database schema successfully migrated to PostgreSQL/Neon.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
