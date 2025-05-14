"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import LoadingSpinner from "@/components/loading-indicator";
import CreateCategoryComponent from "@/components/category/create";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Category, columns } from "@/components/category/column";

const CategoriesPage = () => {
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filteredData, setFilteredData] = useState<Category[]>([]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/categories"); //  Correct API endpoint
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const result = await response.json();
            setData(result.data);
        } catch (error) {
            console.error("Error fetching categories data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateCategory = async (newCategory: Omit<Category, 'category_id' | 'created_at' | 'updated_at'>) => {
        try {
            const response = await fetch("/api/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newCategory),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create category");
            }

            await fetchData();
            setIsCreateCategoryOpen(false);
        } catch (error: any) {
            console.error("Error creating category:", error);
            alert(`Error: ${error.message}`);
        }
    };

    const handleCloseCreateCategory = () => {
        setIsCreateCategoryOpen(false);
    };

    useEffect(() => {
        const results = data.filter((category) =>
            category.category_name.toLowerCase().includes(search.toLowerCase())
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
                <h1 className="text-3xl font-bold text-foreground">Categories</h1>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search Categories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-xs pl-10"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            🔍
                        </span>
                    </div>
                    <Button onClick={() => setIsCreateCategoryOpen(true)} className="border-1">
                        <span className="mr-2">+</span> Add Category
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
                    <DataTable columns={columns} data={filteredData} /> // Use categoryColumns
                )}
            </div>
            {isCreateCategoryOpen && (
                <CreateCategoryComponent
                    isOpen={isCreateCategoryOpen}
                    onClose={handleCloseCreateCategory}
                    onCreate={handleCreateCategory}
                />
            )}
        </div>
    );
};

export default CategoriesPage;
