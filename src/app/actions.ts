// app/actions.ts
"use server";
import { neon } from "@neondatabase/serverless";

export async function getData() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("DATABASE_URL environment variable is not set.");
    throw new Error("DATABASE_URL is missing"); 
  }

  try {
    const sql = neon(connectionString);
    const data = await sql`SELECT * FROM your_table`;
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Error fetching data from database"); 
  }
}
