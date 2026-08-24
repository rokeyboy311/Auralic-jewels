import fs from 'fs';
import path from 'path';
import { getDbPool } from './connection';

/**
 * Enterprise Schema Migration Runner for Maison Auralic PostgreSQL Database
 * Ensures idempotent, sequential execution of SQL migrations with tracking table.
 */
export async function runMigrations() {
  const pool = getDbPool();
  if (!pool) {
    throw new Error('Cannot run migrations: PostgreSQL pool is not initialized.');
  }

  const client = await pool.connect();
  try {
    console.log('🔄 Checking database migration status...');

    // 1. Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Discover migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('ℹ️ No migrations directory found. Skipping schema migrations.');
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    // 3. Fetch already applied migrations
    const appliedRes = await client.query('SELECT name FROM schema_migrations');
    const appliedNames = new Set(appliedRes.rows.map((r) => r.name));

    // 4. Apply pending migrations inside a transaction
    for (const file of files) {
      if (!appliedNames.has(file)) {
        console.log(`⚡ Applying pending migration: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`✅ Migration applied successfully: ${file}`);
        } catch (err: any) {
          await client.query('ROLLBACK');
          console.error(`❌ Migration failed on ${file}:`, err.message);
          throw err;
        }
      }
    }

    console.log('✨ All database migrations are up to date.');
  } finally {
    client.release();
  }
}

// Standalone CLI execution
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migration process finished cleanly.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal migration error:', err);
      process.exit(1);
    });
}
