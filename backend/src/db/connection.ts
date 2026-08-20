import { Pool } from 'pg';
import { config } from '../config';

let pool: Pool | null = null;

export function getDbPool(): Pool | null {
  if (pool) return pool;

  if (!config.databaseUrl) {
    console.warn('[Auralic Database] DATABASE_URL not set. Running in development memory-fallback mode.');
    return null;
  }

  try {
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: config.env === 'production' ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[Auralic Database] Unexpected error on idle PostgreSQL client', err);
    });

    return pool;
  } catch (err) {
    console.error('[Auralic Database] Failed to initialize PostgreSQL pool', err);
    return null;
  }
}

export async function checkDbHealth(): Promise<boolean> {
  const p = getDbPool();
  if (!p) return false;
  try {
    const res = await p.query('SELECT 1');
    return (res.rowCount ?? 0) > 0;
  } catch (err) {
    console.error('[Auralic Database] Health check query failed', err);
    return false;
  }
}
