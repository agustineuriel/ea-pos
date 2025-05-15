"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/loading-indicator";

interface Order {
    order_id: number;
    customer_id: number;
    admin_name: string;
    order_date: Date;
    order_status: string;
    order_total_price: number;
}

interface OrderItem {
    order_item_id: number;
    order_id: number;
    item_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    created_at: string;
    updated_at: string;
    description?: string;
    unit?: string;
    name: string;
}

interface Customer {
    customer_id: number;
    customer_name: string;
    customer_address: string;
    customer_email: string;
    customer_number?: string;
}

const fetchOrder = async (orderId: number): Promise<Order | null> => {
    try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch order: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched Order Data:", data);
        return data.data.order as Order;
    } catch (error: any) {
        console.error(error);
        throw error;
    }
};

const fetchOrderItems = async (orderId: number): Promise<OrderItem[]> => {
    try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch order items: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched Order Items Data:", data);
        const orderItemsData = data.data.orderItems;
        const parsedOrderItems = orderItemsData.map((item: OrderItem) => ({
            ...item,
            subtotal: typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal,
        }));

        return parsedOrderItems as OrderItem[];
    } catch (error: any) {
        console.error(error);
        throw error;
    }
};

const fetchCustomer = async (orderId: number): Promise<Customer | null> => {
    try {
        const orderResponse = await fetch(`/api/orders/${orderId}`);
        if (!orderResponse.ok) {
            throw new Error(`Failed to fetch order: ${orderResponse.status}`);
        }
        const orderData = await orderResponse.json();
        console.log("Fetched Order Data for Customer:", orderData);
        const customerId = orderData.data.order.customer_id;

        const customerResponse = await fetch(`/api/customer/${customerId}`);
        if (!customerResponse.ok) {
            throw new Error(`Failed to fetch customer: ${customerResponse.status}`);
        }
        const customerData = await customerResponse.json();
        console.log("Fetched Customer Data:", customerData);
        return customerData.data as Customer;
    } catch (error: any) {
        console.error(error);
        throw error;
    }
};

const InvoicePage: React.FC = () => {
    const [order, setOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<number | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        const pathSegments = window.location.pathname.split("/");
        const orderIdFromPath = parseInt(pathSegments[pathSegments.length - 1], 10);

        setOrderId(isNaN(orderIdFromPath) ? null : orderIdFromPath);
    }, []);

    useEffect(() => {
        if (!orderId) {
            setError("Invalid Order ID");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const orderData = await fetchOrder(orderId);
                if (!orderData) {
                    setError("Order not found");
                    setLoading(false);
                    return;
                }
                setOrder(orderData);

                const customerData = await fetchCustomer(orderId);
                if (!customerData) {
                    setError("Customer not found");
                    setLoading(false);
                    return;
                }
                setCustomer(customerData);

                const items = await fetchOrderItems(orderId);
                setOrderItems(items);
            } catch (err: any) {
                setError(err.message || "Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [orderId]);

    if (loading) {
        return <div className="p-6 text-center"><LoadingSpinner /></div>;
    }

    if (error) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!order || !customer) {
        return <div className="p-6">Order not found.</div>;
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "secondary";
            case "processing":
                return "default";
            case "shipped":
                return "default";
            case "delivered":
                return "default";
            case "cancelled":
                return "destructive";
            default:
                return "outline";
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    };

    return (
        <div className="p-6">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <img src="/logo1.png" alt="Company Logo" className="h-16 w-auto" /> {/* Adjust path as needed */}
                    <div>
                        <h2 className="text-xl font-semibold">EA Street Motoshop</h2>
                        <p className="text-sm text-gray-600">Rizal Street, Guimbal, Iloilo, Philippines</p>
                        <p className="text-sm text-gray-600">Email: eastreet.est2021@gmail.com</p>
                        <p className="text-sm text-gray-600">Phone: 09952291988</p>
                    </div>
                </div>
                <h1 className="text-2xl font-bold">
                    Invoice for Order #{order.order_id}
                </h1>
            </div>


            <div className="flex justify-between mb-6">
                <Card className="w-1/2 mr-4">
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-row justify-between">
                            {" "}
                            <p>
                                <strong>Order ID:</strong> {order.order_id}
                            </p>
                            <Badge
                                variant={getStatusBadgeVariant(order.order_status)}
                                className={cn(
                                    "capitalize",
                                    order.order_status.toLowerCase() === "cancelled" &&
                                        "bg-red-500 text-white",
                                    order.order_status.toLowerCase() === "shipped" &&
                                        "bg-blue-500 text-white",
                                    order.order_status.toLowerCase() === "processing" &&
                                        "bg-gray-500 text-white",
                                    order.order_status.toLowerCase() === "delivered" &&
                                        "bg-green-500 text-white"
                                )}
                            >
                                {order.order_status}
                            </Badge>
                        </div>
                        <p>
                            <strong>Customer Name:</strong> {customer.customer_name}
                        </p>
                        <p>
                            <strong>Customer Address:</strong> {customer.customer_address}
                        </p>
                        <p>
                            <strong>Customer Email:</strong> {customer.customer_email}
                        </p>
                        <p>
                            <strong>Customer Number:</strong> {customer.customer_number}
                        </p>
                        <p>
                            <strong>Admin Name:</strong> {order.admin_name}
                        </p>
                        <p>
                            <strong>Order Date:</strong> {new Date(order.order_date).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                            })}
                        </p>
                        <p>
                            <strong>Total Price:</strong>{" "}
                            {formatCurrency(order.order_total_price)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Unit Price</TableHead>
                                 <TableHead>Unit</TableHead>
                                <TableHead>Subtotal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orderItems.map((item) => (
                                <TableRow key={item.order_item_id}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                                    <TableCell>{item.unit}</TableCell>
                                    <TableCell>{formatCurrency(item.subtotal)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4 flex flex-row justify-end gap-4">
                      <p className="text-lg font-semibold">
                        Total Items: {orderItems.reduce((total, item) => total + item.quantity, 0)}
                      </p>
                      <p className="text-lg font-semibold">
                        Total: {formatCurrency(order.order_total_price)}
                      </p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button
                    variant="outline"
                    onClick={() => window.print()}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 print:hidden"
                >
                    Print Invoice
                </Button>
            </div>
        </div>
    );
};

export default InvoicePage;
