// frontend/lib/sync.ts
import axios from "axios";
import { getBudget, saveBudget } from "./db";

const BACKEND = typeof window !== "undefined" && (process.env.NEXT_PUBLIC_BACKEND_URL ?? "") 
  ? process.env.NEXT_PUBLIC_BACKEND_URL 
  : "http://localhost:4000";

export const syncBudget = async (id: string) => {
  const local = await getBudget(id);
  if (!local) return { ok: false, reason: "no-local" };

  try {
    const res = await axios.post(`${BACKEND}/budget/sync`, local, {
      headers: { "Content-Type": "application/json" },
    });
    const server = res.data.stored;

    // last-write-wins merge
    if (server && server.lastEdited > local.lastEdited) {
      await saveBudget(server);
      return { ok: true, merged: "pulled" };
    } else {
      // ensure server has our version (idempotent push)
      await axios.post(`${BACKEND}/budget/sync`, local);
      return { ok: true, merged: "pushed" };
    }
  } catch (e: any) {
    // surface useful reason
    const reason = e?.response?.data?.error ?? e?.message ?? "network";
    return { ok: false, reason };
  }
};
