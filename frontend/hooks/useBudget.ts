import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Budget, saveBudget } from "../lib/db";

type State = {
  budget: Budget | null;
  setBudget: (b: Budget) => void;
  updateBudget: (p: Partial<Budget>) => void;
};

export const useBudget = create<State>()(
  persist(
    (set) => ({
      budget: null,
      setBudget: (b) => { saveBudget(b); set({ budget: b }); },
      updateBudget: (patch) => set((s) => {
        if (!s.budget) return {};
        const updated = { ...s.budget, ...patch, lastEdited: Date.now() } as Budget;
        saveBudget(updated);
        return { budget: updated };
      })
    }),
    { name: "budgetbox-storage" }
  )
);
