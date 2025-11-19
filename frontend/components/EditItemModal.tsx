"use client";

import { useState, useEffect } from "react";

type Item = {
  id: string;
  label: string;
  amount: number;
};

export default function EditItemModal({
  open,
  item,
  onClose,
  onSave
}: {
  open: boolean;
  item: Item | null;
  onClose: () => void;
  onSave: (i: Item) => void;
}) {
  const [label, setLabel] = useState(item?.label ?? "");
  const [amount, setAmount] = useState(item?.amount?.toString() ?? "");

  useEffect(() => {
    if (open) {
      setLabel(item?.label ?? "");
      setAmount(item?.amount?.toString() ?? "");
    }
  }, [open, item]);

  if (!open) return null;

  const save = () => {
    const amt = Number(amount);
    if (!label.trim() || Number.isNaN(amt)) return;
    onSave({ ...(item as Item), label: label.trim(), amount: amt });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white p-4 rounded shadow w-11/12 max-w-md">
        <h3 className="text-lg font-semibold mb-2">Edit Item</h3>
        <input
          className="border p-2 w-full mb-2"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          aria-label="Label"
        />
        <input
          className="border p-2 w-full mb-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          aria-label="Amount"
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1 rounded border">
            Cancel
          </button>
          <button onClick={save} className="px-3 py-1 rounded bg-blue-600 text-white">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
