import { getBudget, saveBudget } from "./db";
import { getBackend } from './getBackend';
// adjust ../ count until it resolves
// adjust path if needed
import { buildUrl } from "./db"; // you already have buildUrl in db.ts

const BACKEND = getBackend();

export const syncBudget = async (id: string) => {
  const local = await getBudget(id);
  if (!local) return { ok: false, reason: "no-local" };

  try {
    const res = await fetch(buildUrl('/budget/sync'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(local),
    });
    const data = await res.json();
    const server = data.stored;

    if (server && (server.lastEdited || 0) > (local.lastEdited || 0)) {
      await saveBudget(server);
      return { ok: true, merged: 'pulled' };
    } else {
      // idempotent push
      await fetch(buildUrl('/budget/sync'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(local),
      });
      return { ok: true, merged: 'pushed' };
    }
  } catch (e: any) {
    const reason = e?.message ?? 'network';
    return { ok: false, reason };
  }
};

