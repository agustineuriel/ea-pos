"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import React from "react";

export type Log = {
  log_id: number;
  log_description: string;
  log_created_by: string;
  log_datetime: string;
};

export const columns: ColumnDef<Log>[] = [
  {
    accessorKey: "log_id",
    header: () => <div className="text-center">Log ID</div>,
    cell: ({ row }) => <div className="text-center">{row.original.log_id}</div>,
  },
  {
    accessorKey: "log_description",
    header: () => <div className="text-center">Description</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original.log_description}</div>
    ),
  },
  {
    accessorKey: "log_created_by",
    header: () => <div className="text-center">Created By</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.log_created_by}</div>
    ),
  },
  {
    accessorKey: "log_datetime",
    header: () => <div className="text-center">Datetime</div>,
    cell: ({ row }) => {
      const logDatetime = row.original.log_datetime;
      if (!logDatetime) return <div className="text-center">N/A</div>;
      try {
        const formattedDate = format(
          new Date(logDatetime),
          "dd/MM/yyyy hh:mm aa"
        );
        return <div className="text-center">{formattedDate}</div>;
      } catch (error) {
        return <div className="text-center">Invalid Date</div>;
      }
    },
  },
];
