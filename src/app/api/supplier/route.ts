import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface SupplierRequest {
    supplier_name: string;
    supplier_contact_person?: string;
    supplier_address: string;
    supplier_email: string;
    supplier_number: string;
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

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    const loggedInUser = session?.user?.name || 'System';

    try {
        const { supplier_name, supplier_contact_person, supplier_address, supplier_email, supplier_number } = await request.json() as SupplierRequest;

        if (!supplier_name || !supplier_address || !supplier_email || !supplier_number) {
            return new Response(JSON.stringify({ error: 'Name, address, email, and number are required' }), { status: 400 });
        }

        //  Add validation for email format,  string lengths, allowed characters, etc.

        const result = await pool.query(
            'INSERT INTO supplier (supplier_name, supplier_contact_person, supplier_address, supplier_email, supplier_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [supplier_name, supplier_contact_person, supplier_address, supplier_email, supplier_number]
        );

        const newSupplier = result.rows[0];

        await createSystemLog(
            `Supplier created: ${newSupplier.supplier_name} (ID: ${newSupplier.supplier_id})`,
            loggedInUser
        );

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
    const session = await getServerSession(authOptions);
    const loggedInUser = session?.user?.name || 'System';

    try {
        const { id } = await request.json();
        const { supplier_name, supplier_contact_person, supplier_address, supplier_email, supplier_number } = await request.json() as SupplierRequest;

        if (!id) {
            return new Response(JSON.stringify({ error: 'id is required for update' }), { status: 400 });
        }

        // Fetch the supplier before updating for logging purposes
        const supplierBeforeUpdateResult = await pool.query('SELECT * FROM supplier WHERE supplier_id = $1', [id]);
        if (supplierBeforeUpdateResult.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Supplier not found' }), { status: 404 });
        }
        const supplierBeforeUpdate = supplierBeforeUpdateResult.rows[0];

        const updates: (string | undefined)[] = [];
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

        // Create system log for update
        const changedFields = Object.keys(supplierBeforeUpdate).filter(key => updatedSupplier[key] !== supplierBeforeUpdate[key]);
        if (changedFields.length > 0) {
            await createSystemLog(
                `Supplier updated: ${updatedSupplier.supplier_name} (ID: ${updatedSupplier.supplier_id}), fields changed: ${changedFields.join(', ')}`,
                loggedInUser
            );
        }

        return new Response(JSON.stringify({ message: 'Supplier updated', data: updatedSupplier }), { status: 200 });
    } catch (error: any) {
        const errorMessage = error.message || "An unknown error occurred";
        console.error('Error updating supplier:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to update supplier', details: errorMessage }), { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    const loggedInUser = session?.user?.name || 'System';

    try {
        const { id } = await request.json();

        if (!id) {
            return new Response(JSON.stringify({ error: 'id is required for deletion' }), { status: 400 });
        }

        // Fetch the supplier before deleting for logging
        const supplierBeforeDeleteResult = await pool.query('SELECT supplier_name FROM supplier WHERE supplier_id = $1', [id]);
        if (supplierBeforeDeleteResult.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Supplier not found' }), { status: 404 });
        }
        const supplierToDelete = supplierBeforeDeleteResult.rows[0];

        const result = await pool.query('DELETE FROM supplier WHERE supplier_id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Supplier not found' }), { status: 404 });
        }

        // Create system log for deletion
        await createSystemLog(
            `Supplier deleted: ${supplierToDelete.supplier_name} (ID: ${id})`,
            loggedInUser
        );

        const deletedSupplier = result.rows;
        return new Response(JSON.stringify({ message: 'Supplier deleted', data: deletedSupplier }), { status: 200 });
    } catch (error: any) {
        const errorMessage = error.message || "An unknown error occurred";
        console.error('Error deleting supplier:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to delete supplier', details: errorMessage }), { status: 500 });
    }
}