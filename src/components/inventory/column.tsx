"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { format } from 'date-fns';
import React, { useState } from 'react';
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
    accessorKey: "category_id",
    header: () => <div className="text-center">Category ID</div>, 
    cell: ({ row }) => (
      <div className="text-center">{row.original.category_id}</div>
    ),
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
      const [isEditOpen, setIsEditOpen] = useState(false); // State for Edit Item Dialog

      const handleCloseAdd = () => {
        setIsAddOpen(false);
      };
      const handleCloseEdit = () => {
        setIsEditOpen(false);
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
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>Edit Item</DropdownMenuItem> {/* Added Edit Item */}
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
        </>
      );
    },
  },
];
