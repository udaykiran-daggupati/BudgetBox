require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();

// --- CORS: during debugging you can allow all, but set your VERCEL domain for production.
const VERCEL_ORIGIN = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL || ''; 
if (VERCEL_ORIGIN) {
  // if VERCEL_ORIGIN might be "your-app.vercel.app", ensure https:// prefix
  const origin = VERCEL_ORIGIN.startsWith('http') ? VERCEL_ORIGIN : `https://${VERCEL_ORIGIN}`;
  app.use(cors({ origin }));
  console.log('CORS origin restricted to:', origin);
} else {
  app.use(cors()); // fallback - open while debugging
  console.log('CORS: OPEN (no VERCEL origin provided).');
}

app.use((req, res, next) => {
  console.log(`[req] ${req.method} ${req.url}`);
  next();
});


// DATABASE
const DATABASE_URL = process.env.DATABASE_URL || process.env.Postgres_DATABASE_URL || null;
if (!DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL is missing. The app will not be able to persist data.');
}

const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } }) : null;

// quick DB connection test on startup
async function testDb() {
  if (!pool) return console.warn('DB pool not created (no DATABASE_URL).');
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('Connected to Postgres successfully.');
  } catch (err) {
    console.error('Postgres connection test failed:', err.message || err);
  }
}
testDb().catch((e) => console.error('testDb error', e));

// helper: get/save budget
async function getBudgetFromDb(id) {
  if (!pool) return null;
  const r = await pool.query('SELECT data FROM budgets WHERE id=$1', [id]);
  return r.rowCount ? r.rows[0].data : null;
}

async function saveBudgetToDb(id, obj) {
  if (!pool) throw new Error('No DB pool');
  // store as JSON (pg will convert JS object to jsonb param) - but we ensure object is valid JSON
  const json = typeof obj === 'string' ? JSON.parse(obj) : obj;
  const q = `
    INSERT INTO budgets(id, data, created_at, updated_at)
    VALUES ($1, $2, now(), now())
    ON CONFLICT (id) DO UPDATE
      SET data = EXCLUDED.data,
          updated_at = now()
    RETURNING data;
  `;
  const r = await pool.query(q, [id, json]);
  return r.rows[0].data;
}

// sync endpoint (LWW)
app.post('/budget/sync', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.id) return res.status(400).json({ ok:false, error:'missing id' });
    const id = payload.id;
    const server = await getBudgetFromDb(id);
    if (!server || (payload.lastEdited || 0) > (server.lastEdited || 0)) {
      const stored = await saveBudgetToDb(id, payload);
      return res.json({ ok:true, stored, merged:'pushed' });
    } else {
      return res.json({ ok:true, stored: server, merged:'pulled' });
    }
  } catch (err) {
    console.error('sync error', err && err.stack ? err.stack : err);
    return res.status(500).json({ ok:false, error: err.message || String(err) });
  }
});

// fetch budget
app.get('/budget', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ ok:false, error:'missing id' });
    const server = await getBudgetFromDb(id);
    return res.json({ ok:true, stored: server ?? null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok:false, error: err.message });
  }
});

// update routes...
// (keep your other routes here: /budget/update, /budget/item/update, /budget/item/delete)

// friendly root + health
app.get('/', (req, res) => res.send('BudgetBox backend is running. Hit /health or /budget'));
app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`BudgetBox backend listening on ${PORT}`));
