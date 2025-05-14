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
        console.log("PATCH /api/item/[id] called to update quantity");
        const id = params.id;
        console.log("id:", id);
        const { quantity } = await request.json() as UpdateQuantityRequest;
        console.log("Request body:", { quantity });

        if (!id) {
            const errorResponse = { error: 'Item ID is required' };
            console.error("Error:", errorResponse);
            return NextResponse.json(errorResponse, { status: 400 });
        }

        if (typeof quantity !== 'number') {
            const errorResponse = { error: 'Quantity must be a number' };
            console.error("Error:", errorResponse);
            return NextResponse.json(errorResponse, { status: 400 });
        }

        const result = await pool.query(
            `UPDATE item SET 
                quantity = $1, 
                updated_at = NOW() 
             WHERE item_id = $2
             RETURNING *`,
            [quantity, id]
        );
        console.log("result.rowCount:", result.rowCount);

        if (result.rowCount === 0) {
            const errorResponse = { error: 'Item not found' };
            console.error("Error:", errorResponse);
            return NextResponse.json(errorResponse, { status: 404 });
        }

        const updatedItem = result.rows[0];
        console.log("updatedItem:", updatedItem);
        return NextResponse.json({ message: 'Item quantity updated successfully', data: updatedItem }, { status: 200 });
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error('Error updating item quantity:', errorMessage);
        return NextResponse.json({ error: 'Failed to update item quantity', details: errorMessage }, { status: 500 });
    }
}