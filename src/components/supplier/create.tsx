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
import type { Supplier } from "@/components/supplier/column";

interface CreateSupplierComponentProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (
        newSupplier: Omit<Supplier, "supplier_id" | "created_at" | "updated_at">
    ) => void;
}

const CreateSupplierComponent: React.FC<CreateSupplierComponentProps> = ({
    isOpen,
    onClose,
    onCreate,
}) => {
    const [newSupplier, setNewSupplier] = useState<
        Omit<Supplier, "supplier_id" | "created_at" | "updated_at">
    >({
        // Initialize with empty supplier data
        supplier_name: "",
        supplier_contact_person: "",
        supplier_address: "",
        supplier_email: "",
        supplier_number: "", 
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({}); // State for error messages

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setNewSupplier((prev) => ({
            ...prev,
            [id]: value,
        }));
        // Clear the error message for the field being changed
        setErrors((prevErrors) => ({ ...prevErrors, [id]: "" }));
    };

    const handleCreateSupplier = async () => {
        setLoading(true);
        const newErrors: { [key: string]: string } = {}; // Local object to store errors
        let hasErrors = false;

        try {
            // Basic validation
            if (!newSupplier.supplier_name) {
                newErrors.supplier_name = "Please enter supplier name.";
                hasErrors = true;
            }
            if (!newSupplier.supplier_address) {
                newErrors.supplier_address = "Please enter supplier address.";
                hasErrors = true;
            }
            if (!newSupplier.supplier_email) {
                newErrors.supplier_email = "Please enter supplier email.";
                hasErrors = true;
            }

            // Email validation (basic)
            const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
            if (newSupplier.supplier_email && !emailRegex.test(newSupplier.supplier_email)) {
                newErrors.supplier_email = "Please enter a valid email address.";
                hasErrors = true;
            }
             if (newSupplier.supplier_number && !/^\d{11}$/.test(newSupplier.supplier_number)) {
                newErrors.supplier_number = "Phone number must contain 11 numeric digits.";
                hasErrors = true;
            }

            if (hasErrors) {
                setErrors(newErrors); // Update the errors state
                setLoading(false);
                return; // Stop processing if there are errors
            }
            setErrors({});

            await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

            onCreate(newSupplier);

            // Reset the form
            setNewSupplier({
                supplier_name: "",
                supplier_contact_person: "",
                supplier_address: "",
                supplier_email: "",
                supplier_number: "", // Reset supplier_number
            });
            onClose();
            alert("Supplier created successfully!");
            window.location.reload();
        } catch (error: any) {
            console.error("Error creating supplier:", error);
            alert(`Error: ${error.message || "Failed to create supplier"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Supplier</DialogTitle> {/* Changed title */}
                    <DialogDescription>Enter new supplier details</DialogDescription> {/* Changed description */}
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="supplier_name" className="text-right"> {/* Changed label */}
                            Name
                        </Label>
                        <Input
                            id="supplier_name"
                            value={newSupplier.supplier_name}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                        {errors.supplier_name && (
                            <p className="text-red-500 text-sm col-span-4 col-start-2">
                                {errors.supplier_name}
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="supplier_contact_person" className="text-left"> {/* Changed label */}
                            Contact Person
                        </Label>
                        <Input
                            id="supplier_contact_person"
                            value={newSupplier.supplier_contact_person}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                        {errors.supplier_contact_person && (
                            <p className="text-red-500 text-sm col-span-4 col-start-2">
                                {errors.supplier_contact_person}
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="supplier_address" className="text-right"> {/* Changed label */}
                            Address
                        </Label>
                        <Input
                            id="supplier_address"
                            value={newSupplier.supplier_address}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                        {errors.supplier_address && (
                            <p className="text-red-500 text-sm col-span-4 col-start-2">
                                {errors.supplier_address}
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="supplier_email" className="text-right"> {/* Changed label */}
                            Email
                        </Label>
                        <Input
                            id="supplier_email"
                            value={newSupplier.supplier_email}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                        {errors.supplier_email && (
                            <p className="text-red-500 text-sm col-span-4 col-start-2">
                                {errors.supplier_email}
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="supplier_number" className="text-left">
                            Supplier Number
                        </Label>
                        <Input
                            id="supplier_number"
                            value={newSupplier.supplier_number || ""}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                         {errors.supplier_number && (
                            <p className="text-red-500 text-sm col-span-4 col-start-2">
                                {errors.supplier_number}
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
                        onClick={handleCreateSupplier}
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

export default CreateSupplierComponent;

