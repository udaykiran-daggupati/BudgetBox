"use client";

import { useBudget } from "../hooks/useBudget";
import ItemRow from "./ItemRow";
import { syncBudget } from "../lib/sync";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#60a5fa", "#34d399", "#fca5a5", "#fbbf24", "#a78bfa"];

export default function Dashboard() {
  const { budget, updateBudget } = useBudget();
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  if (!budget) return <div className="bg-white p-4 rounded shadow">Loading budget...</div>;

  const items = budget.items ?? [];
  const total = items.reduce((a, b) => a + (b.amount || 0), 0);
  const balance = (budget.income ?? 0) - total;

  const onDelete = async (itemId:string) => {
    setSyncStatus("deleting...");
    // call backend delete endpoint
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000") + "/budget/item/delete", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ id: budget.id, itemId })
      });
      const data = await res.json();
      if (data.ok) {
        updateBudget({ items: data.stored.items });
        setSyncStatus("deleted");
      } else {
        setSyncStatus("error");
      }
    } catch (e) {
      setSyncStatus("network");
    } finally { setTimeout(()=>setSyncStatus(null), 2000); }
  };

  const onEdit = async (newItem:any) => {
    setSyncStatus("saving...");
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000") + "/budget/item/update", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ id: budget.id, item: newItem })
      });
      const data = await res.json();
      if (data.ok) {
        updateBudget({ items: data.stored.items });
        setSyncStatus("saved");
      } else {
        setSyncStatus("error");
      }
    } catch (e) {
      setSyncStatus("network");
    } finally { setTimeout(()=>setSyncStatus(null), 2000); }
  };

  const pieData = items.slice(0,5).map((it, idx) => ({ name: it.label, value: it.amount }));

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
          <p className="mb-2">Income: ₹{budget.income}</p>
          <p className="mb-2">Total Spend: ₹{total}</p>
          <p className="font-bold mb-4">Remaining: ₹{balance}</p>

          <div className="space-y-2">
            {items.length === 0 ? <div className="text-sm text-gray-500">No expenses yet</div> :
              items.map((item:any)=> <ItemRow key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />)
            }
          </div>
          <div className="mt-3">
            <button onClick={async ()=>{
              setSyncStatus("syncing...");
              const r = await syncBudget(budget.id);
              setSyncStatus(r.ok ? ("ok: " + (r.merged ?? "done")) : ("failed: " + (r.reason ?? "unknown")));
              setTimeout(()=>setSyncStatus(null),2500);
            }} className="bg-green-600 text-white px-3 py-1 rounded">Sync Now</button>
            <span className="ml-3 text-sm text-gray-600">{syncStatus}</span>
          </div>
        </div>

        <div style={{ width: 220, height: 220 }} className="mt-4 md:mt-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={80}>
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
