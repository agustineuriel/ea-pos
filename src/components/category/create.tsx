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

interface Category {
    category_id: number;
    category_name: string;
    created_at: string;
    updated_at: string;
}

interface CreateCategoryComponentProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (
        newCategory: Omit<Category, "category_id" | "created_at" | "updated_at">
    ) => void;
}

const CreateCategoryComponent: React.FC<CreateCategoryComponentProps> = ({
    isOpen,
    onClose,
    onCreate,
}) => {
    const [newCategory, setNewCategory] = useState<
        Omit<Category, "category_id" | "created_at" | "updated_at">
    >({
        category_name: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setNewCategory((prev) => ({
            ...prev,
            [id]: value,
        }));
        setErrors((prevErrors) => ({ ...prevErrors, [id]: "" }));
    };

    const handleCreateCategory = async () => {
        setLoading(true);
        const newErrors: { [key: string]: string } = {};
        let hasErrors = false;

        try {
            if (!newCategory.category_name) {
                newErrors.category_name = "Please enter category name.";
                hasErrors = true;
            }

            if (hasErrors) {
                setErrors(newErrors);
                return;
            }
            setErrors({});

            await new Promise((resolve) => setTimeout(resolve, 500));

            onCreate(newCategory);

            setNewCategory({
                category_name: "",
            });
            onClose();
            alert("Category created successfully!");
             window.location.reload();

        } catch (error: any) {
            console.error("Error creating category:", error);
            alert(`Error: ${error.message || "Failed to create category"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Category</DialogTitle>
                    <DialogDescription>Enter new category details</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category_name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="category_name"
                            value={newCategory.category_name}
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
                        onClick={handleCreateCategory}
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

export default CreateCategoryComponent;
