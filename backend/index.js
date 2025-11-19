// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATABASE_URL = process.env.DATABASE_URL;
const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL }) : null;

async function getBudgetFromDb(id) {
  if (!pool) return null;
  const r = await pool.query('SELECT data FROM budgets WHERE id=$1', [id]);
  return r.rowCount ? r.rows[0].data : null;
}

async function saveBudgetToDb(id, obj) {
  if (!pool) throw new Error('No DB pool');
  const q = `
    INSERT INTO budgets(id, data, created_at, updated_at)
    VALUES ($1, $2, now(), now())
    ON CONFLICT (id) DO UPDATE
      SET data = EXCLUDED.data,
          updated_at = now()
    RETURNING data;
  `;
  const r = await pool.query(q, [id, obj]);
  return r.rows[0].data;
}

// sync endpoint (LWW)
app.post('/budget/sync', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.id) return res.status(400).json({ ok:false, error:'missing id' });
    const id = payload.id;
    const server = await getBudgetFromDb(id);
    if (!server || payload.lastEdited > server.lastEdited) {
      const stored = await saveBudgetToDb(id, payload);
      return res.json({ ok:true, stored, merged:'pushed' });
    } else {
      return res.json({ ok:true, stored: server, merged:'pulled' });
    }
  } catch (err) {
    console.error('sync error', err);
    return res.status(500).json({ ok:false, error: err.message });
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

// update budget metadata (income, month, etc.)
app.post('/budget/update', async (req, res) => {
  try {
    const { id, patch } = req.body;
    if (!id || !patch) return res.status(400).json({ ok:false, error:'missing id or patch' });
    const server = await getBudgetFromDb(id);
    if (!server) return res.status(404).json({ ok:false, error:'not found' });
    const updated = { ...server, ...patch, lastEdited: Date.now() };
    const stored = await saveBudgetToDb(id, updated);
    return res.json({ ok:true, stored });
  } catch (err) {
    console.error('update budget error', err);
    return res.status(500).json({ ok:false, error: err.message });
  }
});

// update single item
app.post('/budget/item/update', async (req, res) => {
  try {
    const { id, item } = req.body;
    if (!id || !item || !item.id) return res.status(400).json({ ok:false, error:'missing id or item' });
    const server = await getBudgetFromDb(id);
    if (!server) return res.status(404).json({ ok:false, error:'not found' });
    const items = Array.isArray(server.items) ? server.items.slice() : [];
    const idx = items.findIndex((it) => it.id === item.id);
    if (idx === -1) return res.status(404).json({ ok:false, error:'item not found' });
    items[idx] = item;
    const updated = { ...server, items, lastEdited: Date.now() };
    const stored = await saveBudgetToDb(id, updated);
    return res.json({ ok:true, stored });
  } catch (err) {
    console.error('item update error', err);
    return res.status(500).json({ ok:false, error: err.message });
  }
});

// delete single item
app.post('/budget/item/delete', async (req, res) => {
  try {
    const { id, itemId } = req.body;
    if (!id || !itemId) return res.status(400).json({ ok:false, error:'missing id or itemId' });
    const server = await getBudgetFromDb(id);
    if (!server) return res.status(404).json({ ok:false, error:'not found' });
    const items = Array.isArray(server.items) ? server.items.filter((it) => it.id !== itemId) : [];
    const updated = { ...server, items, lastEdited: Date.now() };
    const stored = await saveBudgetToDb(id, updated);
    return res.json({ ok:true, stored });
  } catch (err) {
    console.error('item delete error', err);
    return res.status(500).json({ ok:false, error: err.message });
  }
});

app.get('/', (req, res) => res.send('BudgetBox backend is running. Hit /health or /budget'));


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`BudgetBox backend listening on ${PORT}`));