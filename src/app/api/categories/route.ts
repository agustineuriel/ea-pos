import { Pool } from 'pg';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; 

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

export async function GET() {
    try {
        const result = await pool.query('SELECT * FROM category ORDER BY updated_at DESC');
        const categories = result.rows;
        return NextResponse.json({ data: categories }, { status: 200 });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    const loggedInUser = session?.user?.name || 'System'; // Default to 'System' if no user

    try {
        const { category_name } = await request.json();

        if (!category_name) {
            return NextResponse.json({ error: "Category name is required" }, { status: 400 });
        }

        const result = await pool.query(
            `INSERT INTO category (category_name, created_at, updated_at) 
             VALUES ($1, NOW(), NOW()) 
             RETURNING *`,
            [category_name]
        );
        const newCategory = result.rows[0];

        // Create system log for category creation
        await createSystemLog(`Category created: ${category_name}`, loggedInUser);

        return NextResponse.json({ message: 'Category created successfully', data: newCategory }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating category:", error);
        return NextResponse.json(
            { error: 'Failed to create category', details: error.message },
            { status: 500 }
        );
    }
}