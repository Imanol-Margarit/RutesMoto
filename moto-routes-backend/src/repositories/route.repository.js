import { randomUUID } from "node:crypto";
import { pool } from "../config/db.js";

const columns = `
  id,
  title,
  region,
  "distanceKm",
  difficulty,
  description,
  slug,
  status,
  "isActive",
  "createdAt",
  "updatedAt",
  "deletedAt"
`;

function mapRow(row) {
  if (!row) return null;
  return {
    _id: row.id,
    title: row.title,
    region: row.region,
    distanceKm: Number(row.distanceKm),
    difficulty: row.difficulty,
    description: row.description,
    slug: row.slug,
    status: row.status,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt
  };
}

export const routeRepository = {
  /**
   * Lista las rutas no borradas (deletedAt IS NULL).
   * - findAll()                    -> todas (activas e inactivas)
   * - findAll({ isActive: true })  -> solo activas
   * - findAll({ isActive: false }) -> solo inactivas
   */
  async findAll({ isActive } = {}) {
    const conditions = [`"deletedAt" IS NULL`];
    const values = [];

    if (typeof isActive === "boolean") {
      values.push(isActive);
      conditions.push(`"isActive" = $${values.length}`);
    }

    const { rows } = await pool.query(
      `SELECT ${columns} FROM routes
       WHERE ${conditions.join(" AND ")}
       ORDER BY "createdAt" DESC`,
      values
    );
    return rows.map(mapRow);
  },

  /** Lista solo las rutas con soft delete (deletedAt IS NOT NULL), la más reciente primero. */
  async findDeleted() {
    const { rows } = await pool.query(
      `SELECT ${columns} FROM routes
       WHERE "deletedAt" IS NOT NULL
       ORDER BY "deletedAt" DESC`
    );
    return rows.map(mapRow);
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT ${columns} FROM routes WHERE id = $1 AND "deletedAt" IS NULL`,
      [id]
    );
    return mapRow(rows[0]);
  },

  async findBySlug(slug) {
    const { rows } = await pool.query(
      `SELECT ${columns} FROM routes WHERE slug = $1 AND "deletedAt" IS NULL`,
      [slug]
    );
    return mapRow(rows[0]);
  },

  /** Igual que findById, pero también encuentra rutas con soft-delete (para restaurar). */
  async findDeletedById(id) {
    const { rows } = await pool.query(
      `SELECT ${columns} FROM routes WHERE id = $1 AND "deletedAt" IS NOT NULL`,
      [id]
    );
    return mapRow(rows[0]);
  },

  async slugExists(slug, excludeId = null) {
    const { rows } = excludeId
      ? await pool.query(`SELECT 1 FROM routes WHERE slug = $1 AND id <> $2 LIMIT 1`, [
          slug,
          excludeId
        ])
      : await pool.query(`SELECT 1 FROM routes WHERE slug = $1 LIMIT 1`, [slug]);
    return rows.length > 0;
  },

  async create(data) {
    const id = randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO routes
        (id, title, region, "distanceKm", difficulty, description, slug, status, "isActive")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${columns}`,
      [
        id,
        data.title,
        data.region,
        data.distanceKm,
        data.difficulty,
        data.description ?? null,
        data.slug,
        data.status,
        data.isActive
      ]
    );
    return mapRow(rows[0]);
  },

  async updateById(id, data) {
    const fields = [];
    const values = [];
    let index = 1;

    // El slug se actualiza cuando cambia el título (lo calcula el service).
    const columnByField = {
      title: "title",
      region: "region",
      distanceKm: '"distanceKm"',
      difficulty: "difficulty",
      description: "description",
      slug: "slug",
      status: "status",
      isActive: '"isActive"'
    };

    for (const key of Object.keys(columnByField)) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        fields.push(`${columnByField[key]} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`"updatedAt" = NOW()`);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE routes
       SET ${fields.join(", ")}
       WHERE id = $${index} AND "deletedAt" IS NULL
       RETURNING ${columns}`,
      values
    );
    return mapRow(rows[0]);
  },

  /** Activa o desactiva una ruta (solo si no está borrada). */
  async setActiveById(id, isActive) {
    const { rows } = await pool.query(
      `UPDATE routes
       SET "isActive" = $1, "updatedAt" = NOW()
       WHERE id = $2 AND "deletedAt" IS NULL
       RETURNING ${columns}`,
      [isActive, id]
    );
    return mapRow(rows[0]);
  },

  /** Soft delete: marca la fila como borrada en vez de eliminarla físicamente. */
  async softDeleteById(id) {
    const { rows } = await pool.query(
      `UPDATE routes
       SET "deletedAt" = NOW(), "updatedAt" = NOW()
       WHERE id = $1 AND "deletedAt" IS NULL
       RETURNING id`,
      [id]
    );
    return rows[0] ?? null;
  },

  /** Deshace un soft delete. */
  async restoreById(id) {
    const { rows } = await pool.query(
      `UPDATE routes
       SET "deletedAt" = NULL, "updatedAt" = NOW()
       WHERE id = $1 AND "deletedAt" IS NOT NULL
       RETURNING ${columns}`,
      [id]
    );
    return mapRow(rows[0]);
  }
};
