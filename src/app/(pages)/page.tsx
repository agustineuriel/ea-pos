"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import LoadingSpinner from '@/components/loading-indicator';

interface DashboardCardProps {
    title: string;
    description: string;
    value: string | number;
    className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, value, className }) => {
    return (
        <Card className={cn("shadow-lg transition-transform transform hover:scale-105", className)}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
};

const DashboardPage = () => {
    const [totalRevenue, setTotalRevenue] = useState<number | string>("Loading...");
    const [totalOrders, setTotalOrders] = useState<number | string>("Loading...");
    const [totalItems, setTotalItems] = useState<number | string>("Loading...");
    const [totalSuppliers, setTotalSuppliers] = useState<number | string>("Loading...");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [ordersRes, inventoryRes, suppliersRes] = await Promise.all([
                    fetch('/api/orders'),
                    fetch('/api/inventory'),
                    fetch('/api/supplier') 
                ]);

                if (!ordersRes.ok || !inventoryRes.ok || !suppliersRes.ok) {
                    const message = `Failed to fetch data: ${ordersRes.statusText}, ${inventoryRes.statusText}, ${suppliersRes.statusText}`;
                    console.error(message);
                    setError(message);
                    return;
                }

                const ordersData = await ordersRes.json();
                console.log("Orders Data:", ordersData);
                const inventoryData = await inventoryRes.json();
                const suppliersData = await suppliersRes.json();

                // Extract orders array from response data
                const ordersArray = ordersData?.data ?? [];
                // Extract inventory array from response data
                const inventoryArray = inventoryData?.data ?? [];
                // Extract suppliers array from response data
                const suppliersArray = suppliersData?.data ?? [];

                // Calculate total revenue
                let revenue = 0;
                if (Array.isArray(ordersArray)) {
                    revenue = ordersArray.reduce((sum, order) => {
                        const price = typeof order.order_total_price === 'string'
                            ? parseFloat(order.order_total_price)
                            : order.order_total_price;
                        return sum + price;
                    }, 0);
                }
                setTotalRevenue(`₱${revenue.toFixed(2)}`);
                console.log("Total Revenue:", revenue);
                setTotalOrders(ordersArray.length);
                console.log("Total Orders:", ordersArray.length);
                setTotalItems(inventoryArray.length);
                console.log("Total Items:", inventoryArray.length);
                setTotalSuppliers(suppliersArray.length);
                console.log("Total Suppliers:", suppliersArray.length);

            } catch (err: any) {
                console.error("Error fetching dashboard data:", err);
                setError(err.message || "An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen p-4 text-red-500">
                Error loading dashboard data: {error}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex flex-col gap-6 p-4 md:p-6 lg:p-8",
                "min-h-screen bg-background overflow-hidden"
            )}
        >
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>

            <div
                className={cn(
                    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
                    "w-full"
                )}
            >
                <DashboardCard
                    title="Total Revenue"
                    description="Total revenue from sales"
                    value={totalRevenue}
                    className="bg-card text-card-foreground"
                />
                <DashboardCard
                    title="Total Orders"
                    description="Total number of orders"
                    value={totalOrders}
                    className="bg-card text-card-foreground"
                />
                <DashboardCard
                    title="Total Items"
                    description="Total items in inventory"
                    value={totalItems}
                    className="bg-card text-card-foreground"
                />
                <DashboardCard
                    title="Total Suppliers"
                    description="Total number of suppliers"
                    value={totalSuppliers}
                    className="bg-card text-card-foreground"
                />
            </div>

            {/* Overview Section with Graph Placeholder */}
            <div className="flex-1 bg-card rounded-lg p-4 shadow-md flex flex-col">
                <h2 className="text-xl font-semibold mb-4">Overview</h2>
                <div
                    className={cn(
                        "flex-1 rounded-lg bg-muted",
                        "flex items-center justify-center",
                        "min-h-[200px]"
                    )}
                >
                    <span className="text-muted-foreground">
                        [Graph Placeholder - Insert Chart Here]
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;