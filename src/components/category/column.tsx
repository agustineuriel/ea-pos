"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditCategoryComponent from "./edit";  // You'll need to create this
import WarningPopup from "../warning";      //  And this

export type Category = {
    category_id: number;
    category_name: string;
    created_at?: string;
    updated_at?: string;
};

export const columns: ColumnDef<Category>[] = [
    {
        accessorKey: "category_id",
        header: () => <div className="text-center">Category ID</div>,
        cell: ({ row }) => (
            <div className="text-center">{row.original.category_id}</div>
        ),
    },
    {
        accessorKey: "category_name",
        header: () => <div className="text-center">Category Name</div>,
        cell: ({ row }) => (
            <div className="text-center">{row.original.category_name}</div>
        ),
    },
    {
        accessorKey: "created_at",
        header: () => <div className="text-center">Created At</div>,
        cell: ({ row }) => {
            const createdAt = row.original.created_at;
            if (!createdAt) return <div className="text-center">N/A</div>;
            try {
                const formattedDate = format(
                    new Date(createdAt),
                    "dd/MM/yyyy hh:mm aa"
                );
                return <div className="text-center">{formattedDate}</div>;
            } catch (error) {
                return <div className="text-center">Invalid Date</div>;
            }
        },
    },
    {
        accessorKey: "updated_at",
        header: () => <div className="text-center">Updated At</div>,
        cell: ({ row }) => {
            const updatedAt = row.original.updated_at;
            if (!updatedAt) return <div className="text-center">N/A</div>;
            try {
                const formattedDate = format(
                    new Date(updatedAt),
                    "dd/MM/yyyy hh:mm aa"
                );
                return <div className="text-center">{formattedDate}</div>;
            } catch (error) {
                return <div className="text-center">Invalid Date</div>;
            }
        },
    },
    {
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
            const category = row.original;
            const [isEditOpen, setIsEditOpen] = useState(false);
            const [isDeleteOpen, setIsDeleteOpen] = useState(false);

            const handleCloseEdit = () => {
                setIsEditOpen(false);
            };

            const handleDeleteCategory = async () => {
                try {
                    const response = await fetch(`/api/categories/${category.category_id}`, { //  Correct API endpoint
                        method: "DELETE",
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || `Failed to delete category: ${response.status}`);
                    }
                    alert("Category deleted successfully!");
                    window.location.reload();
                } catch (error: any) {
                    console.error("Error deleting category:", error);
                    alert(`Error: ${error.message || "Failed to delete category"}`);
                } finally {
                    setIsDeleteOpen(false);
                }
            };

            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setIsDeleteOpen(true)}
                                className="text-red-500"
                            >
                                Delete Category
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {isEditOpen && (
                        <EditCategoryComponent //  Create this component
                            category={category}
                            isEditOpen={isEditOpen}
                            onClose={handleCloseEdit}
                        />
                    )}
                    <WarningPopup  //  And this one
                        isOpen={isDeleteOpen}
                        onClose={() => setIsDeleteOpen(false)}
                        title="Are you sure?"
                        description={`This action cannot be undone. This will permanently delete category: ${category.category_name} (ID: ${category.category_id}).`}
                        onConfirm={handleDeleteCategory}
                        confirmText="Delete"
                        cancelText="Cancel"
                    />
                </>
            );
        },
    },
];
