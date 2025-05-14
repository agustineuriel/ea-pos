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
import WarningPopup from "../warning";    
import EditSupplierComponent from "./edit";

export type Supplier = {
    supplier_number: string;
    supplier_id: number;
    supplier_name: string;
    supplier_contact_person?: string;
    supplier_address?: string;
    supplier_email?: string;
    created_at?: string;
    updated_at?: string;
};

export const columns: ColumnDef<Supplier>[] = [
    {
        accessorKey: "supplier_id",
        header: () => <div className="text-center">Supplier ID</div>,
        cell: ({ row }) => (
            <div className="text-center">{row.original.supplier_id}</div>
        ),
    },
    {
        accessorKey: "supplier_name",
        header: () => <div className="text-center">Supplier Name</div>,
        cell: ({ row }) => (
            <div className="text-center">{row.original.supplier_name}</div>
        ),
    },
    {
        accessorKey: "supplier_contact_person",
        header: () => <div className="text-center">Contact Person</div>,
        cell: ({ row }) => (
            <div className="text-center">{row.original.supplier_contact_person || "N/A"}</div>
        ),
    },
    {
        accessorKey: "supplier_address",
        header: () => <div className="text-center">Supplier Address</div>,
        cell: ({ row }) => (
            <div className="text-center">{row.original.supplier_address || "N/A"}</div>
        ),
    },
    {
        accessorKey: "supplier_email",
        header: () => <div className="text-center">Supplier Email</div>,
        cell: ({ row }) => (
            <div className="text-center">{row.original.supplier_email || "N/A"}</div>
        ),
    },
        {
        accessorKey: "supplier_number",
        header: () => <div className="text-center">Supplier Number</div>,
        cell: ({ row }) => (
            <div className="text-center">{row.original.supplier_number || "N/A"}</div>
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
            const supplier = row.original;
            const [isEditOpen, setIsEditOpen] = useState(false);
            const [isDeleteOpen, setIsDeleteOpen] = useState(false);

            const handleCloseEdit = () => {
                setIsEditOpen(false);
            };

            const handleDeleteSupplier = async () => {
                try {
                    const response = await fetch(`/api/supplier/${supplier.supplier_id}`, {  // Changed to supplier
                        method: "DELETE",
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || `Failed to delete supplier: ${response.status}`); // Changed message
                    }
                    alert("Supplier deleted successfully!"); // Changed message
                    window.location.reload();
                } catch (error: any) {
                    console.error("Error deleting supplier:", error);  // Changed message
                    alert(`Error: ${error.message || "Failed to delete supplier"}`); // Changed message
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
                                    navigator.clipboard.writeText(supplier.supplier_id.toString())
                                }
                            >
                                Copy Supplier ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                Edit Supplier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setIsDeleteOpen(true)}
                                className="text-red-500"
                            >
                                Delete Supplier
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {isEditOpen && (
                        <EditSupplierComponent
                            supplier={supplier}
                            isEditOpen={isEditOpen}
                            onClose={handleCloseEdit}
                        />
                    )}
                    <WarningPopup
                        isOpen={isDeleteOpen}
                        onClose={() => setIsDeleteOpen(false)}
                        title="Are you sure?"
                        description={`This action cannot be undone. This will permanently delete supplier: ${supplier.supplier_name} (ID: ${supplier.supplier_id}).`} // Changed description
                        onConfirm={handleDeleteSupplier}
                        confirmText="Delete"
                        cancelText="Cancel"
                    />
                </>
            );
        },
    },
];
