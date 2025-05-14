"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import LoadingSpinner from "@/components/loading-indicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Supplier, columns } from "@/components/supplier/column";
import CreateSupplierComponent from "@/components/supplier/create";

const SupplierPage = () => { // Renamed component
    const [data, setData] = useState<Supplier[]>([]); // Renamed type
    const [loading, setLoading] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filteredData, setFilteredData] = useState<Supplier[]>([]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/supplier"); // Changed endpoint
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const result = await response.json();
            setData(result.data);
        } catch (error) {
            console.error("Error fetching supplier data:", error); // Changed log
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Function to handle supplier creation
    const handleCreate = async (newSupplier: Omit<Supplier, 'supplier_id' | 'created_at' | 'updated_at'>) => { 
        try {
            const response = await fetch("/api/supplier", { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newSupplier),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create supplier"); 
            }

            // Refresh the data after successful creation
            await fetchData();
            setIsCreateOpen(false);
        } catch (error: any) {
            console.error("Error creating supplier:", error); // Changed log
            alert(`Error: ${error.message}`);
        }
    };

    const handleCloseCreate = () => {
        setIsCreateOpen(false);
    };

    // Filter data based on search term
    useEffect(() => {
        const results = data.filter((supplier) => // Changed variable name
            supplier.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
            (supplier.supplier_email ?? '').toLowerCase().includes(search.toLowerCase()) ||
            (supplier.supplier_number || '').toLowerCase().includes(search.toLowerCase())
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
                <h1 className="text-3xl font-bold text-foreground">Suppliers</h1> 
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search Suppliers..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-xs pl-10"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            🔍
                        </span>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="border-1">
                        <span className="mr-2">+</span> Add Supplier
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
                <CreateSupplierComponent 
                    isOpen={isCreateOpen}
                    onClose={handleCloseCreate}
                    onCreate={handleCreate}
                />
            )}
        </div>
    );
};

export default SupplierPage; 
