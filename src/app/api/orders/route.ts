import { Pool } from 'pg';
        import { NextRequest, NextResponse } from 'next/server';
        import { getServerSession } from 'next-auth';
        import { authOptions } from '../auth/[...nextauth]/route'; 

        const pool = new Pool({ connectionString: process.env.DATABASE_URL });

        interface OrderRequest {
            customer_id: number;
            customer_name: string;
            admin_name: string;
            order_date: Date;
            order_status: string;
            order_total_price: number;
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

        // Endpoint to create a new order
        export async function POST(request: Request) {
            const session = await getServerSession(authOptions);
            const loggedInUser = session?.user?.name || 'System';

            try {
                let { customer_id, customer_name, admin_name, order_date, order_status, order_total_price } = await request.json() as OrderRequest;

                // Convert order_date string to Date object if needed
                if (typeof order_date === 'string') {
                    order_date = new Date(order_date);
                }

                // Input validation: Check for required fields
                if (customer_id === undefined || !customer_name || !admin_name || !order_date || !order_status || order_total_price === undefined) {
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
                    'INSERT INTO "order" (customer_id, admin_name, order_date, order_status, order_total_price, created_at, updated_at, customer_name) VALUES ($1, $2, $3, $4, $5, $6, $6, $7) RETURNING *', // Added created_at and updated_at
                    [customer_id, admin_name, order_date, order_status, order_total_price, now, customer_name]
                );

                const newOrder = result.rows[0];

                await createSystemLog(
                    `Order created: Order ID ${newOrder.order_id}, Customer ${newOrder.customer_name}, Total Price ${newOrder.order_total_price}`,
                    loggedInUser
                );

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

        // Endpoint to update an existing order
        export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
            const session = await getServerSession(authOptions);
            const loggedInUser = session?.user?.name || 'System';
            const orderId = params.id;

            try {
                const { customer_id, customer_name, admin_name, order_date, order_status, order_total_price } = await request.json() as OrderRequest;

                if (!orderId) {
                    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
                }

                const result = await pool.query(
                    `UPDATE "order" SET 
                        customer_id = $1, 
                        customer_name = $2,
                        admin_name = $3,
                        order_date = $4,
                        order_status = $5,
                        order_total_price = $6,
                        updated_at = NOW()
                    WHERE order_id = $7
                    RETURNING *`,
                    [customer_id, customer_name, admin_name, order_date, order_status, order_total_price, orderId]
                );

                if (result.rowCount === 0) {
                    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
                }

                const updatedOrder = result.rows[0];

                await createSystemLog(
                    `Order updated: Order ID ${updatedOrder.order_id}, Status ${updatedOrder.order_status}`,
                    loggedInUser
                );

                return NextResponse.json({ message: 'Order updated successfully', data: updatedOrder }, { status: 200 });
            } catch (error: any) {
                console.error('Error updating order:', error);
                return NextResponse.json({ error: 'Failed to update order', details: error.message }, { status: 500 });
            }
        }

        // Endpoint to delete an order
        export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
            const session = await getServerSession(authOptions);
            const loggedInUser = session?.user?.name || 'System';
            const orderId = params.id;

            try {
                if (!orderId) {
                    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
                }

                const result = await pool.query(
                    'DELETE FROM "order" WHERE order_id = $1 RETURNING *',
                    [orderId]
                );

                if (result.rowCount === 0) {
                    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
                }

                const deletedOrder = result.rows[0];

                await createSystemLog(
                    `Order deleted: Order ID ${deletedOrder.order_id}, Customer ${deletedOrder.customer_name}`,
                    loggedInUser
                );

                return NextResponse.json({ message: 'Order deleted successfully' }, { status: 200 });
            } catch (error: any) {
                console.error('Error deleting order:', error);
                return NextResponse.json({ error: 'Failed to delete order', details: error.message }, { status: 500 });
            }
        }