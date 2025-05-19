import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route'; // Adjust path as needed

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

export const GET = async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    const { id } = await params;

    if (!id || id === 'null') {
        return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    try {
        // Fetch order details
        const orderResult = await pool.query<Order>('SELECT * FROM "order" WHERE order_id = $1', [id]); //changed table name

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

export const DELETE = async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const loggedInUser = session?.user?.name || 'System';

    if (!id || id === 'null') {
        return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const client = await pool.connect(); // Get a client from the pool

    try {
        await client.query('BEGIN'); // Start a transaction

        // Fetch order details before deletion for logging
        const orderResult = await client.query<Order>('SELECT * FROM "order" WHERE order_id = $1', [id]);
        const orderToDelete = orderResult.rows[0];

        // Delete from order_item first (to avoid foreign key constraint issues)
        const deleteOrderItemsResult = await client.query(
            'DELETE FROM order_item WHERE order_id = $1',
            [id]
        );

        // Delete the order itself
        const deleteOrderResult = await client.query('DELETE FROM "order" WHERE order_id = $1', [id]);

        if (deleteOrderResult.rowCount === 0) {
            await client.query('ROLLBACK'); // Rollback if order not found
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        await client.query('COMMIT'); // Commit the transaction

        if (orderToDelete) {
            await createSystemLog(
                `Order deleted: Order ID ${orderToDelete.order_id}, Customer ${orderToDelete.customer_id}, Total Price ${orderToDelete.order_total_price}`,
                loggedInUser
            );
        }

        return NextResponse.json({ message: 'Order and related items deleted successfully' }, { status: 200 });
    } catch (error: any) {
        await client.query('ROLLBACK'); // Rollback on any error
        console.error('Error deleting order and related items:', error);
        return NextResponse.json(
            { error: 'Failed to delete order and related items: ' + error.message },
            { status: 500 }
        );
    } finally {
        client.release(); // Return the client to the pool
    }
};

// Endpoint to update order status
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const orderId = await parseInt(params.id, 10);
    const session = await getServerSession(authOptions);
    const loggedInUser = session?.user?.name || 'System';

    if (isNaN(orderId)) {
        return new Response(JSON.stringify({ error: 'Invalid order ID' }), { status: 400 });
    }

    try {
        const { order_status, order_total_price } = await request.json();

        if (!order_status) {
            return new Response(JSON.stringify({ error: 'Order status is required' }), { status: 400 });
        }

        if (typeof order_status !== 'string') {
            return new Response(JSON.stringify({ error: 'Invalid data type for order status' }), { status: 400 });
        }

        if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(order_status.toLowerCase())) {
            return new Response(JSON.stringify({ error: 'Invalid order status' }), { status: 400 });
        }

        const now = new Date();
        const client = await pool.connect(); // Get a client from the pool
        try {
            await client.query('BEGIN'); // Start a transaction

            // Fetch order details before update for logging
            const orderResultBefore = await client.query<Order>('SELECT * FROM "order" WHERE order_id = $1', [orderId]);
            const orderBeforeUpdate = orderResultBefore.rows[0];

            // Update the order status
            const orderUpdateResult = await client.query(
                'UPDATE "order" SET order_status = $1 WHERE order_id = $2 RETURNING *',
                [order_status, orderId]
            );

            if (orderUpdateResult.rowCount === 0) {
                await client.query('ROLLBACK');
                return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
            }

            if (order_status.toLowerCase() === 'cancelled') {
                //update order_total_price
                await client.query(
                    'UPDATE "order" SET order_total_price = 0 WHERE order_id = $1',
                    [orderId]
                );
            }

            const updatedOrder = orderUpdateResult.rows[0];

            await client.query('COMMIT'); // Commit the transaction

            if (orderBeforeUpdate) {
                await createSystemLog(
                    `Order updated: Order ID ${updatedOrder.order_id}, Status changed from ${orderBeforeUpdate.order_status} to ${updatedOrder.order_status}, Total Price ${updatedOrder.order_total_price}`,
                    loggedInUser
                );
            }

            return new Response(JSON.stringify({ message: 'Order status updated successfully', data: updatedOrder }), { status: 200 });
        } catch (error: any) {
            await client.query('ROLLBACK'); // Rollback the transaction on error
            console.error('Error updating order status:', error);
            return new Response(JSON.stringify({ error: 'Failed to update order status', details: error.message }), { status: 500 });
        } finally {
            client.release(); // Return the client to the pool
        }
    } catch (error: any) {
        console.error('Error updating order status:', error);
        return new Response(JSON.stringify({ error: 'Failed to update order status', details: error.message }), { status: 500 });
    }
}