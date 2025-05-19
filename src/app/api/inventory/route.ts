import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; // Adjust path as needed

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface ItemRequest {
    unit: string;
    description: string;
    quantity: number;
    reorder_threshold: number;
    category_name: number;
    supplier_name: number;
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
        const { unit, description, quantity, reorder_threshold, category_name, price, supplier_name } = await request.json() as ItemRequest & { price: number };

        if (!unit || !description || quantity === undefined || reorder_threshold === undefined || !category_name || price === undefined || supplier_name === undefined) {
            return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
        }

        const parsedQuantity = Number(quantity);
        const parsedReorderThreshold = Number(reorder_threshold);
        const parsedPrice = Number(price);

        if (isNaN(parsedQuantity) || isNaN(parsedReorderThreshold) || isNaN(parsedPrice) || isNaN(Number(category_name)) || isNaN(Number(supplier_name))) {
            return new Response(JSON.stringify({ error: 'quantity, reorder_threshold, category_name, price, and supplier_name must be valid numbers' }), { status: 400 });
        }

        const result = await pool.query(
            'INSERT INTO item (unit, description, quantity, reorder_threshold, category_name, price, supplier_name) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [unit, description, quantity, reorder_threshold, category_name, price, supplier_name]
        );

        const newItem = result.rows[0];

        await createSystemLog(
            `Item created: ${newItem.description} (ID: ${newItem.item_id})`,
            loggedInUser
        );

        return new Response(JSON.stringify({ message: 'Item created', data: newItem }), { status: 201 });
    } catch (error: any) {
        const errorMessage = error.message || "An unknown error occurred";
        console.error('Error creating item:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to create item', details: errorMessage }), { status: 500 });
    }
}

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

export async function OPTIONS() {}