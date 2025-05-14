"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Customer } from "@/components/customer/column"; // Adjust the import path

interface CreateCustomerComponentProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (
        newCustomer: Omit<Customer, "customer_id" | "created_at" | "updated_at">
    ) => void;
}

const CreateCustomerComponent: React.FC<CreateCustomerComponentProps> = ({
    isOpen,
    onClose,
    onCreate,
}) => {
    const [newCustomer, setNewCustomer] = useState<
        Omit<Customer, "customer_id" | "created_at" | "updated_at">
    >({
        // Initialize with empty customer data
        customer_name: "",
        customer_address: "",
        customer_email: "",
        customer_number: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({}); // State for error messages

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setNewCustomer((prev) => ({
            ...prev,
            [id]: value,
        }));
        // Clear the error message for the field being changed
        setErrors((prevErrors) => ({ ...prevErrors, [id]: "" }));
    };

    const handleCreateCustomer = async () => {
        setLoading(true);
        const newErrors: { [key: string]: string } = {}; // Local object to store errors
        let hasErrors = false;

        try {
            // Basic validation
            if (!newCustomer.customer_name) {
                newErrors.customer_name = "Please enter customer name.";
                hasErrors = true;
            }
            if (!newCustomer.customer_address) {
                newErrors.customer_address = "Please enter customer address.";
                hasErrors = true;
            }
            if (!newCustomer.customer_email) {
                newErrors.customer_email = "Please enter customer email.";
                hasErrors = true;
            }
             if (!newCustomer.customer_number) {
                newErrors.customer_number = "Please enter customer number.";
                hasErrors = true;
            }

            // Email validation (basic)
            const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
            if (newCustomer.customer_email && !emailRegex.test(newCustomer.customer_email)) {
                newErrors.customer_email = "Please enter a valid email address.";
                hasErrors = true;
            }
            
            if (newCustomer.customer_number && !/^\d{11}$/.test(newCustomer.customer_number)) {
                newErrors.customer_number = "Phone number must contain 11 numeric digits.";
                hasErrors = true;
            }

            if (hasErrors) {
                setErrors(newErrors); // Update the errors state
                return; // Stop processing if there are errors
            }
            setErrors({});

            // Simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Callback to parent component to handle actual creation
            onCreate(newCustomer);

            // Reset the form
            setNewCustomer({
                customer_name: "",
                customer_address: "",
                customer_email: "",
                customer_number: "",
            });
            onClose();
            alert("Customer created successfully!");
            window.location.reload();
        } catch (error: any) {
            console.error("Error creating customer:", error);
            alert(`Error: ${error.message || "Failed to create customer"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Customer</DialogTitle>
                    <DialogDescription>Enter new customer details</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customer_name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="customer_name"
                            value={newCustomer.customer_name}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                        {errors.customer_name && (
                            <p className="text-red-500 text-sm col-span-4 col-start-2">
                                {errors.customer_name}
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customer_address" className="text-right">
                            Address
                        </Label>
                        <Input
                            id="customer_address"
                            value={newCustomer.customer_address}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                        {errors.customer_address && (
                            <p className="text-red-500 text-sm col-span-4 col-start-2">
                                {errors.customer_address}
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customer_email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="customer_email"
                            value={newCustomer.customer_email}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                        {errors.customer_email && (
                            <p className="text-red-500 text-sm col-span-4 col-start-2">
                                {errors.customer_email}
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customer_number" className="text-left">
                            Phone Number
                        </Label>
                        <Input
                            id="customer_number"
                            value={newCustomer.customer_number || ""}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                        {errors.customer_number && (
                            <p className="text-red-500 text-sm col-span-4 col-start-2">
                                {errors.customer_number}
                            </p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleCreateCustomer}
                        className={cn(
                            "bg-green-500 hover:bg-green-600 text-white",
                            loading && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateCustomerComponent;
