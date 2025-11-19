"use client";

import { useEffect } from "react";
import { useBudget } from "../hooks/useBudget";
import BudgetForm from "../components/BudgetForm";
import Dashboard from "../components/Dashboard";
import SyncButton from "../components/SyncButton"; // <-- add this

export default function Home() {
  const { budget, setBudget } = useBudget();

  useEffect(() => {
    if (!budget) {
      setBudget({
        id: "demo-budget",
        month: "January 2025",
        income: 50000,
        items: [],
        lastEdited: Date.now()
      });
    }
  }, [budget, setBudget]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">BudgetBox</h1>
      {budget && (
        <>
          <BudgetForm />
          <Dashboard />
          <SyncButton id={budget.id} />    {/* <-- Sync button here */}
        </>
      )}
    </div>
  );
}
