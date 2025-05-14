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
import type { Category } from "@/components/category/column"; // Adjust the import path

interface EditCategoryComponentProps {
    category: Category;
    isEditOpen: boolean;
    onClose: () => void;
}

const EditCategoryComponent: React.FC<EditCategoryComponentProps> = ({
    category,
    isEditOpen,
    onClose,
}) => {
    const [editedCategory, setEditedCategory] = useState<Category>({ ...category });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isPristine, setIsPristine] = useState(true);

    useEffect(() => {
        if (isEditOpen) {
            setEditedCategory({ ...category });
            setIsPristine(true);
            setErrors({});
        }
    }, [isEditOpen, category]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setEditedCategory((prev) => ({
            ...prev,
            [id]: value,
        }));
        setIsPristine(false);
        setErrors((prevErrors) => ({ ...prevErrors, [id]: "" }));
    };

    const handleEditCategory = async () => {
        setLoading(true);
        const newErrors: { [key: string]: string } = {};
        let hasErrors = false;

        try {
            if (!editedCategory.category_name) {
                newErrors.category_name = "Please enter category name.";
                hasErrors = true;
            }

            if (hasErrors) {
                setErrors(newErrors);
                return;
            }
            setErrors({});

            const response = await fetch(`/api/categories/${category.category_id}`, { // Correct endpoint
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editedCategory),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to update category: ${response.status}`);
            }

            const updatedCategoryData = await response.json();
            onClose();
            alert(updatedCategoryData.message || "Category updated successfully!");
            window.location.reload();
        } catch (error: any) {
            console.error("Error updating category:", error);
            alert(`Error: ${error.message || "Failed to update category"}`);
        } finally {
            setLoading(false);
        }
    };

    const isSaveDisabled = loading || isPristine;

    return (
        <Dialog open={isEditOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>
                    <DialogDescription>
                        Edit category details for Category ID: {category.category_id}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category_id" className="text-right">
                            Category ID
                        </Label>
                        <Input
                            id="category_id"
                            value={editedCategory.category_id.toString()}
                            className="col-span-3"
                            disabled
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category_name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="category_name"
                            value={editedCategory.category_name}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                         {errors.category_name && (
                            <p className="text-red-500 text-sm col-span-4 col-start-2">
                                {errors.category_name}
                            </p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleEditCategory}
                        className={cn(
                            "bg-blue-500 hover:bg-blue-600 text-white",
                            loading && "opacity-50 cursor-not-allowed",
                            isSaveDisabled && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={isSaveDisabled}
                    >
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditCategoryComponent;
