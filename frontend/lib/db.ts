import localforage from "localforage";

export interface BudgetItem { id: string; label: string; amount: number; }
export interface Budget { id: string; month: string; income: number; items: BudgetItem[]; lastEdited: number; }

const store = localforage.createInstance({ name: "budgetbox" });

export const saveBudget = async (b: Budget) => {
  const complete = { ...b, id: b.id, lastEdited: b.lastEdited ?? Date.now() };
  await store.setItem(`budget:${complete.id}`, complete);
  return complete;
};

export const getBudget = async (id: string): Promise<Budget | null> => {
  const data = await store.getItem(`budget:${id}`);
  return data ? (data as Budget) : null;
};

export function buildUrl(path: string) {
  const rawBase = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const base = rawBase.replace(/\/+$/, '');
  const p = path.replace(/^\/+/, '');
  return `${base}/${p}`;
}
