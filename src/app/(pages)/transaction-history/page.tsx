"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import { columns, Order } from "@/components/order/column";
import LoadingSpinner from "@/components/loading-indicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


const InventoryPage = () => {
  const [data, setData] = useState<Order[]>([]); 
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState<
    Order[]
  >([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch orders
      const ordersResponse = await fetch("/api/orders");
      if (!ordersResponse.ok) {
        throw new Error("Failed to fetch orders");
      }
      const ordersData = await ordersResponse.json();
      const orders: Order[] = ordersData.data;

      setData(orders);
    } catch (error: any) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter data based on search term
  useEffect(() => {
    const results = data.filter((order) => {
      const searchLower = search.toLowerCase();

      return (
        order.order_date || 
        order.order_status.toLowerCase().includes(searchLower) ||
        order.admin_name.toLowerCase().includes(searchLower) ||
        order.order_total_price.toString().includes(searchLower) ||
        order.customer_name.toLowerCase().includes(searchLower) || // Search by customer name
        order.customer_id.toString().includes(searchLower)
      );
    });
    setFilteredData(results);
  }, [search, data]);

  return (
    <div
      className={cn(
        "flex flex-col gap-6 p-4 md:p-6 lg:p-8",
        "min-h-screen bg-background overflow-hidden"
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">
          Transaction History
        </h1>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => (window.location.href = "/order")}
            className="border-1"
          >
            <span className="mr-2">+</span> Add Order
          </Button>
        </div>
      </div>

      <div className="flex flex-row items-center gap-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search Orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md w-md pl-10"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            🔍
          </span>
        </div>
      </div>

      <div className="container mx-auto">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable columns={columns} data={filteredData} />
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
