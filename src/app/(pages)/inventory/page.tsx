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
import CreateCategoryComponent from "@/components/category/create";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner"; 

interface Category {
  category_id: number;
  category_name: string;
}

const InventoryPage = () => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/inventory");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      setData(result.data);

      // Fetch categories for the dropdown
      const categoriesResponse = await fetch("/api/categories");
      if (!categoriesResponse.ok) {
        throw new Error("Failed to fetch categories");
      }
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData.data);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Error fetching inventory data: ${errorMessage}`); // Use toaster for fetch errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Function to handle item creation
  const handleCreateItem = async (
    newItem: Omit<Item, "item_id" | "created_at" | "updated_at">
  ) => {
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

      await fetchData();
      setIsCreateItemOpen(false);
      toast.success("Item created successfully!"); // Success toast
    } catch (error: any) {
      console.error("Error creating item:", error);
      toast.error(`Error: ${error.message}`); // Use toast.error()
    }
  };

  const handleCreateCategory = async (newCategory: {
    category_name: string;
  }) => {
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

      setIsCreateCategoryOpen(false);
      await fetchData();
      toast.success("Category created successfully!"); // Success toast
    } catch (error: any) {
      console.error("Error creating category:", error);
      toast.error(`Error: ${error.message}`); // Use toast.error()
    }
  };

  const handleCloseCreateItem = () => {
    setIsCreateItemOpen(false);
  };

  const handleCloseCreateCategory = () => {
    setIsCreateCategoryOpen(false);
  };

  // Filter data based on search term and category
  useEffect(() => {
    const results = data.filter((item) => {
      const searchLower = search.toLowerCase();
      const categoryMatch =
        selectedCategory === "all" || item.category_name === selectedCategory;

      return (
        categoryMatch &&
        (item.description.toLowerCase().includes(searchLower) ||
          item.unit.toLowerCase().includes(searchLower) ||
          item.category_name.toLowerCase().includes(searchLower) ||
          item.supplier_name.toLowerCase().includes(searchLower) ||
          item.price.toString().includes(searchLower) ||
          item.quantity.toString().includes(searchLower) ||
          item.reorder_threshold.toString().includes(searchLower))
      );
    });
    setFilteredData(results);
  }, [search, selectedCategory, data]);

  console.log("Data:", data);
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
          <Button
            onClick={() => setIsCreateCategoryOpen(true)}
            className="border-1"
          >
            <span className="mr-2">+</span> Add Category
          </Button>
          <Button
            onClick={() => setIsCreateItemOpen(true)}
            className="border-1"
          >
            <span className="mr-2">+</span> Add Item
          </Button>
        </div>
      </div>
      
      <div className="flex flex-row items-center gap-4">
        <Select onValueChange={setSelectedCategory} value={selectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem
                key={category.category_id}
                value={category.category_name}
              >
                {category.category_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search Inventory..."
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
      {isCreateItemOpen && (
        <CreateItemComponent
          isOpen={isCreateItemOpen}
          onClose={handleCloseCreateItem}
          onCreate={handleCreateItem}
        />
      )}
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

export default InventoryPage;