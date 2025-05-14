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
import type { Item } from "@/components/inventory/column"; // Adjust the import path as necessary

interface EditItemComponentProps {
    item: Item;
    isEditOpen: boolean;
    onClose: () => void;
}

interface Category {
    category_id: number;
    category_name: string;
}

interface Supplier {
    supplier_id: number;
    supplier_name: string;
}

const EditItemComponent: React.FC<EditItemComponentProps> = ({
    item,
    isEditOpen,
    onClose,
}) => {
    const [editedItem, setEditedItem] = useState<
        Omit<Item, "supplier_name" | "category_name">
    >({ ...item }); // Initialize with item data, exclude names
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

        // Initialize form with item data when the dialog opens
        if (isEditOpen) {
            setEditedItem({ ...item });
            fetchCategoriesAndSuppliers(); // Fetch dropdown data
        }
    }, [isEditOpen, item]);

    // Update category/supplier names when their IDs change.  This is important
    // to keep the dropdowns correctly reflect the *current* item's values.
    useEffect(() => {
        if (editedItem.category_id && categories.length > 0) {
            const selectedCategory = categories.find(c => c.category_id === editedItem.category_id);
            setCategoryName(selectedCategory ? selectedCategory.category_name : "");
        }
        if (editedItem.supplier_id && suppliers.length > 0) {
            const selectedSupplier = suppliers.find(s => s.supplier_id === editedItem.supplier_id);
            setSupplierName(selectedSupplier ? selectedSupplier.supplier_name : "");
        }
    }, [editedItem.category_id, editedItem.supplier_id, categories, suppliers]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setEditedItem(prev => ({
            ...prev,
            [id]: id === 'quantity' || id === 'reorder_threshold' || id === 'category_id' || id === 'price' || id === 'supplier_id'
                ? Number(value)
                : value
        }));
    };

    const handleCategorySelect = (value: string) => {
        const categoryId = Number(value);
        setEditedItem(prev => ({ ...prev, category_id: categoryId }));
        const selectedCategory = categories.find(c => c.category_id === categoryId);
        setCategoryName(selectedCategory ? selectedCategory.category_name : "");
    };

    const handleSupplierSelect = (value: string) => {
        const supplierId = Number(value);
        setEditedItem(prev => ({ ...prev, supplier_id: supplierId }));
        const selectedSupplier = suppliers.find(s => s.supplier_id === supplierId);
        setSupplierName(selectedSupplier ? selectedSupplier.supplier_name : "");
    };

    const handleEditItem = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/update-quantity/${item.item_id}`, { 
                method: 'PATCH', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedItem),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to update item: ${response.status}`);
            }

            const updatedItemData = await response.json();
            onClose();
            alert(updatedItemData.message || 'Item updated successfully!');
            window.location.reload(); // Reload to reflect changes
        } catch (error: any) {
            console.error("Error updating item:", error);
            alert(`Error: ${error.message || 'Failed to update item'}`);
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
                            Category
                        </Label>
                        <Select onValueChange={handleCategorySelect} value={editedItem.category_id.toString()}>
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
                        <Select onValueChange={handleSupplierSelect} value={editedItem.supplier_id.toString()}>
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
                        onClick={handleEditItem}
                        className={cn(
                            "bg-blue-500 hover:bg-blue-600 text-white",
                            loading && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditItemComponent;
