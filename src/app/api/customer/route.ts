import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface CustomerRequest {
    customer_name: string;
    customer_address: string;
    customer_email: string;
    customer_number?: string;
}

interface SystemLogRequest {
    log_description: string;
    log_created_by: string;
}

export async function POST(request: Request) {
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

export async function PATCH(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const { customer_name, customer_address, customer_email, customer_number } = await request.json() as CustomerRequest;

        if (!id) {
            return new Response(JSON.stringify({ error: 'id is required for update' }), { status: 400 });
        }

        const updates: (string | undefined)[] = []; // Include undefined to handle optional fields correctly
        let queryParts = ['UPDATE customer SET'];
        let paramIndex = 1;

        if (customer_name) {
            queryParts.push(`customer_name = $${paramIndex++}`);
            updates.push(customer_name);
        }
        if (customer_address) {
            queryParts.push(`customer_address = $${paramIndex++}`);
            updates.push(customer_address);
        }
        if (customer_email) {
            queryParts.push(`customer_email = $${paramIndex++}`);
            updates.push(customer_email);
        }
        if (customer_number !== undefined) { // Allow updating customer_number to null
            queryParts.push(`customer_number = $${paramIndex++}`);
            updates.push(customer_number);
        }

        if (updates.length === 0) {
            return new Response(JSON.stringify({ error: 'No fields to update' }), { status: 400 });
        }

        queryParts.push(`WHERE customer_id = $${paramIndex++} RETURNING *`);
        updates.push(id);

        const query = queryParts.join(' ');
        const result = await pool.query(query, updates);

        if (result.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Customer not found' }), { status: 404 });
        }

        const updatedCustomer = result.rows[0];
        return new Response(JSON.stringify({ message: 'Customer updated', data: updatedCustomer }), { status: 200 });
    } catch (error: any) {
        const errorMessage = error.message || "An unknown error occurred";
        console.error('Error updating customer:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to update customer', details: errorMessage }), { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return new Response(JSON.stringify({ error: 'id is required for deletion' }), { status: 400 });
        }

        const result = await pool.query('DELETE FROM customer WHERE customer_id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Customer not found' }), { status: 404 });
        }

        const deletedCustomer = result.rows;
        return new Response(JSON.stringify({ message: 'Customer deleted', data: deletedCustomer }), { status: 200 });
    } catch (error: any) {
        const errorMessage = error.message || "An unknown error occurred";
        console.error('Error deleting customer:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to delete customer', details: errorMessage }), { status: 500 });
    }
}

export async function POSTLOG(request: Request) {
    try {
        const { log_description, log_created_by } = await request.json() as SystemLogRequest;

        if (!log_description || !log_created_by) {
            return new Response(JSON.stringify({ error: 'log_description and log_created_by are required' }), { status: 400 });
        }

        const result = await pool.query(
            'INSERT INTO system_log (log_description, log_created_by) VALUES ($1, $2) RETURNING *',
            [log_description, log_created_by]
        );

        const newLog = result.rows[0];

        return new Response(JSON.stringify({ message: 'Log created', data: newLog }), { status: 201 });
    } catch (error: any) {
        const errorMessage = error.message || "An unknown error occurred";
        console.error('Error creating log:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to create log', details: errorMessage }), { status: 500 });
    }
}

export async function OPTIONS() {}
