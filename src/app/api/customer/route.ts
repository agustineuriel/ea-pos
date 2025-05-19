import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; 

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface CustomerRequest {
    customer_name: string;
    customer_address: string;
    customer_email: string;
    customer_number?: string;
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

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    const loggedInUser = session?.user?.name || 'System';

    try {
        const { customer_name, customer_address, customer_email, customer_number } = await request.json() as CustomerRequest;

        if (!customer_name || !customer_address || !customer_email) {
            return new Response(JSON.stringify({ error: 'Name, address, and email are required' }), { status: 400 });
        }

        // Consider adding validation for email format, phone number format, string lengths, allowed characters, etc.

        const result = await pool.query(
            'INSERT INTO customer (customer_name, customer_address, customer_email, customer_number) VALUES ($1, $2, $3, $4) RETURNING *',
            [customer_name, customer_address, customer_email, customer_number]
        );

        const newCustomer = result.rows[0];

        await createSystemLog(`Customer created: ${newCustomer.customer_name} (ID: ${newCustomer.customer_id})`, loggedInUser);

        return new Response(JSON.stringify({ message: 'Customer created', data: newCustomer }), { status: 201 });
    } catch (error: any) {
        const errorMessage = error.message || "An unknown error occurred";
        console.error('Error creating customer:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to create customer', details: errorMessage }), { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const result = await pool.query(`SELECT * FROM customer ORDER BY updated_at DESC`);
        const customers = result.rows;
        return new Response(JSON.stringify({ data: customers }), { status: 200 });
    } catch (error: any) {
        const errorMessage = error.message || "An unknown error occurred";
        console.error('Error getting customers:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to get customers', details: errorMessage }), { status: 500 });
    }
}

export async function OPTIONS() {}