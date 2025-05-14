import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface OrderItemRequest {
    order_id: number;
    item_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

export async function POST(request: Request) {
    try {
        const { order_id, item_id, quantity, unit_price, subtotal } = await request.json() as OrderItemRequest;

        // Input validation: Check for required fields
        if (order_id === undefined || item_id === undefined || quantity === undefined || unit_price === undefined || subtotal === undefined) {
            return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
        }

        // Input validation: Check data types
        if (typeof order_id !== 'number' || typeof item_id !== 'number' || typeof quantity !== 'number' || typeof unit_price !== 'number' || typeof subtotal !== 'number') {
            return new Response(JSON.stringify({ error: 'Invalid data types' }), { status: 400 });
        }

        // Input validation: Check for valid values
        if (quantity <= 0 || unit_price < 0 || subtotal < 0) {
            return new Response(JSON.stringify({ error: 'Invalid values: quantity must be positive, price and subtotal must be non-negative' }), { status: 400 });
        }

        const now = new Date();

        const result = await pool.query(
            'INSERT INTO order_item (order_id, item_id, quantity, unit_price, subtotal, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING *',
            [order_id, item_id, quantity, unit_price, subtotal, now]
        );

        const newOrderItem = result.rows[0];
        return new Response(JSON.stringify({ message: 'Order item created successfully', data: newOrderItem }), { status: 201 });
    } catch (error: any) {
        console.error('Error creating order item:', error);
        return new Response(JSON.stringify({ error: 'Failed to create order item', details: error.message }), { status: 500 });
    }
}
