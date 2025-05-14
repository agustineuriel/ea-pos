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
import type { Item } from "@/components/inventory/column";

interface AddQuantityComponentProps {
    item: Item;
    isViewOpen: boolean;
    onClose: () => void;
}

const AddQuantityComponent: React.FC<AddQuantityComponentProps> = ({
    item,
    isViewOpen,
    onClose,
}) => {
    const [newQuantity, setNewQuantity] = useState<number>(0);

    useEffect(() => {
        // Reset newQuantity when the dialog opens
        if (isViewOpen) {
            setNewQuantity(0);
        }
    }, [isViewOpen]);

    const handleAddQuantity = async () => {
        const quantityToAdd = newQuantity;
        if (quantityToAdd > 0) {
            try {
                // Construct the URL correctly to match the Next.js route
                const response = await fetch(`/api/update-quantity/${item.item_id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        quantity: item.quantity + quantityToAdd, // Send the updated quantity
                        updated_at: new Date().toISOString(),
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.error || `Failed to update quantity: ${response.status}`
                    );
                }

                const responseData = await response.json();
                onClose();
                alert(responseData.message);
                window.location.reload();
            } catch (error: any) {
                console.error("Error updating quantity:", error);
                alert(`Error: ${error.message || "Failed to update quantity"}`);
            }
        }
    };

    return (
        <Dialog open={isViewOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Quantity</DialogTitle>
                    <DialogDescription>
                        Enter the quantity to add to item ID: {item.item_id}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="item-id" className="text-right">
                            Item ID
                        </Label>
                        <Input
                            id="item-id"
                            value={item.item_id.toString()}
                            className="col-span-3"
                            disabled // Make it disabled
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unit" className="text-right">
                            Unit
                        </Label>
                        <Input
                            id="unit"
                            value={item.unit}
                            className="col-span-3"
                            disabled // Make it disabled
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Description
                        </Label>
                        <Input
                            id="description"
                            value={item.description}
                            className="col-span-3"
                            disabled // Make it disabled
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                            Price
                        </Label>
                        <Input
                            id="price"
                            value={item.price.toString()}
                            className="col-span-3"
                            disabled
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-left">
                            Current Quantity
                        </Label>
                        <Input
                            id="quantity"
                            value={item.quantity.toString()}
                            className="col-span-3"
                            disabled // Make it disabled
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="add-quantity" className="text-right">
                            Add Quantity
                        </Label>
                        <Input
                            id="add-quantity"
                            type="number"
                            value={newQuantity === 0 ? "" : newQuantity.toString()}
                            onChange={(e) => setNewQuantity(Number(e.target.value))}
                            className="col-span-3"
                            min={1}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleAddQuantity}
                        className={cn(
                            "bg-green-500 hover:bg-green-600 text-white",
                            newQuantity <= 0 && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={newQuantity <= 0}
                    >
                        Add
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddQuantityComponent;
