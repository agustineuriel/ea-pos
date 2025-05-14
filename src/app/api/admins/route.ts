import { Pool } from 'pg';
import { NextResponse, NextRequest } from 'next/server';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET() {
    try {
        const result = await pool.query('SELECT * FROM admin ORDER BY updated_at DESC');
        const admin = result.rows;
        return NextResponse.json({ data: admin }, { status: 200 });
    } catch (error) {
        console.error("Error fetching admin:", error);
        return NextResponse.json(
            { error: "Failed to fetch admin" },
            { status: 500 }
        );
    }
}
