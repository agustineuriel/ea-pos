import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route'; 

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface UpdateQuantityRequest {
    quantity: number;
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
        console.log("PATCH /api/item/[id] called to update quantity");
        const id = await params.id;
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

        // Fetch the item before updating to include description in the log
        const itemBeforeUpdateResult = await pool.query(
            'SELECT description, quantity FROM item WHERE item_id = $1',
            [id]
        );

        if (itemBeforeUpdateResult.rowCount === 0) {
            const errorResponse = { error: 'Item not found' };
            console.error("Error:", errorResponse);
            return NextResponse.json(errorResponse, { status: 404 });
        }

        const itemBeforeUpdate = itemBeforeUpdateResult.rows[0];

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

        await createSystemLog(
            `Item quantity updated: ${itemBeforeUpdate.description} (ID: ${updatedItem.item_id}), from ${itemBeforeUpdate.quantity} to ${updatedItem.quantity}`,
            loggedInUser
        );

        return NextResponse.json({ message: 'Item quantity updated successfully', data: updatedItem }, { status: 200 });
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error('Error updating item quantity:', errorMessage);
        return NextResponse.json({ error: 'Failed to update item quantity', details: errorMessage }, { status: 500 });
    }
}