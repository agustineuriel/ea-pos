"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import React, { useState, useEffect } from "react";
import AddQuantityComponent from "./quantity";
import EditItemComponent from "./edit";
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
  supplier_name: string;
  category_name: string;
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost" className="text-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Unit
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-center">{row.original.unit}</div>,
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost" 
          className="text-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-left">{row.original.description}</div>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost" className="text-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-center">₱{row.original.price}</div>,
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost" className="text-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-center">{row.original.quantity}</div>
    ),
  },
  {
    accessorKey: "reorder_threshold",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost" className="text-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Reorder Threshold
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-center">{row.original.reorder_threshold}</div>
    ),
  },
  {
    accessorKey: "category_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost" className="text-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-center">{row.original.category_name}</div>
    ),
  },
  {
    accessorKey: "supplier_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost" className="text-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Supplier Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-center">{row.original.supplier_name}</div>
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost" className="text-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const createdAt = row.original.created_at;
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
    header: ({ column }) => {
      return (
        <Button
        className="text-center"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const updatedAt = row.original.updated_at;
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
          const response = await fetch(`/api/inventory/${item.item_id}`, {
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
                  navigator.clipboard.writeText(item.item_id.toString())
                }
              >
                Copy inventory ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsAddOpen(true)}>
                Add Quantity
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                Edit Item
              </DropdownMenuItem>
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
          <WarningPopup // Using the WarningPopup
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
