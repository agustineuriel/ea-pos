"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { format } from 'date-fns';
import React, { useState, useEffect } from 'react';
import AddQuantityComponent from './quantity';
import EditItemComponent from './edit';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WarningPopup from "../warning";

export type Item = {
    item_id: number;
    unit: string;
    description: string;
    price: number;
    quantity: number;
    reorder_threshold: number;
    category_id: number;
    created_at: string;
    updated_at: string;
    supplier_id: number;
    supplier_name?: string;
    category_name?: string; 
};

const fetchSupplierName = async (supplierId: number): Promise<string> => {
    const response = await fetch(`/api/supplier/${supplierId}`);
    const data = await response.json();
    console.log("Supplier data:", data); // Debugging line
    return data.supplier_name;
};

const fetchCategoryName = async (categoryId: number): Promise<string> => {
    const response = await fetch(`/api/categories/${categoryId}`);
    const data = await response.json();
    console.log("Category data:", data); // Debugging line
    return data.data?.category_name ?? "Unknown";
};

export const columns: ColumnDef<Item>[] = [
    {
        accessorKey: "item_id",
        header: () => <div className="text-center">Item ID</div>,
        cell: ({ row }) => (
            <div className="text-center">{row.original.item_id}</div>
        ),
    },
    {
        accessorKey: "unit",
        header: () => <div className="text-center">Unit</div>,
        cell: ({ row }) => (
            <div className="text-center">{row.original.unit}</div>
        ),
    },
    {
        accessorKey: "description",
        header: () => <div className="text-center">Description</div>,
        cell: ({ row }) => (
            <div className="text-center">{row.original.description}</div>
        ),
    },
    {
        accessorKey: "price",
        header: () => <div className="text-center">Price</div>,
        cell: ({ row }) => (
            <div className="text-center">₱{row.original.price}</div>
        ),
    },
    {
        accessorKey: "quantity",
        header: () => <div className="text-center">Quantity</div>,
        cell: ({ row }) => (
            <div className="text-center">{row.original.quantity}</div>
        ),
    },
    {
        accessorKey: "reorder_threshold",
        header: () => <div className="text-center">Reorder Threshold</div>,
        cell: ({ row }) => (
            <div className="text-center">{row.original.reorder_threshold}</div>
        ),
    },
    {
        accessorKey: "category_name", 
        header: () => <div className="text-center">Category</div>,
        cell: ({ row }) => {
            const [categoryName, setCategoryName] = useState<string>("Loading...");
            const categoryId = row.original.category_id;

            useEffect(() => {
                const getCategoryName = async () => {
                    try {
                        const name = await fetchCategoryName(categoryId);
                        setCategoryName(name);
                    } catch (error) {
                        console.error("Failed to fetch category name:", error);
                        setCategoryName("Error");
                    }
                };

                getCategoryName();
            }, [categoryId]);

            return <div className="text-center">{categoryName}</div>;
        },
    },
    {
        accessorKey: "supplier_name",
        header: () => <div className="text-center">Supplier</div>,
        cell: ({ row }) => {
            const [supplierName, setSupplierName] = useState<string>("Loading...");
            const supplierId = row.original.supplier_id;

            useEffect(() => {
                const getSupplierName = async () => {
                    try {
                        const name = await fetchSupplierName(supplierId);
                        setSupplierName(name);
                    } catch (error) {
                        console.error("Failed to fetch supplier name:", error);
                        setSupplierName("Error"); 
                    }
                };

                getSupplierName();
            }, [supplierId]);

            return (
                <div className="text-center">{supplierName}</div>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: () => <div className="text-center">Created At</div>,
        cell: ({ row }) => {
            const createdAt = row.original.created_at;
            try {
                const formattedDate = format(new Date(createdAt), 'dd/MM/yyyy hh:mm aa');
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
            try {
                const formattedDate = format(new Date(updatedAt), 'dd/MM/yyyy hh:mm aa');
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
            const item = row.original;
            const [isAddOpen, setIsAddOpen] = useState(false);
            const [isEditOpen, setIsEditOpen] = useState(false);
            const [isDeleteOpen, setIsDeleteOpen] = useState(false);

            const handleCloseAdd = () => {
                setIsAddOpen(false);
            };
            const handleCloseEdit = () => {
                setIsEditOpen(false);
            };

            const handleDeleteItem = async () => {
                try {
                    const response = await fetch(`/api/inventory/${item.item_id}`, { // Changed to /api/item
                        method: "DELETE",
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || `Failed to delete item: ${response.status}`); // Changed message
                    }
                    alert("Item deleted successfully!"); // Changed message
                    window.location.reload();
                } catch (error: any) {
                    console.error("Error deleting item:", error);  // Changed message
                    alert(`Error: ${error.message || "Failed to delete item"}`); // Changed message
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
                            <DropdownMenuItem
                                onClick={() =>
                                    navigator.clipboard.writeText(item.item_id.toString())
                                }
                            >
                                Copy inventory ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setIsAddOpen(true)}>Add Quantity</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>Edit Item</DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setIsDeleteOpen(true)}
                                className="text-red-500"
                            >
                                Delete Item
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {isAddOpen && (
                        <AddQuantityComponent
                            item={item}
                            isViewOpen={isAddOpen}
                            onClose={handleCloseAdd}
                        />
                    )}
                    {isEditOpen && (
                        <EditItemComponent
                            item={item}
                            isEditOpen={isEditOpen}
                            onClose={handleCloseEdit}
                        />
                    )}
                    <WarningPopup  // Using the WarningPopup
                        isOpen={isDeleteOpen}
                        onClose={() => setIsDeleteOpen(false)}
                        title="Are you sure?"
                        description={`This action cannot be undone. This will permanently delete item: ${item.description} (ID: ${item.item_id}).`} // Changed description
                        onConfirm={handleDeleteItem}
                        confirmText="Delete"
                        cancelText="Cancel"
                    />
                </>
            );
        },
    },
];