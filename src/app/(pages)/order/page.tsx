"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Item } from '@/components/inventory/column';
import { Customer } from '@/components/customer/column';

// Define the Admin type
interface Admin {
    admin_id: number;
    admin_first_name: string;
    admin_last_name: string;

}

// Define the Order type with specified data types
interface Order {
    order_id: number; // serial
    customer_id: number; // int
    admin_name: string; // varchar
    order_date: Date;    // Date
    order_status: string; // varchar
    order_total_price: number; // numeric
}

// Define the OrderItem type, matching your provided table structure
interface OrderItem {
    order_item_id: number;
    order_id: number;
    item_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    created_at: string;
    updated_at: string;
    description?: string; // Add description
    unit?: string;       // Add unit
}

const CreateOrderPage = () => {
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>();
    const [orderDate, setOrderDate] = useState<Date | undefined>();
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [availableItems, setAvailableItems] = useState<Item[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<number | undefined>();
    const [quantity, setQuantity] = useState<number>(1);
    const [price, setPrice] = useState<number>(0);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orderStatus, setOrderStatus] = useState<string>('Pending');
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedAdminId, setSelectedAdminId] = useState<number | undefined>();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [newCustomerName, setNewCustomerName] = useState<string>('');
    const [newCustomerAddress, setNewCustomerAddress] = useState<string>('');
    const [newCustomerEmail, setNewCustomerEmail] = useState<string>('');
    const [newCustomerNumber, setNewCustomerNumber] = useState<string>('');             // Added for new customer number
    const [isCreatingNewCustomer, setIsCreatingNewCustomer] = useState(false);
    const [orderTotalPrice, setOrderTotalPrice] = useState<number>(0); // State for total order price


    // Fetch items from the database
    const fetchItems = useCallback(async () => {
        try {
            const response = await fetch('/api/inventory');
            if (!response.ok) {
                throw new Error('Failed to fetch items');
            }
            const data = await response.json();
            setAvailableItems(data.data);
        } catch (error: any) {
            setError(error.message);
            console.error('Error fetching items:', error);
        }
    }, []);

    // Fetch customers from the database
    const fetchCustomers = useCallback(async () => {
        try {
            const response = await fetch('/api/customer');
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const data = await response.json();
            setCustomers(data.data);
        } catch (error: any) {
            setError(error.message);
            console.error('Error fetching customers:', error);
        }
    }, []);

    // Fetch customers from the database
    const fetchAdmins = useCallback(async () => {
        try {
            const response = await fetch('/api/admins');
            if (!response.ok) {
                throw new Error('Failed to fetch admin');
            }
            const data = await response.json();
            setAdmins(data.data);
        } catch (error: any) {
            setError(error.message);
            console.error('Error fetching admin:', error);
        }
    }, []);

    useEffect(() => {
        fetchItems();
        fetchCustomers();
        fetchAdmins();
    }, [fetchItems, fetchCustomers, fetchAdmins]);

    // Function to add item to order
    const handleAddItem = () => {
        if (!selectedItemId) {
            setError("Please select an item.");
            return;
        }
        if (quantity === undefined || quantity <= 0) {
            setError("Quantity must be greater than zero.");
            return;
        }

        const itemToAdd = availableItems.find(item => item.item_id === selectedItemId);
        if (!itemToAdd) {
            setError("Item not found.");
            return;
        }

        // Check if there's enough quantity in stock
        if (quantity > itemToAdd.quantity) {
            setError(`Not enough stock. Available quantity: ${itemToAdd.quantity} ${itemToAdd.unit}`);
            return;
        }

        const subtotal = quantity * itemToAdd.price;
        // Check if the item is already in the order
        const existingItemIndex = orderItems.findIndex(item => item.item_id === selectedItemId);
        if (existingItemIndex > -1) {
            // Update quantity and subtotal
            const updatedOrderItems = [...orderItems];
            updatedOrderItems[existingItemIndex] = {
                ...updatedOrderItems[existingItemIndex],
                quantity: updatedOrderItems[existingItemIndex].quantity + quantity,
                unit_price: itemToAdd.price,
                subtotal: subtotal,
            };
            setOrderItems(updatedOrderItems);
        } else {
            // Add new item to order
            setOrderItems([...orderItems, {
                order_item_id: orderItems.length + 1,
                order_id: orders.length + 1, // This will be overwritten by the database
                item_id: selectedItemId,
                quantity: quantity,
                unit_price: itemToAdd.price,
                subtotal: subtotal,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                description: itemToAdd.description, // Added description
                unit: itemToAdd.unit,       // Added unit
            }]);
        }

        // Clear item selection and quantity
        setSelectedItemId(undefined);
        setQuantity(1);
        setError(null);
    };

    // Function to remove item from order
    const handleRemoveItem = (itemId: number) => {
        setOrderItems(orderItems.filter(item => item.item_id !== itemId));
    };

    // Function to calculate total amount
    useEffect(() => {
        const newTotal = orderItems.reduce((acc, item) => acc + item.subtotal, 0);
        setTotalAmount(newTotal);
        setOrderTotalPrice(newTotal); // Update total order price
    }, [orderItems]);

    // Function to handle order submission
    const handleCreateOrder = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!orderDate) {
                setError("Please select an order date.");
                return;
            }
            if (!selectedAdminId) {
                setError("Please select an admin for the order.");
                return;
            }
            if (orderItems.length === 0) {
                setError("Please add items to the order.");
                return;
            }

            // Convert unit_price to a number and validate
            const orderItemsWithCorrectPrices = orderItems.map(item => {
                const unitPriceNum = typeof item.unit_price === 'string' ? parseFloat(item.unit_price) : item.unit_price;
                const subtotalNum = typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal;

                if (isNaN(unitPriceNum)) {
                    throw new Error(`Invalid unit price for item ${item.item_id}`);
                }
                if (isNaN(subtotalNum)) {
                    throw new Error(`Invalid subtotal for item ${item.item_id}`);
                }
                return {
                    ...item,
                    unit_price: unitPriceNum,
                    subtotal: subtotalNum,
                };
            });
            setOrderItems(orderItemsWithCorrectPrices);

            let customer: Customer;

            if (isCreatingNewCustomer) {
                if (!newCustomerName) {
                    setError("Please enter a customer name.");
                    return;
                }
                if (!newCustomerAddress) {
                    setError("Please enter a customer address.");
                    return;
                }
                if (!newCustomerEmail) {
                    setError("Please enter a customer email.");
                    return;
                }
                if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(newCustomerEmail)) {
                    setError("Please enter a valid customer email address.");
                    return;
                }
                if (!newCustomerNumber) {
                    setError("Please enter a customer number");
                    return;
                }
                if (!/^\d{11}$/.test(newCustomerNumber)) {
                    setError("Please enter a valid 11-digit customer phone number.");
                    return;
                }
                // Create new customer
                const createCustomerResponse = await fetch('/api/customer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        customer_name: newCustomerName,
                        customer_address: newCustomerAddress,
                        customer_email: newCustomerEmail,
                        customer_number: newCustomerNumber
                    }),
                });

                if (!createCustomerResponse.ok) {
                    const customerErrorData = await createCustomerResponse.json();
                    console.error("Customer creation error:", customerErrorData); // Log the error
                    throw new Error(customerErrorData.error || 'Failed to create customer');
                }

                const newCustomerData = await createCustomerResponse.json();
                customer = newCustomerData.data;
                setSelectedCustomerId(customer.customer_id);
                await fetchCustomers(); // Refresh
            }
            else if (selectedCustomerId) {
                customer = customers.find(c => c.customer_id === selectedCustomerId)!;
            }
            else {
                setError("Please select an existing customer or create a new one.");
                return;
            }


            const adminDetails = admins.find(admin => admin.admin_id === selectedAdminId);
            if (!adminDetails) {
                setError("Admin not found.");
                setLoading(false);
                return;
            }

            // Construct order object, ensuring it matches the Order interface
            const newOrder: Order = {
                order_id: 0, //  Will be auto-generated by the database (serial)
                customer_id: customer.customer_id,
                admin_name: `${adminDetails.admin_first_name} ${adminDetails.admin_last_name}`,
                order_date: orderDate,
                order_status: orderStatus,
                order_total_price: orderTotalPrice,
            };

            console.log("New order object:", newOrder); // Log the order object before sending

            // Simulate API call
            const orderResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newOrder), // Send the newOrder object
            });


            if (!orderResponse.ok) {
                const orderErrorData = await orderResponse.json();
                console.error("Order creation error:", orderErrorData);  // Log error
                throw new Error(orderErrorData.error || 'Failed to create order');
            }
            const orderResult = await orderResponse.json();
            console.log("Order creation response:", orderResult); // Log the response
            const createdOrderId = orderResult.data.order_id;

            // Create order items
            for (const orderItem of orderItemsWithCorrectPrices) {
                const orderItemData = {
                    order_id: createdOrderId,
                    item_id: orderItem.item_id,
                    quantity: orderItem.quantity,
                    unit_price: orderItem.unit_price,
                    subtotal: orderItem.subtotal,
                };
                console.log("Order item data:", orderItemData);
                const orderItemResponse = await fetch('/api/order_items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderItemData),
                });
                if (!orderItemResponse.ok) {
                    const orderItemError = await orderItemResponse.json();
                    console.error("Order item creation error:", orderItemError); // Log
                    throw new Error(orderItemError.error || 'Failed to create order item');
                }
            }

            // Update item quantities (PATCH)
            for (const orderItem of orderItemsWithCorrectPrices) {
                const itemToUpdate = availableItems.find(item => item.item_id === orderItem.item_id);
                if (itemToUpdate) {
                    const newQuantity = itemToUpdate.quantity - orderItem.quantity;
                    console.log(`Updating item ${orderItem.item_id} quantity to:`, newQuantity);
                    const updateResponse = await fetch(`/api/quantity/${orderItem.item_id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ quantity: newQuantity }),
                    });

                    if (!updateResponse.ok) {
                        const updateErrorData = await updateResponse.json();
                        console.error("Item quantity update error:", updateErrorData);  // Log
                        throw new Error(updateErrorData.error || `Failed to update quantity for item ${orderItem.item_id}`);
                    }
                }
            }

            // Update the orders state
            const newOrderWithId: Order = {
                ...newOrder,
                order_id: createdOrderId
            }
            setOrders([...orders, newOrderWithId]);
            console.log("Order created successfully. New orders state:", orders);
        } catch (error: any) {
            setError(error.message);
            console.error("Error during order creation:", error); // catch
        } finally {
            setLoading(false);
            console.log("Order creation process completed.");
        }
    };

    useEffect(() => {
        if (selectedCustomerId && selectedCustomerId !== -1) {
            const selectedCustomer = customers.find(c => c.customer_id === selectedCustomerId);
            if (selectedCustomer) {
                setNewCustomerName(selectedCustomer.customer_name);
                setNewCustomerAddress(selectedCustomer.customer_address);
                setNewCustomerEmail(selectedCustomer.customer_email);
                setNewCustomerNumber(selectedCustomer.customer_number || '');
                setIsCreatingNewCustomer(false);
            }
        } else {
            setNewCustomerName('');
            setNewCustomerAddress('');
            setNewCustomerEmail('');
            setNewCustomerNumber('');
            setIsCreatingNewCustomer(true);
        }
    }, [selectedCustomerId, customers]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Create Order</h1>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Customer</label>
                <Select
                    onValueChange={(value) => {
                        const customerId = Number(value);
                        setSelectedCustomerId(customerId);
                        setIsCreatingNewCustomer(customerId === -1);
                    }}
                    value={selectedCustomerId?.toString()}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an existing customer" />
                    </SelectTrigger>
                    <SelectContent>
                        {customers.map((customer) => (
                            <SelectItem key={customer.customer_id} value={customer.customer_id.toString()}>
                                {customer.customer_name}
                            </SelectItem>
                        ))}
                        <SelectItem value="-1">Create New Customer</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* New Customer Form */}
            {isCreatingNewCustomer && (
                <>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">New Customer Name</label>
                        <Input
                            type="text"
                            value={newCustomerName}
                            onChange={(e) => {
                                setNewCustomerName(e.target.value);
                                setError(null); // Clear errors on input change
                            }}
                            className="w-full"
                            placeholder="Enter new customer name"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">New Customer Address</label>
                        <Input
                            type="text"
                            value={newCustomerAddress}
                            onChange={(e) => {
                                setNewCustomerAddress(e.target.value);
                                setError(null);
                            }}
                            className="w-full"
                            placeholder="Enter new customer address"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">New Customer Email</label>
                        <Input
                            type="email"
                            value={newCustomerEmail}
                            onChange={(e) => {
                                setNewCustomerEmail(e.target.value);
                                setError(null);
                            }}
                            className="w-full"
                            placeholder="Enter new customer email"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">New Customer Number</label>
                        <Input
                            type="text"
                            value={newCustomerNumber}
                            onChange={(e) => {
                                setNewCustomerNumber(e.target.value);
                                setError(null);
                            }}
                            className="w-full"
                            placeholder="Enter new customer number"
                        />
                    </div>
                </>
            )}

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Admin</label>
                <Select onValueChange={(value) => setSelectedAdminId(Number(value))} value={selectedAdminId?.toString()}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Admin" />
                    </SelectTrigger>
                    <SelectContent>
                        {admins.map((admin) => (
                            <SelectItem key={admin.admin_id} value={admin.admin_id.toString()}>
                                {admin.admin_first_name} {admin.admin_last_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Order Date</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !orderDate && "text-muted-foreground"
                            )}
                        >
                            {orderDate ? format(orderDate, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={orderDate}
                            onSelect={setOrderDate}
                            disabled={(date) =>
                                date < new Date()
                            }
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Items</label>
                {orderItems.map(item => (
                    <div key={item.item_id} className="flex items-center justify-between mb-2">
                        <div>
                            {item.description} ({item.quantity} {item.unit} x ₱{item.unit_price}) Subtotal: ₱{item.subtotal}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.item_id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Button>
                    </div>
                ))}
                <div className="flex items-end gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Item</label>
                        <Select
                            onValueChange={(value) => {
                                const selectedId = Number(value);
                                setSelectedItemId(selectedId);
                                const selectedItemData = availableItems.find(item => item.item_id === selectedId);
                                if (selectedItemData) {
                                    setPrice(selectedItemData.price);
                                }
                                setError(null); // Clear error
                            }}
                            value={selectedItemId?.toString()}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select an item" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableItems.map((item) => (
                                    <SelectItem key={item.item_id} value={item.item_id.toString()}>
                                        {item.description} ({item.quantity} {item.unit})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <Input
                            type="number"
                            value={quantity}
                            onChange={(e) => {
                                const qty = Number(e.target.value);
                                setQuantity(qty);
                                setError(null);
                            }}
                            min="1"
                            className="w-full"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <Input
                            type="number"
                            value={price}
                            className="w-full"
                            readOnly
                        />
                    </div>
                    <Button onClick={handleAddItem} disabled={!selectedItemId} className="self-end">Add Item</Button>
                </div>
            </div>

            <div className="mb-4">
                <h2 className="text-lg font-semibold">Total Amount: ₱{totalAmount}</h2>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Order Status</label>
                <Select onValueChange={(value) => setOrderStatus(value)} value={orderStatus}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select order status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="mb-4">
                <h2 className="text-lg font-semibold">Orders</h2>
                {orders.map((order) => (
                    <div key={order.order_id} className="border p-4 mb-2">
                        <p>Order ID: {order.order_id}</p>
                        <p>Customer ID: {order.customer_id}</p>
                        {/* <p>Customer Name: {customerName}</p>
            <p>Customer Address: {customerAddress}</p>
            <p>Customer Email: {customerEmail}</p> */}
                        <p>Admin Name: {order.admin_name}</p>
                        <p>Order Date: {format(order.order_date, "PPP")}</p>
                        <p>Order Status: {order.order_status}</p>
                        <p>Order Total Price: ₱{order.order_total_price}</p>
                    </div>
                ))}
            </div>

            <Button onClick={handleCreateOrder} disabled={loading} className={loading ? "opacity-50 cursor-not-allowed border-1" : "border-1"}>
                {loading ? 'Creating Order...' : 'Create Order'}
            </Button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
};

export default CreateOrderPage;

