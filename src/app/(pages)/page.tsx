import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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
    //  These would be replaced with actual data fetching logic.
    const totalItems = 1500;
    const totalOrders = 500;
    const totalRevenue = "$75,000.00";
    const totalSuppliers = 50;

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
                    description="Total revenue from invoices"
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
                {/* Filler Card -  */}
                <DashboardCard
                    title="Card Filler"
                    description="Description of filler card"
                    value="Filler"
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
