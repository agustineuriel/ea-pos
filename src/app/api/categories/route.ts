import { Pool } from 'pg';
import { NextResponse, NextRequest } from 'next/server';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

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
        return NextResponse.json({ message: 'Category created successfully', data: newCategory }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating category:", error);
        return NextResponse.json(
            { error: 'Failed to create category', details: error.message },
            { status: 500 }
        );
    }
}
