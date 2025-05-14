import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface SupplierRequest {
    supplier_name: string;
    supplier_contact_person?: string;
    supplier_address: string;
    supplier_email: string;
    supplier_number: string;
}

export async function POST(request: Request) {
    try {
        const { supplier_name, supplier_contact_person, supplier_address, supplier_email, supplier_number } = await request.json() as SupplierRequest;

        if (!supplier_name || !supplier_address || !supplier_email || !supplier_number) {
            return new Response(JSON.stringify({ error: 'Name, address, email, and number are required' }), { status: 400 });
        }

        //  Add validation for email format,  string lengths, allowed characters, etc.

        const result = await pool.query(
            'INSERT INTO supplier (supplier_name, supplier_contact_person, supplier_address, supplier_email, supplier_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [supplier_name, supplier_contact_person, supplier_address, supplier_email, supplier_number]
        );

        const newSupplier = result.rows[0];

        return new Response(JSON.stringify({ message: 'Supplier created', data: newSupplier }), { status: 201 });
    } catch (error: any) {
        const errorMessage = error.message || "An unknown error occurred";
        console.error('Error creating supplier:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to create supplier', details: errorMessage }), { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const result = await pool.query(`SELECT * FROM supplier ORDER BY updated_at DESC`);
        const suppliers = result.rows;
        return new Response(JSON.stringify({ data: suppliers }), { status: 200 });
    } catch (error: any) {
        const errorMessage = error.message || "An unknown error occurred";
        console.error('Error getting suppliers:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to get suppliers', details: errorMessage }), { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { id } = await request.json();
        const { supplier_name, supplier_contact_person, supplier_address, supplier_email, supplier_number } = await request.json() as SupplierRequest;


        if (!id) {
            return new Response(JSON.stringify({ error: 'id is required for update' }), { status: 400 });
        }

        const updates: (string | undefined)[] = []; // Include undefined to handle optional fields correctly
        let queryParts = ['UPDATE supplier SET'];
        let paramIndex = 1;

        if (supplier_name) {
            queryParts.push(`supplier_name = $${paramIndex++}`);
            updates.push(supplier_name);
        }
        if (supplier_contact_person) {
            queryParts.push(`supplier_contact_person = $${paramIndex++}`);
            updates.push(supplier_contact_person);
        }
        if (supplier_address) {
            queryParts.push(`supplier_address = $${paramIndex++}`);
            updates.push(supplier_address);
        }
        if (supplier_email) {
            queryParts.push(`supplier_email = $${paramIndex++}`);
            updates.push(supplier_email);
        }
        
        if (supplier_number) {
            queryParts.push(`supplier_number = $${paramIndex++}`);
            updates.push(supplier_number);
        }


        if (updates.length === 0) {
            return new Response(JSON.stringify({ error: 'No fields to update' }), { status: 400 });
        }

        queryParts.push(`WHERE supplier_id = $${paramIndex++} RETURNING *`);
        updates.push(id);

        const query = queryParts.join(' ');
        const result = await pool.query(query, updates);

        if (result.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Supplier not found' }), { status: 404 });
        }

        const updatedSupplier = result.rows[0];
        return new Response(JSON.stringify({ message: 'Supplier updated', data: updatedSupplier }), { status: 200 });
    } catch (error: any) {
        const errorMessage = error.message || "An unknown error occurred";
        console.error('Error updating supplier:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to update supplier', details: errorMessage }), { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return new Response(JSON.stringify({ error: 'id is required for deletion' }), { status: 400 });
        }

        const result = await pool.query('DELETE FROM supplier WHERE supplier_id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Supplier not found' }), { status: 404 });
        }

        const deletedSupplier = result.rows;
        return new Response(JSON.stringify({ message: 'Supplier deleted', data: deletedSupplier }), { status: 200 });
    } catch (error: any) {
        const errorMessage = error.message || "An unknown error occurred";
        console.error('Error deleting supplier:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to delete supplier', details: errorMessage }), { status: 500 });
    }
}
