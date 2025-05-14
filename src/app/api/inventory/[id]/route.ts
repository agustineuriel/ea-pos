import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface UpdateItemRequest {
    unit: string;
    description: string;
    quantity: number;
    reorder_threshold: number;
    category_id: number;
    price: number;
    supplier_id: number; // Added supplier_id
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log("PATCH /api/item/[id] called");
        const id = params.id;
        console.log("id:", id);
        const {
            unit,
            description,
            quantity,
            reorder_threshold,
            category_id,
            price,
            supplier_id, // Destructured supplier_id
        } = await request.json() as UpdateItemRequest;
        console.log("Request body:", { unit, description, quantity, reorder_threshold, category_id, price, supplier_id });

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
                 price = $6,
                 supplier_id = $7,
                 updated_at = NOW() 
               WHERE item_id = $8
               RETURNING *`,
            [unit, description, quantity, reorder_threshold, category_id, price, supplier_id, id] // Added supplier_id to parameters
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log("DELETE /api/item/[id] called");
        const id = params.id;
        console.log("id:", id);

        if (!id) {
            const errorResponse = { error: 'Item ID is required' };
            console.error("Error:", errorResponse);
            return NextResponse.json(errorResponse, { status: 400 });
        }

        const result = await pool.query(
            `DELETE FROM item WHERE item_id = $1 RETURNING *`,
            [id]
        );

        console.log("result.rowCount:", result.rowCount);

        if (result.rowCount === 0) {
            const errorResponse = { error: 'Item not found' };
            console.error("Error:", errorResponse);
            return NextResponse.json(errorResponse, { status: 404 });
        }

        const deletedItem = result.rows[0];
        console.log("deletedItem:", deletedItem);
        return NextResponse.json({ message: 'Item deleted successfully', data: deletedItem }, { status: 200 });
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error('Error deleting item:', errorMessage);
        return NextResponse.json({ error: 'Failed to delete item', details: errorMessage }, { status: 500 });
    }
}
