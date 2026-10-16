import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL es obligatoria");
}

export const pool = new Pool({ connectionString });

/** Ejecuta varias consultas en una misma transacción. */
export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function connectDB() {
  await pool.query("SELECT 1");
  console.log("PostgreSQL conectado");
}

export async function closeDB() {
  await pool.end();
}
