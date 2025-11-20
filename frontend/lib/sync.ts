import { getBudget, saveBudget } from "./db";
import { getBackend } from './getBackend';
// adjust ../ count until it resolves
// adjust path if needed
import { buildUrl } from "./db"; // you already have buildUrl in db.ts

const BACKEND = getBackend();

export const syncBudget = async (id: string) => {
  const local = await getBudget(id);
  if (!local) return { ok: false, reason: "no-local" };

  // Ensure required fields exist
  const payload = {
    ...local,
    id: local.id,
    lastEdited: local.lastEdited || Date.now(),
  };

  try {
    const res = await fetch(buildUrl('/budget/sync'), {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    const server = data.stored;

    if (server && (server.lastEdited || 0) > (local.lastEdited || 0)) {
      await saveBudget(server);
      return { ok: true, merged: "pulled" };
    } else {
      await fetch(buildUrl('/budget/sync'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return { ok: true, merged: "pushed" };
    }
  } catch (e: any) {
    return { ok: false, reason: e.message ?? "network" };
  }
};

