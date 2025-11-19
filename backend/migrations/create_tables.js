// backend/migrations/create_tables.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const q = `
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `;
  try {
    await pool.query(q);
    console.log('migrations applied');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('migration failed', err);
    process.exit(1);
  }
}
run();
