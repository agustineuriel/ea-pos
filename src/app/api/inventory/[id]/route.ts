import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route'; // Adjust path as needed

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface UpdateItemRequest {
    unit: string;
    description: string;
    quantity: number;
    reorder_threshold: number;
    category_name: number;
    price: number;
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

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    const loggedInUser = session?.user?.name || 'System';

    try {
        console.log("PATCH /api/item/[id] called");
        const id = await params.id;
        console.log("id:", id);
        const {
            unit,
            description,
            quantity,
            reorder_threshold,
            category_name,
            price,
            supplier_name,
        } = await request.json() as UpdateItemRequest;
        console.log("Request body:", { unit, description, quantity, reorder_threshold, category_name, price, supplier_name });

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
                    category_name = $5,
                    price = $6,
                    supplier_name = $7,
                    updated_at = NOW() 
                WHERE item_id = $8
                RETURNING *`,
            [unit, description, quantity, reorder_threshold, category_name, price, supplier_name, id]
        );
        console.log("result.rowCount:", result.rowCount);

        if (result.rowCount === 0) {
            const errorResponse = { error: 'Item not found' };
            console.error("Error:", errorResponse);
            return NextResponse.json(errorResponse, { status: 404 });
        }

        const updatedItem = result.rows[0];
        console.log("updatedItem:", updatedItem);

        await createSystemLog(
            `Item updated: ${updatedItem.description} (ID: ${updatedItem.item_id})`,
            loggedInUser
        );

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
    const session = await getServerSession(authOptions);
    const loggedInUser = session?.user?.name || 'System';

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

        await createSystemLog(
            `Item deleted: ${deletedItem.description} (ID: ${deletedItem.item_id})`,
            loggedInUser
        );

        return NextResponse.json({ message: 'Item deleted successfully', data: deletedItem }, { status: 200 });
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error('Error deleting item:', errorMessage);
        return NextResponse.json({ error: 'Failed to delete item', details: errorMessage }, { status: 500 });
    }
}