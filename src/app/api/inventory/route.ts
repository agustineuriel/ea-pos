import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface ItemRequest {
    unit: string;
    description: string;
    quantity: number;
    reorder_threshold: number;
    category_id: number;
}

interface SystemLogRequest {
    log_description: string;
    log_created_by: string;
}

export async function POST(request: Request) {
    try {
        const { unit, description, quantity, reorder_threshold, category_id, price } = await request.json() as ItemRequest & { price: number };

        if (!unit || !description || quantity === undefined || reorder_threshold === undefined || !category_id || price === undefined) {
            return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
        }

        // Convert input values to numbers
        const parsedQuantity = Number(quantity);
        const parsedReorderThreshold = Number(reorder_threshold);
        const parsedCategoryId = Number(category_id);
        const parsedPrice = Number(price);

        // Validate input types
        if (isNaN(parsedQuantity) || isNaN(parsedReorderThreshold) || isNaN(parsedCategoryId) || isNaN(parsedPrice)) {
            return new Response(JSON.stringify({ error: 'quantity, reorder_threshold, category_id, and price must be valid numbers' }), { status: 400 });
        }

        // Consider adding validation for string lengths, allowed characters, etc.

        // Removed id from the query. Assuming item_id is auto-generated (SERIAL)
        const result = await pool.query(
            'INSERT INTO item (unit, description, quantity, reorder_threshold, category_id, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [unit, description, quantity, reorder_threshold, category_id, price]
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

export async function PATCH(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const { unit, description, quantity, reorder_threshold, category_id } = await request.json() as ItemRequest;

        if (!id) {
            return new Response(JSON.stringify({ error: 'id is required for update' }), { status: 400 });
        }

        const updates: (string | number)[] = [];
        let queryParts = ['UPDATE item SET'];
        let paramIndex = 1;

        if (unit) {
            queryParts.push(`unit = $${paramIndex++}`);
            updates.push(unit);
        }
        if (description) {
            queryParts.push(`description = $${paramIndex++}`);
            updates.push(description);
        }
        if (quantity !== undefined) {
            queryParts.push(`quantity = $${paramIndex++}`);
            updates.push(quantity);
        }
        if (reorder_threshold !== undefined) {
            queryParts.push(`reorder_threshold = $${paramIndex++}`);
            updates.push(reorder_threshold);
        }
        if (category_id !== undefined) {
            queryParts.push(`category_id = $${paramIndex++}`);
            updates.push(category_id);
        }

        if (updates.length === 0) {
            return new Response(JSON.stringify({ error: 'No fields to update' }), { status: 400 });
        }

        queryParts.push(`WHERE item_id = $${paramIndex++} RETURNING *`);
        updates.push(id);

        const query = queryParts.join(' ');
        const result = await pool.query(query, updates);

        if (result.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Item not found' }), { status: 404 });
        }

        const updatedItem = result.rows[0];
        return new Response(JSON.stringify({ message: 'Item updated', data: updatedItem }), { status: 200 });
    } catch (error: any) {
        const errorMessage = error.message || "An unknown error occurred";
        console.error('Error updating item:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to update item', details: errorMessage }), { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return new Response(JSON.stringify({ error: 'id is required for deletion' }), { status: 400 });
        }

        const result = await pool.query('DELETE FROM item WHERE item_id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Item not found' }), { status: 404 });
        }

        const deletedItem = result.rows;
        return new Response(JSON.stringify({ message: 'Item deleted', data: deletedItem }), { status: 200 });
    } catch (error: any) {
        const errorMessage = error.message || "An unknown error occurred";
        console.error('Error deleting item:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to delete item', details: errorMessage }), { status: 500 });
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
