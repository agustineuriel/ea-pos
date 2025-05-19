import { Pool } from "pg";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; 

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface UpdateQuantityRequest {
  quantity: number;
}

async function createSystemLog(logDescription: string, createdBy: string) {
  try {
    await pool.query(
      "INSERT INTO system_log (log_description, log_created_by, log_datetime) VALUES ($1, $2, NOW())",
      [logDescription, createdBy]
    );
    console.log("System log created:", logDescription, "by", createdBy);
  } catch (error) {
    console.error("Error creating system log:", error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user?.name || "System";

  try {
    const { id } = await params;
    const { quantity } = (await request.json()) as UpdateQuantityRequest;

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required for updating quantity" },
        { status: 400 }
      );
    }

    // Fetch the item before updating to include description and old quantity in the log
    const itemBeforeUpdateResult = await pool.query(
      "SELECT description, quantity, reorder_threshold FROM item WHERE item_id = $1",
      [id]
    );

    if (itemBeforeUpdateResult.rowCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const itemBeforeUpdate = itemBeforeUpdateResult.rows[0];

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
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const updatedItem = result.rows[0];

    await createSystemLog(
      `Item quantity and reorder threshold updated: ${itemBeforeUpdate.description} (ID: ${updatedItem.item_id}), quantity changed from ${itemBeforeUpdate.quantity} to ${updatedItem.quantity}, reorder threshold changed from ${itemBeforeUpdate.reorder_threshold} to ${updatedItem.reorder_threshold}`,
      loggedInUser
    );

    return NextResponse.json(
      {
        message: "Item quantity and reorder threshold updated",
        data: updatedItem,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error updating item quantity:", errorMessage);
    return NextResponse.json(
      { error: "Failed to update item quantity", details: errorMessage },
      { status: 500 }
    );
  }
}
