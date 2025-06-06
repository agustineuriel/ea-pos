import { Pool } from "pg";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; // Adjust path as needed

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface UpdateSupplierRequest {
  supplier_name: string;
  supplier_address: string;
  supplier_email: string;
  supplier_number: string;
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user?.name || "System";

  if (!id || id === "null") {
    return NextResponse.json(
      { error: "Supplier ID is required" },
      { status: 400 }
    );
  }

  try {
    const result = await pool.query(
      "SELECT supplier_name FROM supplier WHERE supplier_id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    const { supplier_name } = result.rows[0];

    await createSystemLog(
      `Supplier retrieved: ${supplier_name} (ID: ${id})`,
      loggedInUser
    );

    return NextResponse.json({ supplier_name }, { status: 200 });
  } catch (error) {
    console.error("Error fetching supplier name:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier name" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user?.name || "System";

  try {
    const id = params.id;
    const { supplier_name, supplier_address, supplier_email, supplier_number } =
      (await request.json()) as UpdateSupplierRequest;

    if (!id) {
      return NextResponse.json(
        { error: "Supplier ID is required" },
        { status: 400 }
      );
    }

    // Fetch supplier before update for logging
    const supplierBeforeUpdateResult = await pool.query(
      "SELECT * FROM supplier WHERE supplier_id = $1",
      [id]
    );
    if (supplierBeforeUpdateResult.rowCount === 0) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }
    const supplierBeforeUpdate = supplierBeforeUpdateResult.rows[0];

    const result = await pool.query(
      `UPDATE supplier SET 
  supplier_name = $1, 
  supplier_address = $2, 
  supplier_email = $3, 
  supplier_number = $4,
  updated_at = NOW()
  WHERE supplier_id = $5
  RETURNING *`,
      [supplier_name, supplier_address, supplier_email, supplier_number, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    const updatedSupplier = result.rows[0];

    // Create system log for update
    const changedFields = Object.keys(supplierBeforeUpdate).filter(
      (key) => updatedSupplier[key] !== supplierBeforeUpdate[key]
    );
    if (changedFields.length > 0) {
      await createSystemLog(
        `Supplier updated: ${updatedSupplier.supplier_name} (ID: ${
          updatedSupplier.supplier_id
        }), fields changed: ${changedFields.join(", ")}`,
        loggedInUser
      );
    }

    return NextResponse.json(
      { message: "Supplier updated successfully", data: updatedSupplier },
      { status: 200 }
    );
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error updating supplier:", errorMessage);
    return NextResponse.json(
      { error: "Failed to update supplier", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user?.name || "System";

  try {
    console.log("DELETE /api/supplier/[id] called");
    const id = params.id;
    console.log("id:", id);

    if (!id) {
      const errorResponse = { error: "Supplier ID is required" };
      console.error("Error:", errorResponse);
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Fetch supplier before deleting for logging
    const supplierBeforeDeleteResult = await pool.query(
      "SELECT supplier_name FROM supplier WHERE supplier_id = $1",
      [id]
    );
    if (supplierBeforeDeleteResult.rowCount === 0) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }
    const supplierToDelete = supplierBeforeDeleteResult.rows[0];

    const result = await pool.query(
      `DELETE FROM supplier WHERE supplier_id = $1 RETURNING *`,
      [id]
    );

    console.log("result.rowCount:", result.rowCount);

    if (result.rowCount === 0) {
      const errorResponse = { error: "Supplier not found" };
      console.error("Error:", errorResponse);
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const deletedSupplier = result.rows[0];
    console.log("deletedSupplier:", deletedSupplier);

    await createSystemLog(
      `Supplier deleted: ${supplierToDelete.supplier_name} (ID: ${id})`,
      loggedInUser
    );

    return NextResponse.json(
      { message: "Supplier deleted successfully", data: deletedSupplier },
      { status: 200 }
    );
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error deleting supplier:", errorMessage);
    return NextResponse.json(
      { error: "Failed to delete supplier", details: errorMessage },
      { status: 500 }
    );
  }
}
