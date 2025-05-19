import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; // Adjust path as needed

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface OrderItemRequest {
    order_id: number;
    item_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    description?: string;
    unit?: string;
}

async function createSystemLog(logDescription: string, createdBy: string) {
    try {
        await pool.query(
            'INSERT INTO system_log (log_description, log_created_by, log_datetime) VALUES ($1, $2, NOW())',
            [logDescription, createdBy]
        );
        console.log('System log created:', logDescription, 'by', createdBy);
    } catch (error) {
        console.error('Error creating system log:', error);
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    const loggedInUser = session?.user?.name || 'System';

    try {
        const { order_id, item_id, quantity, unit_price, subtotal, description, unit } = await request.json() as OrderItemRequest;

        if (order_id === undefined || item_id === undefined || quantity === undefined || unit_price === undefined || subtotal === undefined) {
            return NextResponse.json({ error: 'All fields except description and unit are required' }, { status: 400 });
        }

        if (typeof order_id !== 'number' || typeof item_id !== 'number' || typeof quantity !== 'number' || typeof unit_price !== 'number' || typeof subtotal !== 'number') {
            return NextResponse.json({ error: 'Invalid data types' }, { status: 400 });
        }

        if (description !== undefined && typeof description !== 'string') {
            return NextResponse.json({ error: 'Description must be a string' }, { status: 400 });
        }

        if (unit !== undefined && typeof unit !== 'string') {
            return NextResponse.json({ error: 'Unit must be a string' }, { status: 400 });
        }

        if (quantity <= 0 || unit_price < 0 || subtotal < 0) {
            return NextResponse.json({ error: 'Invalid values: quantity must be positive, price and subtotal must be non-negative' }, { status: 400 });
        }

        const now = new Date();

        const result = await pool.query(
            `INSERT INTO order_item (order_id, item_id, quantity, unit_price, subtotal, created_at, updated_at, description, unit) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
             RETURNING *`,
            [order_id, item_id, quantity, unit_price, subtotal, now, now, description, unit]
        );

        const newOrderItem = result.rows[0];

        await createSystemLog(
            `Order item created: Order ID ${newOrderItem.order_id}, Item ID ${newOrderItem.item_id}`,
            loggedInUser
        );

        return NextResponse.json({ message: 'Order item created successfully', data: newOrderItem }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating order item:', error);
        return NextResponse.json({ error: 'Failed to create order item', details: error.message }, { status: 500 });
    }
}