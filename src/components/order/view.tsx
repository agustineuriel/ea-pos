"use client";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Order } from "./column";
import { OrderItem } from "../order-item/column";
import { Button } from "../ui/button";
import LoadingSpinner from "../loading-indicator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface OrderWithItems extends Order {
  orderItems: OrderItem[];
}
const EditOrderStatus = (props: {
  item: Order;
  isViewOpen: boolean;
  onClose: () => void;
}) => {
  const { item, isViewOpen, onClose } = props;
  const [orderWithItems, setOrderWithItems] = useState<OrderWithItems | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [editedStatus, setEditedStatus] = useState(item.order_status); // Initialize with current status
  const [originalOrder, setOriginalOrder] = useState<Order | null>(null);

  const statusOptions = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!isViewOpen || !item) {
        setLoading(false);
        return; // Don't fetch if the dialog isn't open or no item
      }
      setLoading(true);
      setError(null);
      try {
        // Fetch order details
        const orderResponse = await fetch(`/api/orders/${item.order_id}`);
        if (!orderResponse.ok) {
          throw new Error(`Failed to fetch order: ${orderResponse.status}`);
        }
        const orderData = await orderResponse.json();

        // Fetch order items
        const orderItemsResponse = await fetch(`/api/orders/${item.order_id}`);
        if (!orderItemsResponse.ok) {
          throw new Error(
            `Failed to fetch order items: ${orderItemsResponse.status}`
          );
        }
        const orderItemsData = await orderItemsResponse.json();

        // Combine order and order items data
        const fullOrderData: OrderWithItems = {
          ...orderData.data.order,
          orderItems: orderItemsData.data.orderItems,
        };
        setOrderWithItems(fullOrderData);
        setEditedStatus(fullOrderData.order_status);
        setOriginalOrder(fullOrderData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [isViewOpen, item]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "secondary";
      case "processing":
        return "default";
      case "shipped":
        return "default";
      case "delivered":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleStatusChange = (value: string) => {
    setEditedStatus(value);
  };

  const handleUpdateStatus = async () => {
    setLoading(true);
    console.log("Updating status to:", editedStatus);
    try {
      let updateData: { order_status: string; order_total_price?: number } = {
        order_status: editedStatus,
      };

      if (editedStatus === "Cancelled") {
        updateData.order_total_price = 0; // Set order_total_price to 0
      }

      const response = await fetch(`/api/orders/${item.order_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update order status");
      }
      setIsEditingStatus(false);
      onClose();
      window.location.reload();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const hasStatusChanged = () => {
    return editedStatus !== originalOrder?.order_status;
  };

  if (!isViewOpen) return null; // Don't render if not open

  return (
    <Dialog open={isViewOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            View details for Order ID: {item.order_id}
          </DialogDescription>
        </DialogHeader>
        {loading && (
          <div className="flex bg-white justify-center items-center h-24">
            <LoadingSpinner />
          </div>
        )}
        {error && <div className="p-4 text-red-500">Error: {error}</div>}
        {!loading && !error && orderWithItems && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Order ID:</span>
                <span>{orderWithItems.order_id}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Customer ID:</span>
                <span>{orderWithItems.customer_id}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Customer Name:</span>
                <span>{orderWithItems.customer_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Admin Name:</span>
                <span>{orderWithItems.admin_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Order Date:</span>
                <span>
                  {format(orderWithItems.order_date, "dd/MM/yyyy hh:mm aa")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Order Status:</span>
                {isEditingStatus ? (
                  <div className="flex items-center gap-2">
                    <Select
                      onValueChange={handleStatusChange}
                      value={editedStatus}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={handleUpdateStatus}
                      disabled={!hasStatusChanged()}
                      className={cn(
                        "bg-green-500 hover:bg-green-600 text-white",
                        !hasStatusChanged() && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <Badge
                    variant={getStatusBadgeVariant(orderWithItems.order_status)}
                  >
                    {orderWithItems.order_status}
                  </Badge>
                )}
                {!isEditingStatus && (
                  <Button
                    size="sm"
                    onClick={() => setIsEditingStatus(true)}
                    className="ml-2"
                  >
                    Edit Status
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Total Items:</span>
                <span>
                  {orderWithItems.orderItems
                    ? orderWithItems.orderItems.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )
                    : 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Total Price:</span>
                <span>₱{orderWithItems.order_total_price}</span>
              </div>
            </div>

            <div className="border border-gray-300 p-2 rounded-md max-h-40 overflow-auto mb-4">
              <h2 className="text-lg font-semibold mb-2">Order Items:</h2>
              {orderWithItems.orderItems &&
              orderWithItems.orderItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item ID</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderWithItems.orderItems.map((item) => (
                      <TableRow key={item.item_id}>
                        <TableCell>{item.item_id}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₱{item.unit_price}</TableCell>
                        <TableCell>
                          ₱{item.quantity * item.unit_price}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-2">No items found for this order.</div>
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={() => {
                  window.location.href = `/invoice/${orderWithItems.order_id}`;
                }}
                className="border-1"
              >
                Generate Invoice
              </Button>
              <Button onClick={onClose}>Close</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderStatus;
