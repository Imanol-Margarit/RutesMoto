import { pool } from "../config/db.js";

export const roleRepository = {
  async findAll() {
    const { rows } = await pool.query(
      `SELECT id AS "_id", name, slug, description, is_active AS "isActive"
       FROM roles WHERE deleted_at IS NULL AND is_active = TRUE ORDER BY name ASC`
    );
    return rows;
  }
};
