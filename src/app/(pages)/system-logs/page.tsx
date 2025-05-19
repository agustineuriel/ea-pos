"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import LoadingSpinner from "@/components/loading-indicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Log, columns } from "@/components/system_log/column"; // Updated import

const SystemLogPage = () => { // Renamed component
    const [data, setData] = useState<Log[]>([]); // Updated type
    const [loading, setLoading] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filteredData, setFilteredData] = useState<Log[]>([]); // Updated type

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/system-log"); // Updated endpoint
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const result = await response.json();
            setData(result.data);
        } catch (error) {
            console.error("Error fetching system log data:", error); // Updated log message
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    // Filter data based on search term
    useEffect(() => {
        const results = data.filter((log) => // Updated variable name
            log.log_description.toLowerCase().includes(search.toLowerCase()) ||
            log.log_created_by.toLowerCase().includes(search.toLowerCase())
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
                <h1 className="text-3xl font-bold text-foreground">System Logs</h1> {/* Updated title */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search Logs..." // Updated placeholder
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-xs pl-10"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            🔍
                        </span>
                    </div>
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
        </div>
    );
};

export default SystemLogPage;