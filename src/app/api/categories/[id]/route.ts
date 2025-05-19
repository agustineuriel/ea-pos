import { NextResponse, NextRequest } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route'; 

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

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

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    if (!id || id === 'null') {
        return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    try {
        const result = await pool.query('SELECT category_name, category_id, created_at, updated_at FROM category WHERE category_id = $1', [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        const category = result.rows[0];
        return NextResponse.json({ data: category }, { status: 200 });
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json(
            { error: 'Failed to fetch category' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const { category_name } = await request.json();
    const session = await getServerSession(authOptions);
    const loggedInUser = session?.user?.name || 'System';

    if (!id || id === 'null') {
        return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    if (!category_name) {
        return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    try {
        const result = await pool.query(
            `UPDATE category
             SET category_name = $1, updated_at = NOW()
             WHERE category_id = $2
             RETURNING *`,
            [category_name, id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        const updatedCategory = result.rows[0];
        await createSystemLog(`Category updated: ${updatedCategory.category_name} (ID: ${updatedCategory.category_id})`, loggedInUser);
        return NextResponse.json({ message: 'Category updated successfully', data: updatedCategory }, { status: 200 });
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const loggedInUser = session?.user?.name || 'System';

    if (!id || id === 'null') {
        return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    try {
        const result = await pool.query('DELETE FROM category WHERE category_id = $1 RETURNING category_name, category_id', [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        const deletedCategory = result.rows[0];
        await createSystemLog(`Category deleted: ${deletedCategory.category_name} (ID: ${deletedCategory.category_id})`, loggedInUser);
        return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        );
    }
}