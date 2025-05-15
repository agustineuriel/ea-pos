import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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
    // You might need to add other properties based on your actual table structure
}

export const GET = async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    const { id } = params;

    if (!id || id === 'null') {
        return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    try {
        // Fetch order details
        const orderResult = await pool.query<Order>('SELECT * FROM "order" WHERE order_id = $1', [id]);  //changed table name

        if (orderResult.rows.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order: Order = orderResult.rows[0];

        // Fetch order items
        const orderItemsResult = await pool.query<OrderItem>(
            'SELECT * FROM order_item WHERE order_id = $1', 
            [id]
        );
        const orderItems: OrderItem[] = orderItemsResult.rows;

        // Combine the results into a single response
        return NextResponse.json({ data: { order, orderItems } }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order: ' + error.message },
            { status: 500 }
        );
    }
};
