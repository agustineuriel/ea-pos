export type OrderItem = {
    order_item_id: number;
    order_id: number;
    item_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    created_at: string;
    updated_at: string;
    description: string; // Add description
    unit: string;       // Add unit
}