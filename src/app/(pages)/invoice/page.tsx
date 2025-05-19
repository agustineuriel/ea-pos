"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/loading-indicator";

const GenerateInvoicePage = () => {
  const [orderId, setOrderId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInvoice = () => {
    if (!orderId) {
      setError("Please enter an Order ID.");
      return;
    }

    const orderIdNum = Number(orderId);
    if (isNaN(orderIdNum) || orderIdNum <= 0) {
      setError("Invalid Order ID. Please enter a positive number.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = `/invoice/${orderId}`;
    }, 500); 
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-4 md:p-6 lg:p-8",
        "min-h-screen bg-background"
      )}
    >
      <h1 className="text-3xl font-bold text-foreground mb-8">
        Generate Invoice
      </h1>
      <div className="w-full max-w-md space-y-4">
        <Input
          type="text"
          placeholder="Enter Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className={cn(error && "border-red-500")}
          disabled={isLoading}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button
          onClick={handleGenerateInvoice}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner /> : "Generate Invoice"}
        </Button>
        <p className="text-muted-foreground text-sm mt-4">
        </p>
      </div>
    </div>
  );
};

export default GenerateInvoicePage;
