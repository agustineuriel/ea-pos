"use client";

import React, { useState, useEffect } from "react";
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

interface EditCustomerComponentProps {
    customer: Customer;
    isEditOpen: boolean;
    onClose: () => void;
}

const EditCustomerComponent: React.FC<EditCustomerComponentProps> = ({
    customer,
    isEditOpen,
    onClose,
}) => {
    const [editedCustomer, setEditedCustomer] = useState<Customer>({ ...customer }); // Initialize with customer data
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isPristine, setIsPristine] = useState(true); // Track if form is unchanged

    useEffect(() => {
        // Initialize form with customer data when the dialog opens
        if (isEditOpen) {
            setEditedCustomer({ ...customer });
            setIsPristine(true); // Reset pristine state on open
            setErrors({}); //clear errors
        }
    }, [isEditOpen, customer]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setEditedCustomer((prev) => ({
            ...prev,
            [id]: value,
        }));
        setIsPristine(false); // Mark form as changed
         setErrors((prevErrors) => ({ ...prevErrors, [id]: "" })); // Clear error on input change
    };

    const handleEditCustomer = async () => {
        setLoading(true);
        const newErrors: { [key: string]: string } = {};
        let hasErrors = false;

        try {
             if (!editedCustomer.customer_name) {
                newErrors.customer_name = "Please enter customer name.";
                hasErrors = true;
            }
            if (!editedCustomer.customer_address) {
                newErrors.customer_address = "Please enter customer address.";
                hasErrors = true;
            }
            if (!editedCustomer.customer_email) {
                newErrors.customer_email = "Please enter customer email.";
                hasErrors = true;
            }
             if (!editedCustomer.customer_number) {
                newErrors.customer_number = "Please enter customer number.";
                hasErrors = true;
            }

            // Email validation (basic)
            const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
            if (editedCustomer.customer_email && !emailRegex.test(editedCustomer.customer_email)) {
                newErrors.customer_email = "Please enter a valid email address.";
                hasErrors = true;
            }
            
            if (editedCustomer.customer_number && !/^\d{11}$/.test(editedCustomer.customer_number)) {
                newErrors.customer_number = "Phone number must contain only numeric characters.";
                hasErrors = true;
            }

             if (hasErrors) {
                setErrors(newErrors); // Update the errors state
                return; // Stop processing if there are errors
            }
            setErrors({});

            const response = await fetch(`/api/customer/${customer.customer_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editedCustomer),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to update customer: ${response.status}`);
            }

            const updatedCustomerData = await response.json();
            onClose();
            // alert(updatedCustomerData.message || "Customer updated successfully!");
            window.location.reload(); // Reload to reflect changes
        } catch (error: any) {
            console.error("Error updating customer:", error);
            // alert(`Error: ${error.message || "Failed to update customer"}`);
        } finally {
            setLoading(false);
        }
    };

    const isSaveDisabled = loading || isPristine;

    return (
        <Dialog open={isEditOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Customer</DialogTitle>
                    <DialogDescription>
                        Edit customer details for Customer ID: {customer.customer_id}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customer_id" className="text-right">
                            Customer ID
                        </Label>
                        <Input
                            id="customer_id"
                            value={editedCustomer.customer_id.toString()}
                            className="col-span-3"
                            disabled
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customer_name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="customer_name"
                            value={editedCustomer.customer_name}
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
                            value={editedCustomer.customer_address}
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
                        <Label htmlFor="customer_number" className="text-left">
                            Phone Number
                        </Label>
                        <Input
                            id="customer_number"
                            value={editedCustomer.customer_number || ""}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                        {errors.customer_number && (
                            <p className="text-red-500 text-sm col-span-4 col-start-2">
                                {errors.customer_number}
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customer_email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="customer_email"
                            value={editedCustomer.customer_email}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                         {errors.customer_email && (
                            <p className="text-red-500 text-sm col-span-4 col-start-2">
                                {errors.customer_email}
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
                        onClick={handleEditCustomer}
                        className={cn(
                            "bg-blue-500 hover:bg-blue-600 text-white",
                            loading && "opacity-50 cursor-not-allowed",
                            isSaveDisabled && "opacity-50 cursor-not-allowed" // Disable when appropriate
                        )}
                        disabled={isSaveDisabled}
                    >
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditCustomerComponent;
