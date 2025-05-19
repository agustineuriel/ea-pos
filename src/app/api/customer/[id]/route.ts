import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface Customer {
    customer_name: string;
    customer_address: string;
    customer_email: string;
    customer_number?: string;
}

export const GET = async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        const customerId = await params.id;

        if (!customerId) {
            return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
        }

        const query = `
            SELECT * FROM customer 
            WHERE customer_id = $1
        `;

        const result = await pool.query<Customer>(query, [customerId]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        const customer: Customer = result.rows[0];
        return NextResponse.json({ data: customer }, { status: 200 });
    } catch (error: any) {
        // Log the full error for debugging
        console.error('Error fetching customer:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customer', details: error.message },
            { status: 500 }
        );
    }
};



export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log("PATCH /api/customers/[id] called"); // Changed log
        const id = params.id;
        console.log("id:", id);
        const { customer_name, customer_address, customer_email, customer_number } = await request.json() as Customer;
        console.log("Request body:", { customer_name, customer_address, customer_email, customer_number });


        if (!id) {
            const errorResponse = { error: 'Customer ID is required' }; // Changed error message
            console.error("Error:", errorResponse);
            return NextResponse.json(errorResponse, { status: 400 });
        }

        const result = await pool.query(
            `UPDATE customer SET 
                customer_name = $1, 
                customer_address = $2, 
                customer_email = $3, 
                customer_number = $4,
                updated_at = NOW() 
            WHERE customer_id = $5
            RETURNING *`,
            [customer_name, customer_address, customer_email, customer_number, id]
        );
        console.log("result.rowCount:", result.rowCount);

        if (result.rowCount === 0) {
            const errorResponse = { error: 'Customer not found' };  // Changed error message
            console.error("Error:", errorResponse);
            return NextResponse.json(errorResponse, { status: 404 });
        }

        const updatedCustomer = result.rows[0];
        console.log("updatedCustomer:", updatedCustomer);
        return NextResponse.json({ message: 'Customer updated successfully', data: updatedCustomer }, { status: 200 }); // Changed message
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error('Error updating customer:', errorMessage);  // Changed log message
        return NextResponse.json({ error: 'Failed to update customer', details: errorMessage }, { status: 500 }); // Changed message
    }
}


export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log("DELETE /api/customer/[id] called");
        const id = params.id;
        console.log("id:", id);

        if (!id) {
            const errorResponse = { error: 'Customer ID is required' };
            console.error("Error:", errorResponse);
            return NextResponse.json(errorResponse, { status: 400 });
        }

        const result = await pool.query(
            `DELETE FROM customer WHERE customer_id = $1 RETURNING *`,
            [id]
        );

        console.log("result.rowCount:", result.rowCount);

        if (result.rowCount === 0) {
            const errorResponse = { error: 'Customer not found' };
            console.error("Error:", errorResponse);
            return NextResponse.json(errorResponse, { status: 404 });
        }

        const deletedCustomer = result.rows[0];
        console.log("deletedCustomer:", deletedCustomer);
        return NextResponse.json({ message: 'Customer deleted successfully', data: deletedCustomer }, { status: 200 });
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error('Error deleting customer:', errorMessage);
        return NextResponse.json({ error: 'Failed to delete customer', details: errorMessage }, { status: 500 });
    }
}
