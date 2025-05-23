"use client";

import React, { useState, useEffect } from 'react';
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

// Use the Supplier type. Make sure the path is correct.
import type { Supplier } from "@/components/supplier/column";

interface EditSupplierComponentProps {
    supplier: Supplier;
    isEditOpen: boolean;
    onClose: () => void;
}

const EditSupplierComponent: React.FC<EditSupplierComponentProps> = ({
    supplier,
    isEditOpen,
    onClose,
}) => {
    const [editedSupplier, setEditedSupplier] = useState<Supplier>({ ...supplier });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (isEditOpen) {
            setEditedSupplier({ ...supplier });
            setErrors({}); // Clear errors on open
        }
    }, [isEditOpen, supplier]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setEditedSupplier(prev => ({
            ...prev,
            [id]: value,
        }));
        setErrors(prevErrors => ({ ...prevErrors, [id]: "" })); // Clear error on input change
    };

    const handleEditSupplier = async () => {
        setLoading(true);
        const newErrors: { [key: string]: string } = {};
        let hasErrors = false;

        // Validation
        if (!editedSupplier.supplier_name) {
            newErrors.supplier_name = "Please enter supplier name.";
            hasErrors = true;
        }
        if (!editedSupplier.supplier_address) {
            newErrors.supplier_address = "Please enter supplier address.";
            hasErrors = true;
        }
        if (!editedSupplier.supplier_email) {
            newErrors.supplier_email = "Please enter supplier email.";
            hasErrors = true;
        }

        // Email validation (basic)
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (editedSupplier.supplier_email && !emailRegex.test(editedSupplier.supplier_email)) {
            newErrors.supplier_email = "Please enter a valid email address.";
            hasErrors = true;
        }

        if (editedSupplier.supplier_number && !/^\d{11}$/.test(editedSupplier.supplier_number)) {
            newErrors.supplier_number = "Phone number must contain 11 numeric digits.";
            hasErrors = true;
        }

        if (hasErrors) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }


        try {
            const response = await fetch(`/api/supplier/${supplier.supplier_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editedSupplier),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to update supplier: ${response.status}`);
            }

            const updatedSupplierData = await response.json();
            onClose();
            // alert(updatedSupplierData.message || "Supplier updated successfully!");
            window.location.reload();
        } catch (error: any) {
            console.error("Error updating supplier:", error);
            // alert(`Error: ${error.message || "Failed to update supplier"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isEditOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Supplier</DialogTitle>
                    <DialogDescription>
                        Edit supplier details for Supplier ID: {supplier.supplier_id}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="supplier_id" className="text-right">
                            Supplier ID
                        </Label>
                        <Input
                            id="supplier_id"
                            value={editedSupplier.supplier_id.toString()}
                            className="col-span-3"
                            disabled
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="supplier_name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="supplier_name"
                            value={editedSupplier.supplier_name || ""}
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
                        <Label htmlFor="supplier_contact_person" className="text-left">
                            Contact Person
                        </Label>
                        <Input
                            id="supplier_contact_person"
                            value={editedSupplier.supplier_contact_person || ""}
                            onChange={handleInputChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="supplier_address" className="text-right">
                            Address
                        </Label>
                        <Input
                            id="supplier_address"
                            value={editedSupplier.supplier_address || ""}
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
                        <Label htmlFor="supplier_email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="supplier_email"
                            value={editedSupplier.supplier_email || ""}
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
                           Phone Number
                        </Label>
                        <Input
                            id="supplier_number"
                            value={editedSupplier.supplier_number || ""}
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
                        onClick={handleEditSupplier}
                        className={cn(
                            "bg-blue-500 hover:bg-blue-600 text-white",
                            loading && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditSupplierComponent;
