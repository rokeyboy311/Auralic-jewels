const { Client } = require('pg');

const url = "postgresql://neondb_owner:npg_zZ3uSxOhX2nW@ep-calm-boat-ax5xne7v-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log("Tables in public schema:", res.rows.map(r => r.table_name));
  } catch (err) {
    console.error('Error', err);
  } finally {
    await client.end();
  }
}
main();
