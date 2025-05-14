"use client";

import React, { useState } from "react";
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
import type { Item } from "@/components/inventory/column";

interface CreateItemComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    newItem: Omit<Item, "item_id" | "created_at" | "updated_at">
  ) => void; // Callback for creating
}

const CreateItemComponent: React.FC<CreateItemComponentProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [newItem, setNewItem] = useState<
    Omit<Item, "item_id" | "created_at" | "updated_at">
  >({
    // Initialize with empty item
    unit: "",
    description: "",
    price: 0,
    quantity: 0,
    reorder_threshold: 0,
    category_id: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [id]:
        id === "quantity" || id === "reorder_threshold" || id === "category_id"
          ? Number(value)
          : value,
    }));
  };

  const handleCreateItem = async () => {
    setLoading(true);
    try {
      // Basic validation
      if (
        !newItem.unit ||
        !newItem.description ||
        newItem.quantity < 0 ||
        newItem.reorder_threshold < 0 ||
        newItem.category_id < 0
      ) {
        throw new Error("Please fill in all fields with valid values.");
      }

      // Simulate API call (replace with your actual API call)
      // In a real application, you'd send a POST request to your API
      // and get the new item's ID from the response.
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

      // Callback to parent component to handle actual creation
      onCreate(newItem);

      // Reset the form
      setNewItem({
        unit: "",
        description: "",
        price: 0,
        quantity: 0,
        reorder_threshold: 0,
        category_id: 0,
      });
      onClose(); // Close dialog
      alert("Item created successfully!"); // Or use a toast notification
      window.location.reload();
    } catch (error: any) {
      console.error("Error creating item:", error);
      alert(`Error: ${error.message || "Failed to create item"}`); // Show error to user
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Item</DialogTitle>
          <DialogDescription>Enter new item details</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit" className="text-right">
              Unit
            </Label>
            <Input
              id="unit"
              value={newItem.unit}
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
              value={newItem.description}
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
              value={newItem.price}
              onChange={handleInputChange}
              className="col-span-3"
              min={0}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              value={newItem.quantity.toString()}
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
              value={newItem.reorder_threshold.toString()}
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
              value={newItem.category_id.toString()}
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
            onClick={handleCreateItem}
            className={cn(
              "bg-green-500 hover:bg-green-600 text-white",
              loading && "opacity-50 cursor-not-allowed"
            )}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateItemComponent;
