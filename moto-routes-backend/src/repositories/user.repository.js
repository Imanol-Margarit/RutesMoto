import { escapeLike } from "../utils/list-filters.js";
import { pool } from "../config/db.js";
import { userModel } from "../models/user.model.js";
import { toColumns } from "../utils/sql.util.js";

// passwordHash no aparece en ninguna consulta de lectura.
const SELECT_USER = `
  SELECT t.id AS "_id", t.role_id AS "roleId", t.first_name AS "firstName", t.last_name AS "lastName",
         t.email, t.avatar_url AS "avatarUrl", t.is_active AS "isActive",
         t.created_at AS "createdAt", t.updated_at AS "updatedAt", t.deleted_at AS "deletedAt"
  FROM ${userModel.table} AS t`;

// Usuario + nombre de su rol (JOIN): solo roles activos y no borrados.
const SELECT_AUTH = `
  SELECT t.id AS "_id", t.email, t.first_name AS "firstName", t.last_name AS "lastName",
         t.avatar_url AS "avatarUrl", t.is_active AS "isActive", r.name AS "role"`;
const FROM_AUTH = `
  FROM ${userModel.table} AS t
  JOIN roles AS r ON r.id = t.role_id AND r.deleted_at IS NULL AND r.is_active`;

export const userRepository = {
  async findAll(filters = {}) {
    const params = [];
    const add = (value) => {
      params.push(value);
      return `$${params.length}`;
    };
    const where = ["t.deleted_at IS NULL"];
    if (typeof filters.isActive === "boolean") where.push(`t.is_active = ${add(filters.isActive)}`);
    if (filters.search) {
      const pattern = add(`%${escapeLike(filters.search)}%`);
      where.push(`(t.first_name ILIKE ${pattern} OR t.last_name ILIKE ${pattern} OR t.email ILIKE ${pattern})`);
    }
    if (filters.roleId !== undefined) where.push(`t.role_id = ${add(filters.roleId)}`);
    const { rows } = await pool.query(`${SELECT_USER} WHERE ${where.join(" AND ")} ORDER BY t.last_name ASC`, params);
    return rows;
  },

  async findDeleted() {
    const { rows } = await pool.query(`${SELECT_USER} WHERE t.deleted_at IS NOT NULL ORDER BY t.deleted_at DESC`);
    return rows;
  },

  async hasUsersForRole(roleId) {
    const { rowCount } = await pool.query("SELECT 1 FROM users WHERE role_id = $1 AND deleted_at IS NULL LIMIT 1", [roleId]);
    return rowCount > 0;
  },

  /**
   * Solo para el login: incluye el hash (nunca se envía al cliente).
   * Si el rol no existe, está borrado o desactivado, no devuelve nada: no se asume "user".
   */
  async findAuthByEmail(email) {
    const { rows } = await pool.query(
      `${SELECT_AUTH}, t.password_hash AS "passwordHash" ${FROM_AUTH}
       WHERE LOWER(t.email) = LOWER($1) AND t.deleted_at IS NULL`,
      [email]
    );
    return rows[0] ?? null;
  },

  // Para /me y el middleware de autenticación: usuario + nombre del rol en una sola consulta.
  async findAuthById(id) {
    const { rows } = await pool.query(`${SELECT_AUTH} ${FROM_AUTH} WHERE t.id = $1 AND t.deleted_at IS NULL`, [id]);
    return rows[0] ?? null;
  },

  async findById(id) {
    const { rows } = await pool.query(`${SELECT_USER} WHERE t.id = $1 AND t.deleted_at IS NULL`, [id]);
    return rows[0] ?? null;
  },

  async findAnyById(id, client = pool) {
    const { rows } = await client.query(`${SELECT_USER} WHERE t.id = $1`, [id]);
    return rows[0] ?? null;
  },

  // client: dentro de una transacción hay que usar la misma conexión (si no, el usuario nuevo aún no se ve).
  async create(data, client = pool) {
    const { names, values } = toColumns(userModel.columns, data);
    const { rows } = await client.query(
      `INSERT INTO users (${names.join(", ")}) VALUES (${names.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING id`,
      values
    );
    return userRepository.findAnyById(rows[0].id, client);
  },

  async update(id, data, client = pool) {
    const { names, values } = toColumns(userModel.columns, data);
    if (names.length === 0) return userRepository.findById(id);

    const sets = names.map((name, i) => `${name} = $${i + 1}`).join(", ");
    const { rowCount } = await client.query(
      `UPDATE users SET ${sets}, updated_at = NOW() WHERE id = $${names.length + 1} AND deleted_at IS NULL`,
      [...values, id]
    );
    return rowCount ? userRepository.findAnyById(id) : null;
  },

  async softDelete(id) {
    const { rowCount } = await pool.query(
      "UPDATE users SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );
    return rowCount ? userRepository.findAnyById(id) : null;
  },

  async restore(id) {
    const { rowCount } = await pool.query(
      "UPDATE users SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND deleted_at IS NOT NULL",
      [id]
    );
    return rowCount ? userRepository.findAnyById(id) : null;
  }
};
