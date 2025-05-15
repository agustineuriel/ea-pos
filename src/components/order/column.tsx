export type Order = {
    order_id: number; // serial
    customer_id: number; // int
    admin_name: string; // varchar
    order_date: Date;    // Date
    order_status: string; // varchar
    order_total_price: number; // numeric
}