import fs from 'fs';
import path from 'path';
import { getDbPool } from './connection';

async function runSeed() {
  const pool = getDbPool();
  if (!pool) {
    console.error('Seed halted: DATABASE_URL is not set.');
    process.exit(1);
  }

  try {
    console.log('Seeding demo high-jewellery inventory & accounts...');
    const seedsSql = fs.readFileSync(path.join(__dirname, 'seeds.sql'), 'utf-8');
    await pool.query(seedsSql);
    console.log('Database seeded successfully with Haute Joaillerie collections.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

runSeed();
