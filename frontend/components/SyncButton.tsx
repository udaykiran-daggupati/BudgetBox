"use client";

import { useState } from "react";
import { syncBudget } from "../lib/sync";

export default function SyncButton({ id = "demo-budget" }: { id?: string }) {
  const [status, setStatus] = useState<string | null>(null);

  const doSync = async () => {
    setStatus("syncing...");
    try {
      const res = await syncBudget(id);
      if (!res.ok) {
        setStatus("failed: " + (res.reason ?? "unknown"));
      } else {
        setStatus("ok: " + (res.merged ?? "done"));
      }
    } catch (err) {
      setStatus("error");
    }
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="mt-4 flex items-center space-x-3">
      <button
        onClick={doSync}
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
      >
        Sync
      </button>
      <span className="text-sm text-gray-600">{status}</span>
    </div>
  );
}
