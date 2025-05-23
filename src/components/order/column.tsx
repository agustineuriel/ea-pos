"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WarningPopup from "../warning";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import OrderView from "./view";

export type Order = {
  order_id: number;
  customer_id: number;
  customer_name: string;
  admin_name: string;
  order_date: Date;
  order_status: string;
  order_total_price: number;
};

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "order_id",
    header: () => <div className="text-center">Order ID</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.order_id}</div>
    ),
  },
  {
    accessorKey: "customer_id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="text-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Customer ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.customer_id}</div>
    ),
  },
  {
    accessorKey: "customer_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="text-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Customer Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.customer_name}</div>
    ),
  },
  {
    accessorKey: "admin_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="text-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Admin Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.admin_name}</div>
    ),
  },
  {
    accessorKey: "order_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="text-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Order Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      try {
        const formattedDate = format(
          new Date(row.original.order_date),
          "dd/MM/yyyy"
        );
        return <div className="text-center">{formattedDate}</div>;
      } catch (error) {
        return <div className="text-center">Invalid Date</div>;
      }
    },
  },
  {
    accessorKey: "order_status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="text-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Order Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.original.order_status}</div>
    ),
  },
  {
    accessorKey: "order_total_price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="text-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const totalPriceValue = row.original.order_total_price; // Directly a number

      // Format as Philippine Peso (PHP) with 2 decimal places and comma separators
      const formattedTotalPrice = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(totalPriceValue); // Pass the number directly for formatting

      return <div className="text-center">{formattedTotalPrice}</div>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;
      const [isViewOpen, setisViewOpen] = useState(false);
      const [isEditOpen, setIsEditOpen] = useState(false);
      const [isDeleteOpen, setIsDeleteOpen] = useState(false);

      const hanldeCloseView = () => {
        setisViewOpen(false);
      };
      const handleCloseEdit = () => {
        setIsEditOpen(false);
      };

      const handleDeleteItem = async () => {
        try {
          const response = await fetch(`/api/orders/${item.order_id}`, {
            // Changed to /api/item
            method: "DELETE",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || `Failed to delete item: ${response.status}`
            ); // Changed message
          }
          alert("Item deleted successfully!"); // Changed message
          window.location.reload();
        } catch (error: any) {
          console.error("Error deleting item:", error); // Changed message
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
                  navigator.clipboard.writeText(item.order_id.toString())
                }
              >
                Copy order ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = `/invoice/${item.order_id}`}>
                Generate Invoice
                </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setisViewOpen(true)}>
                View Details/Update Status
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteOpen(true)}
                className="text-red-500"
              >
                Delete Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {isViewOpen && (
            <OrderView
              item={item}
              isViewOpen={isViewOpen}
              onClose={hanldeCloseView}
            />
          )}
          <WarningPopup // Using the WarningPopup
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            title="Are you sure?"
            description={`This action cannot be undone. This will permanently delete item: (ID: ${item.order_id}).`} // Changed description
            onConfirm={handleDeleteItem}
            confirmText="Delete"
            cancelText="Cancel"
          />
        </>
      );
    },
  },
];
