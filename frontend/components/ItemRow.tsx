"use client";

import React, { useState } from "react";
import EditItemModal from "./EditItemModal";

type Item = {
  id: string;
  label: string;
  amount: number;
};

type Props = {
  item: Item;
  onEdit: (i: Item) => void;
  onDelete: (id: string) => void;
};

export default function ItemRow({ item, onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDelete = () => {
    if (!item?.id) return;
    onDelete(item.id);
  };

  const handleSave = (updated: Item) => {
    onEdit(updated);
    handleClose();
  };

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <div>
          <div className="font-medium">{item?.label ?? "Untitled"}</div>
          <div className="text-sm text-gray-500">₹{item?.amount ?? 0}</div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleOpen}
            className="text-sm px-2 py-1 border rounded hover:bg-gray-100"
            aria-label={`Edit ${item?.label ?? "item"}`}
          >
            Edit
          </button>

          <button
            onClick={handleDelete}
            className="text-sm px-2 py-1 border rounded text-red-600 hover:bg-red-50"
            aria-label={`Delete ${item?.label ?? "item"}`}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Render modal outside of the row markup to avoid layout shifts */}
      {open && (
        <EditItemModal
          open={open}
          item={item}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
    </>
  );
}
