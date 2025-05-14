"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react"; // Import the warning icon
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
import EditCustomerComponent from "./edit";
import WarningPopup from "../warning";

export type Customer = {
    customer_id: number;
    customer_name: string;
    customer_address: string;
    customer_number: string;
    customer_email: string;
    created_at?: string;
    updated_at?: string;
};


export const columns: ColumnDef<Customer>[] = [
    {
        accessorKey: "customer_id",
        header: () => <div className="text-center">Customer ID</div>,
        cell: ({ row }) => (
            <div className="text-center">{row.original.customer_id}</div>
        ),
    },
    {
        accessorKey: "customer_name",
        header: () => <div className="text-center">Customer Name</div>,
        cell: ({ row }) => (
            <div className="text-center">{row.original.customer_name}</div>
        ),
    },
    {
        accessorKey: "customer_address",
        header: () => <div className="text-center">Customer Address</div>,
        cell: ({ row }) => (
            <div className="text-center">{row.original.customer_address}</div>
        ),
    },
    {
        accessorKey: "customer_number",
        header: () => <div className="text-center">Customer Number</div>,
        cell: ({ row }) => (
            <div className="text-center">{row.original.customer_number}</div>
        ),
    },
    {
        accessorKey: "customer_email",
        header: () => <div className="text-center">Customer Email</div>,
        cell: ({ row }) => (
            <div className="text-center">{row.original.customer_email}</div>
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
            const customer = row.original;
            const [isEditOpen, setIsEditOpen] = useState(false); // State for Edit Customer Dialog
            const [isDeleteOpen, setIsDeleteOpen] = useState(false); // State for Delete Customer Dialog

            const handleCloseEdit = () => {
                setIsEditOpen(false);
            };

            const handleDeleteCustomer = async () => {
                try {
                    const response = await fetch(`/api/customer/${customer.customer_id}`, {
                        method: "DELETE",
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || `Failed to delete customer: ${response.status}`);
                    }
                    alert("Customer deleted successfully!");
                    window.location.reload(); // Reload to reflect changes
                } catch (error: any) {
                    console.error("Error deleting customer:", error);
                    alert(`Error: ${error.message || "Failed to delete customer"}`);
                } finally {
                    setIsDeleteOpen(false); // Close the dialog
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
                                    navigator.clipboard.writeText(customer.customer_id.toString())
                                }
                            >
                                Copy Customer ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                Edit Customer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setIsDeleteOpen(true)}
                                className="text-red-500"
                            >
                                Delete Customer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {isEditOpen && (
                        <EditCustomerComponent
                            customer={customer}
                            isEditOpen={isEditOpen}
                            onClose={handleCloseEdit}
                        />
                    )}
                    <WarningPopup
                        isOpen={isDeleteOpen}
                        onClose={() => setIsDeleteOpen(false)}
                        title="Are you sure?"
                        description={`This action cannot be undone. This will permanently delete customer: ${customer.customer_name} (ID: ${customer.customer_id}).`}
                        onConfirm={handleDeleteCustomer}
                        confirmText="Delete"
                        cancelText="Cancel"
                    />
                </>
            );
        },
    },
];

