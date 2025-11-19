"use client";

import { useEffect, useState } from "react";
import { useBudget } from "../hooks/useBudget";

export default function BudgetForm() {
  const { budget, setBudget, updateBudget } = useBudget();
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");

  // Ensure there's always a budget object (auto-seed on first render)
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

  // Safely compute items array
  const items = budget?.items ?? [];

  const addItem = () => {
    // guard: budget must exist and inputs must be valid
    if (!budget) return;
    const amt = Number(amount);
    if (!label || !amount || Number.isNaN(amt) || amt <= 0) return;

    const newItems = [
      ...items,
      { id: Date.now().toString(), label: label.trim(), amount: amt }
    ];

    updateBudget({ items: newItems });
    setLabel("");
    setAmount("");
  };

  const isAddDisabled = !label.trim() || !amount || Number.isNaN(Number(amount)) || Number(amount) <= 0;

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Add Expense Item</h2>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        aria-label="Expense label"
      />

      <input
        className="border p-2 w-full mb-2"
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        aria-label="Expense amount"
      />

      <button
        onClick={addItem}
        disabled={isAddDisabled}
        className={`p-2 rounded w-full ${isAddDisabled ? "bg-gray-300 text-gray-600" : "bg-blue-600 text-white"}`}
      >
        Add
      </button>
    </div>
  );
}
