import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(request: Request) {
    try {
        const result = await pool.query(`SELECT * FROM system_log ORDER BY log_datetime DESC`);
        const log = result.rows;
        return new Response(JSON.stringify({ data: log }), { status: 200 });
    } catch (error: any) {
        const errorMessage = error.message || "An unknown error occurred";
        console.error('Error getting system logs:', errorMessage);
        return new Response(JSON.stringify({ error: 'Failed to get system logs', details: errorMessage }), { status: 500 });
    }
}