import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL es obligatoria");
}

export const pool = new Pool({ connectionString });

export async function connectDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS routes (
      id UUID PRIMARY KEY,
      title VARCHAR(120) NOT NULL,
      region VARCHAR(80) NOT NULL,
      "distanceKm" NUMERIC(6, 2) NOT NULL CHECK ("distanceKm" >= 0),
      difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('facil', 'media', 'dificil')),
      description VARCHAR(500),
      slug VARCHAR(160),
      status VARCHAR(20) NOT NULL DEFAULT 'publicada',
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "deletedAt" TIMESTAMPTZ
    )
  `);

  // Migración ligera: si la tabla ya existía de antes de añadir estos
  // campos, se agregan sin tocar las filas que ya había. No se usa
  // CHECK aquí a propósito (la validación de valores permitidos para
  // "status" ya la hace route.service.js); así una tabla antigua no
  // falla al migrar.
  await pool.query(`ALTER TABLE routes ADD COLUMN IF NOT EXISTS slug VARCHAR(160)`);
  await pool.query(
    `ALTER TABLE routes ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'publicada'`
  );
  await pool.query(
    `ALTER TABLE routes ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true`
  );
  await pool.query(`ALTER TABLE routes ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMPTZ`);

  // El slug debe ser único, pero solo entre los valores que no son NULL
  // (así las filas antiguas sin slug no chocan entre ellas).
  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS routes_slug_key ON routes (slug) WHERE slug IS NOT NULL`
  );

  console.log("PostgreSQL conectado");
}

export async function closeDB() {
  await pool.end();
}
