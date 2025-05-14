import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface UpdateItemRequest {
    unit: string;
    description: string;
    quantity: number;
    reorder_threshold: number;
    category_id: number;
    price: number; // Added price field
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log("PATCH /api/inventory/[id] called");
        const id = params.id;
        console.log("id:", id);
        const {
            unit,
            description,
            quantity,
            reorder_threshold,
            category_id,
            price // Destructure price from request body
        } = await request.json() as UpdateItemRequest;
        console.log("Request body:", { unit, description, quantity, reorder_threshold, category_id, price });

        if (!id) {
            const errorResponse = { error: 'Item ID is required' };
            console.error("Error:", errorResponse);
            return NextResponse.json(errorResponse, { status: 400 });
        }

        const result = await pool.query(
            `UPDATE item SET 
                unit = $1, 
                description = $2, 
                quantity = $3, 
                reorder_threshold = $4, 
                category_id = $5,
                price = $6,  -- Added price to the query
                updated_at = NOW() 
             WHERE item_id = $7
             RETURNING *`,
            [unit, description, quantity, reorder_threshold, category_id, price, id] // Added price to the parameter list
        );
        console.log("result.rowCount:", result.rowCount);

        if (result.rowCount === 0) {
            const errorResponse = { error: 'Item not found' };
            console.error("Error:", errorResponse);
            return NextResponse.json(errorResponse, { status: 404 });
        }

        const updatedItem = result.rows[0];
        console.log("updatedItem:", updatedItem);
        return NextResponse.json({ message: 'Item updated successfully', data: updatedItem }, { status: 200 });
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error('Error updating item:', errorMessage);
        return NextResponse.json({ error: 'Failed to update item', details: errorMessage }, { status: 500 });
    }
}
