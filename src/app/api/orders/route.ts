import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface OrderRequest {
    customer_id: number;
    admin_name: string;
    order_date: Date;
    order_status: string;
    order_total_price: number;
}


// Endpoint to create a new order
export async function POST(request: Request) {
    try {
        let { customer_id, admin_name, order_date, order_status, order_total_price } = await request.json() as OrderRequest;

        // Convert order_date string to Date object if needed
        if (typeof order_date === 'string') {
            order_date = new Date(order_date);
        }

        // Input validation: Check for required fields
        if (customer_id === undefined || !admin_name || !order_date || !order_status || order_total_price === undefined) {
            return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
        }

        // Input validation: Check data types and constraints
        if (typeof customer_id !== 'number' || typeof admin_name !== 'string' || !(order_date instanceof Date) || isNaN(order_date.getTime()) || typeof order_status !== 'string' || typeof order_total_price !== 'number') {
            return new Response(JSON.stringify({ error: 'Invalid data types for one or more fields' }), { status: 400 });
        }

        if (order_total_price < 0) {
            return new Response(JSON.stringify({ error: 'Order total price must be a non-negative number' }), { status: 400 });
        }
        if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(order_status.toLowerCase())) {
            return new Response(JSON.stringify({ error: 'Invalid order status' }), { status: 400 });
        }

        const now = new Date(); // Get current timestamp
        const result = await pool.query(
            'INSERT INTO "order" (customer_id, admin_name, order_date, order_status, order_total_price, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING *', // Added created_at and updated_at
            [customer_id, admin_name, order_date, order_status, order_total_price, now]
        );

        const newOrder = result.rows[0];
        return new Response(JSON.stringify({ message: 'Order created successfully', data: newOrder }), { status: 201 });

    } catch (error: any) {
        console.error('Error creating order:', error);
        return new Response(JSON.stringify({ error: 'Failed to create order', details: error.message }), { status: 500 });
    }
}

// Endpoint to get all orders
export async function GET() {
    try {
        const result = await pool.query('SELECT * FROM "order" ORDER BY order_date DESC');
        const orders = result.rows;
        return new Response(JSON.stringify({ data: orders }), { status: 200 });
    } catch (error: any) {
        console.error('Error fetching orders:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch orders', details: error.message }), { status: 500 });
    }
}
