"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import LoadingSpinner from '@/components/loading-indicator';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
    const [revenuePerDay, setRevenuePerDay] = useState<{ date: string; revenue: number }[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());

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
                setTotalOrders(ordersArray.length);
                setTotalItems(inventoryArray.length);
                setTotalSuppliers(suppliersArray.length);

                // Calculate revenue per day for the selected month
                const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
                const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

                const dailyRevenue: { [date: string]: number } = {};
                if (Array.isArray(ordersArray)) {
                    ordersArray.forEach(order => {
                        const orderDate = new Date(order.created_at);  // Assuming 'created_at' is the order date
                        if (orderDate >= startOfMonth && orderDate <= endOfMonth) {
                            const formattedDate = format(orderDate, 'yyyy-MM-dd');
                            const price = typeof order.order_total_price === 'string'
                                ? parseFloat(order.order_total_price)
                                : order.order_total_price;
                            dailyRevenue[formattedDate] = (dailyRevenue[formattedDate] || 0) + price;
                        }
                    });
                }
                const dailyData = Object.entries(dailyRevenue).map(([date, revenue]) => ({ date, revenue }));
                // Sort the data by date in ascending order
                dailyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                setRevenuePerDay(dailyData);

            } catch (err: any) {
                console.error("Error fetching dashboard data:", err);
                setError(err.message || "An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [selectedMonth]);

    const handleMonthChange = (month: Date | undefined) => {
        if (month) {
            setSelectedMonth(month);
        }
    };

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

            {/* Overview Section with Graph */}
            <div className="flex-1 bg-card rounded-lg p-4 shadow-md flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Overview</h2>
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[200px] justify-start text-left font-normal",
                                        !selectedMonth && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedMonth ? (
                                        format(selectedMonth, "PPP")
                                    ) : (
                                        <span>Pick a month</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <div className="p-4">
                                    <input
                                        type="month"
                                        value={format(selectedMonth, "yyyy-MM")}
                                        onChange={e => {
                                            const [year, month] = e.target.value.split('-').map(Number);
                                            if (!isNaN(year) && !isNaN(month)) {
                                                handleMonthChange(new Date(year, month - 1, 1));
                                            }
                                        }}
                                        className="border rounded px-2 py-1"
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleMonthChange(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))}
                            aria-label="Previous Month"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleMonthChange(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))}
                            aria-label="Next Month"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <AnimatePresence>
                    {revenuePerDay.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={cn(
                                "flex-1 rounded-lg bg-muted",
                                "min-h-[200px]",
                                "p-4",
                                "flex items-center justify-center"
                            )}
                            style={{ height: '100%' }}
                        >
                            {/* Chart  */}
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={revenuePerDay}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis
                                        tickFormatter={(value) => `₱${value}`} // Add peso sign to Y-axis ticks
                                    />
                                    <Tooltip
                                        formatter={(value: number) => `₱${value.toFixed(2)}`} // Add peso sign to tooltip values
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#8884d8"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={cn(
                                "flex-1 rounded-lg bg-muted",
                                "flex items-center justify-center",
                                "min-h-[200px] min-w-[200px]"
                            )}
                        >
                            <span className="text-muted-foreground">
                                No revenue data for the selected month.
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DashboardPage;

