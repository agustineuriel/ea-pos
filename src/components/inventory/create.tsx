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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Item } from "@/components/inventory/column";

interface CreateItemComponentProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (
        newItem: Omit<Item, "item_id" | "created_at" | "updated_at" | "supplier_name" | "category_name">
    ) => void; // Callback for creating
}

interface Category {
    category_id: number;
    category_name: string;
}

interface Supplier {
    supplier_id: number;
    supplier_name: string;
}

const CreateItemComponent: React.FC<CreateItemComponentProps> = ({
    isOpen,
    onClose,
    onCreate,
}) => {
    const [newItem, setNewItem] = useState<
        Omit<Item, "item_id" | "created_at" | "updated_at" | "supplier_name" | "category_name">
    >({
        // Initialize with empty item
        unit: "",
        description: "",
        price: 0,
        quantity: 0,
        reorder_threshold: 0,
        category_id: 0,
        supplier_id: 0, // Add supplier_id
    });
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [categoryName, setCategoryName] = useState<string>("");
    const [supplierName, setSupplierName] = useState<string>("");


    useEffect(() => {
        const fetchCategoriesAndSuppliers = async () => {
            try {
                const categoriesResponse = await fetch("/api/categories");
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData.data);

                const suppliersResponse = await fetch("/api/supplier");
                const suppliersData = await suppliersResponse.json();
                setSuppliers(suppliersData.data);
            } catch (error) {
                console.error("Failed to fetch categories or suppliers:", error);
                alert("Failed to load categories and suppliers. Please try again.");
            }
        };

        if (isOpen) {
            fetchCategoriesAndSuppliers();
        }
    }, [isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setNewItem((prev) => ({
            ...prev,
            [id]:
                id === "quantity" || id === "reorder_threshold" || id === "category_id" || id === "supplier_id"
                    ? Number(value)
                    : value,
        }));
    };

    const handleCategorySelect = (value: string) => {
        const categoryId = Number(value);
        setNewItem(prev => ({ ...prev, category_id: categoryId }));
        const selectedCategory = categories.find(c => c.category_id === categoryId);
        setCategoryName(selectedCategory ? selectedCategory.category_name : "");
    };

    const handleSupplierSelect = (value: string) => {
        const supplierId = Number(value);
        setNewItem(prev => ({ ...prev, supplier_id: supplierId }));
        const selectedSupplier = suppliers.find(s => s.supplier_id === supplierId);
        setSupplierName(selectedSupplier ? selectedSupplier.supplier_name : "");
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
                newItem.category_id === 0 || // Changed validation
                newItem.supplier_id === 0
            ) {
                throw new Error("Please fill in all fields with valid values.");
            }

            // Simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 500));

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
                supplier_id: 0,
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
                            Category
                        </Label>
                        <Select onValueChange={handleCategorySelect} value={newItem.category_id.toString()}>
                            <SelectTrigger className="col-span-3 w-full">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.category_id} value={category.category_id.toString()}>
                                        {category.category_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="supplier_id" className="text-right">
                            Supplier
                        </Label>
                        <Select onValueChange={handleSupplierSelect} value={newItem.supplier_id.toString()}>
                            <SelectTrigger className="col-span-3 w-full">
                                <SelectValue placeholder="Select a supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map((supplier) => (
                                    <SelectItem key={supplier.supplier_id} value={supplier.supplier_id.toString()}>
                                        {supplier.supplier_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
