"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/inventory/column";
import type { Item } from "@/components/inventory/column";
import LoadingSpinner from "@/components/loading-indicator";
import CreateItemComponent from "@/components/inventory/create";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const InventoryPage = () => {
    const [data, setData] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filteredData, setFilteredData] = useState<Item[]>([]); // State for filtered data

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/inventory");
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const result = await response.json();
            setData(result.data);
        } catch (error) {
            console.error("Error fetching inventory data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Function to handle item creation
    const handleCreate = async (newItem: Omit<Item, 'item_id' | 'created_at' | 'updated_at'>) => {
        try {
            const response = await fetch("/api/inventory", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newItem),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create item");
            }

            // Refresh the data after successful creation
            await fetchData();
            setIsCreateOpen(false); // Close the modal
        } catch (error: any) {
            console.error("Error creating item:", error);
            alert(`Error: ${error.message}`); // Basic error alert
            //  Consider using a toast here.
        }
    };

    const handleCloseCreate = () => {
        setIsCreateOpen(false);
    };

    // Filter data based on search term
    useEffect(() => {
        const results = data.filter((item) =>
            item.description.toLowerCase().includes(search.toLowerCase()) ||
            item.unit.toLowerCase().includes(search.toLowerCase())
        );
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
                <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search Inventory..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-xs pl-10"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            🔍
                        </span>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <span className="mr-2">+</span> Add Item
                    </Button>
                </div>
            </div>

            <div
                className={cn(
                    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
                    "w-full"
                )}
            ></div>
            <div className="container mx-auto">
                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <DataTable columns={columns} data={filteredData} />
                )}
            </div>
            {isCreateOpen && (
                <CreateItemComponent
                    isOpen={isCreateOpen}
                    onClose={handleCloseCreate}
                    onCreate={handleCreate}
                />
            )}
        </div>
    );
};

export default InventoryPage;

