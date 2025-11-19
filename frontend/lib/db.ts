import localforage from "localforage";

export interface BudgetItem {
  id: string;
  label: string;
  amount: number;
}

export interface Budget {
  id: string;
  month: string;
  income: number;
  items: BudgetItem[];
  lastEdited: number;
}

const store = localforage.createInstance({ name: "budgetbox" });

export const saveBudget = async (b: Budget) => {
  await store.setItem(`budget:${b.id}`, b);
  return b;
};

export const getBudget = async (id: string) => {
  return (await store.getItem<Budget>(`budget:${id}`)) ?? null;
};
