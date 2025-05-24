"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import LoadingSpinner from '@/components/loading-indicator';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isSameMonth, parseISO } from "date-fns" // Import parseISO
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
    const [totalItemsQuantity, setTotalItemsQuantity] = useState<number | string>("Loading...");
    const [totalSuppliers, setTotalSuppliers] = useState<number | string>("Loading...");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revenuePerDay, setRevenuePerDay] = useState<{ date: string; revenue: number }[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date()); // Initialize with current date

    // Function to handle month change for the filter
    const handleMonthChange = (month: Date | undefined) => {
        if (month) {
            setSelectedMonth(month);
        }
    };

    // Helper function for formatting currency
    const formatCurrency = (value: number) => {
        // Format as Philippine Peso (PHP) with 2 decimal places and comma separators
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

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

                const allOrders = ordersData?.data ?? [];
                const inventoryArray = inventoryData?.data ?? [];
                const suppliersArray = suppliersData?.data ?? [];

                // Filter orders by selected month
                const filteredOrders = allOrders.filter((order: any) =>
                    isSameMonth(parseISO(order.order_date), selectedMonth)
                );

                // Calculate total revenue for the filtered month
                let revenue = 0;
                if (Array.isArray(filteredOrders)) {
                    revenue = filteredOrders.reduce((sum, order) => {
                        const price = typeof order.order_total_price === 'string'
                            ? parseFloat(order.order_total_price)
                            : order.order_total_price;
                        return sum + (price || 0); // Ensure price is a number
                    }, 0);
                }
                setTotalRevenue(formatCurrency(revenue)); // Apply currency formatting
                setTotalOrders(filteredOrders.length); // Total orders for the filtered month
                setTotalSuppliers(suppliersArray.length); // Total suppliers (not month-filtered)

                // Calculate total quantity of all items in inventory
                let totalQuantity = 0;
                if (Array.isArray(inventoryArray)) {
                    totalQuantity = inventoryArray.reduce((sum, item: any) => {
                        return sum + (item.quantity || 0); // Sum the quantity of each item
                    }, 0);
                }
                setTotalItemsQuantity(totalQuantity); // Set the new total items quantity


                // Calculate revenue per day for the selected month (using filteredOrders)
                const dailyRevenue: { [date: string]: number } = {};
                if (Array.isArray(filteredOrders)) {
                    filteredOrders.forEach((order: any) => {
                        const orderDate = new Date(order.order_date);
                        const formattedDate = format(orderDate, 'yyyy-MM-dd');
                        const price = typeof order.order_total_price === 'string'
                            ? parseFloat(order.order_total_price)
                            : order.order_total_price;
                        dailyRevenue[formattedDate] = (dailyRevenue[formattedDate] || 0) + (price || 0);
                    });
                }
                const dailyData = Object.entries(dailyRevenue).map(([date, revenue]) => ({ date, revenue }));
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
    }, [selectedMonth]); // Re-run effect when selectedMonth changes


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
            <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
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
                                format(selectedMonth, "MMM yyyy")
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

            <div
                className={cn(
                    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
                    "w-full"
                )}
            >
                <DashboardCard
                    title="Total Revenue"
                    description={`Total revenue for ${format(selectedMonth, "MMMM yyyy")}`}
                    value={totalRevenue}
                    className="bg-card text-card-foreground"
                />
                <DashboardCard
                    title="Total Orders"
                    description={`Total orders for ${format(selectedMonth, "MMMM yyyy")}`}
                    value={totalOrders}
                    className="bg-card text-card-foreground"
                />
                <DashboardCard
                    title="Total Items Quantity"
                    description="Total quantity in inventory"
                    value={totalItemsQuantity}
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
                    <h2 className="text-xl font-semibold">Revenue Overview</h2>
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
                                        tickFormatter={(value) => formatCurrency(value as number)} // Apply currency formatting to Y-axis ticks
                                    />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)} // Apply currency formatting to tooltip values
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