import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface UpdateQuantityRequest {
    quantity: number;
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;

        const { quantity } = await request.json() as UpdateQuantityRequest;

        if (!id) {
            return NextResponse.json({ error: 'Item ID is required for updating quantity' }, { status: 400 });
        }

        const result = await pool.query(
            `UPDATE item 
             SET quantity = $1, 
                 reorder_threshold = reorder_threshold + 1, 
                 updated_at = NOW() 
             WHERE item_id = $2 
             RETURNING *`,
            [quantity, id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const updatedItem = result.rows[0];
        return NextResponse.json({ message: 'Item quantity and reorder threshold updated', data: updatedItem }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error('Error updating item quantity:', errorMessage);
        return NextResponse.json({ error: 'Failed to update item quantity', details: errorMessage }, { status: 500 });
    }
}
