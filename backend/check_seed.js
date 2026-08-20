const { Client } = require('pg');
const url = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_zZ3uSxOhX2nW@ep-calm-boat-ax5xne7v-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";
async function main() {
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const res = await client.query(`SELECT count(*) FROM products;`);
    console.log("Products count:", res.rows[0].count);
  } catch(e) { console.error(e); }
  await client.end();
}
main();
