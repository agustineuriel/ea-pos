import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface ItemRequest {
    unit: string;
    description: string;
    quantity: number;
    reorder_threshold: number;
    category_name: number;
    supplier_name: number; 
}

interface SystemLogRequest {
    log_description: string;
    log_created_by: string;
}

export async function POST(request: Request) {
    try {
        const { unit, description, quantity, reorder_threshold, category_name, price, supplier_name } = await request.json() as ItemRequest & { price: number };

        if (!unit || !description || quantity === undefined || reorder_threshold === undefined || !category_name || price === undefined || supplier_name === undefined) { // Added supplier_name to the check
            return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
        }

        // Convert input values to numbers
        const parsedQuantity = Number(quantity);
        const parsedReorderThreshold = Number(reorder_threshold);
        const parsedPrice = Number(price);

        // Validate input types
        if (isNaN(parsedQuantity) || isNaN(parsedReorderThreshold) || isNaN(parsedPrice)) { // Added isNaN check for supplier_name
            return new Response(JSON.stringify({ error: 'quantity, reorder_threshold, category_name, price, and supplier_name must be valid numbers' }), { status: 400 });
        }

        // Consider adding validation for string lengths, allowed characters, etc.

        // Removed id from the query. Assuming item_id is auto-generated (SERIAL)
        const result = await pool.query(
            'INSERT INTO item (unit, description, quantity, reorder_threshold, category_name, price, supplier_name) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', // Added supplier_name to query
            [unit, description, quantity, reorder_threshold, category_name, price, supplier_name] // Added supplier_name to values
        );

        const newItem = result.rows[0];

        return new Response(JSON.stringify({ message: 'Item created', data: newItem }), { status: 201 });
    } catch (error: any) { // Explicitly type error as any
        const errorMessage = error.message || "An unknown error occurred";  // more robust
        console.error('Error creating item:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to create item', details: errorMessage }), { status: 500 });
    }
}

//  The other functions remain the same
export async function GET(request: Request) {
    try {
        const result = await pool.query(`SELECT * FROM item ORDER BY updated_at DESC`);
        const items = result.rows;
        return new Response(JSON.stringify({ data: items }), { status: 200 });
    } catch (error: any) {
        const errorMessage = error.message || "An unknown error occurred";
        console.error('Error getting items:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to get items', details: errorMessage }), { status: 500 });
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
