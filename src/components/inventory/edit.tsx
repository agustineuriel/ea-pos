"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Item } from "@/components/inventory/column"; // Adjust the import path as necessary

interface EditItemComponentProps {
  item: Item;
  isEditOpen: boolean;
  onClose: () => void;
}

const EditItemComponent: React.FC<EditItemComponentProps> = ({
  item,
  isEditOpen,
  onClose,
}) => {
  const [editedItem, setEditedItem] = useState<Item>({ ...item }); // Initialize with item data
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize form with item data when the dialog opens
    if (isEditOpen) {
      setEditedItem({ ...item });
    }
  }, [isEditOpen, item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditedItem((prev) => ({
      ...prev,
      [id]:
        id === "quantity" ||
        id === "reorder_threshold" ||
        id === "category_id" ||
        id === "price"
          ? Number(value)
          : value,
    }));
  };

  const handleEditItem = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/inventory/${item.item_id}`, {
        // Use item_id
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedItem),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to update item: ${response.status}`
        );
      }

      const updatedItemData = await response.json();
      onClose();
      alert(updatedItemData.message || "Item updated successfully!");
      window.location.reload(); // Reload to reflect changes
    } catch (error: any) {
      console.error("Error updating item:", error);
      alert(`Error: ${error.message || "Failed to update item"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isEditOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Edit item details for Item ID: {item.item_id}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="item_id" className="text-right">
              Item ID
            </Label>
            <Input
              id="item_id"
              value={editedItem.item_id.toString()}
              className="col-span-3"
              disabled
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit" className="text-right">
              Unit
            </Label>
            <Input
              id="unit"
              value={editedItem.unit}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={editedItem.description}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input
              id="price"
              value={editedItem.price}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              value={editedItem.quantity.toString()}
              onChange={handleInputChange}
              className="col-span-3"
              min={1}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reorder_threshold" className="text-left">
              Reorder Threshold
            </Label>
            <Input
              id="reorder_threshold"
              type="number"
              value={editedItem.reorder_threshold.toString()}
              onChange={handleInputChange}
              className="col-span-3"
              min={0}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category_id" className="text-right">
              Category ID
            </Label>
            <Input
              id="category_id"
              type="number"
              value={editedItem.category_id.toString()}
              onChange={handleInputChange}
              className="col-span-3"
              min={1}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleEditItem}
            className={cn(
              "bg-blue-500 hover:bg-blue-600 text-white",
              loading && "opacity-50 cursor-not-allowed"
            )}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemComponent;
