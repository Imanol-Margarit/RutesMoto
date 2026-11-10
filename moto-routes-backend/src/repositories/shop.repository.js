import { pool } from "../config/db.js";

// Solo se muestran rutas publicadas, activas y no borradas, con guía, categoría y localización activos si existen.
const BASE_FROM = `
  FROM rutas AS r
  LEFT JOIN hosts AS h ON h.id = r.host_id
  LEFT JOIN categories AS c ON c.id = r.category_id
  LEFT JOIN locations AS l ON l.id = r.location_id
`;

const BASE_CONDITIONS = [
  "r.deleted_at IS NULL",
  "r.is_active = TRUE",
  "r.status = 'publicada'",
  "(h.id IS NULL OR (h.is_active = TRUE AND h.deleted_at IS NULL))",
  "(c.id IS NULL OR (c.is_active = TRUE AND c.deleted_at IS NULL))",
  "(l.id IS NULL OR (l.is_active = TRUE AND l.deleted_at IS NULL AND l.status = 'active'))",
];

// Imagen principal y precio mínimo de las próximas salidas disponibles, en una sola consulta.
const JOIN_CARD_DATA = `
  LEFT JOIN LATERAL (
    SELECT i.image_url, i.alt_text FROM rutas_images AS i
    WHERE i.ruta_id = r.id AND i.deleted_at IS NULL
    ORDER BY i.is_primary DESC, i.sort_order ASC
    LIMIT 1
  ) AS img ON TRUE
  LEFT JOIN LATERAL (
    SELECT MIN(d.price) AS min_price FROM departures AS d
    WHERE d.ruta_id = r.id AND d.deleted_at IS NULL AND d.is_active = TRUE
      AND d.status = 'scheduled' AND d.start_datetime > NOW()
  ) AS dep ON TRUE
`;

const SELECT_CARD = `
  SELECT r.id AS "_id", r.title, r.slug, r.description, r.difficulty, r.surface,
         r.distance_km AS "distanceKm", r.estimated_minutes AS "estimatedMinutes", r.start_point AS "startPoint",
         h.name AS "hostName", h.slug AS "hostSlug",
         c.name AS "categoryName", c.slug AS "categorySlug",
         l.city AS "locationCity", l.country AS "locationCountry", l.slug AS "locationSlug",
         img.image_url AS "imageUrl", img.alt_text AS "imageAlt", dep.min_price AS "minPrice"
`;

const ORDER_BY = {
  recent: "ORDER BY r.created_at DESC",
  distance_asc: "ORDER BY r.distance_km ASC",
  distance_desc: "ORDER BY r.distance_km DESC",
  duration_asc: "ORDER BY r.estimated_minutes ASC NULLS LAST",
  title_asc: "ORDER BY r.title ASC",
};

// Escapa los comodines de LIKE para que la búsqueda sea literal.
const escapeLike = (value) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

export const shopRepository = {
  /**
   * Listado paginado con filtros dinámicos: solo se añade una condición por cada filtro recibido.
   * filters: { search, categories[], hosts[], locations[], difficulties[], surfaces[], distanceMin, distanceMax, sort, page, limit }
   */
  async findRoutes(filters) {
    const where = [...BASE_CONDITIONS];
    const params = [];
    const add = (value) => {
      params.push(value);
      return `$${params.length}`;
    };

    if (filters.search) {
      const pattern = add(`%${escapeLike(filters.search)}%`);
      where.push(`(r.title ILIKE ${pattern} OR r.description ILIKE ${pattern})`);
    }
    if (filters.categories.length) where.push(`c.slug = ANY(${add(filters.categories)})`);
    if (filters.hosts.length) where.push(`h.slug = ANY(${add(filters.hosts)})`);
    if (filters.locations.length) where.push(`l.slug = ANY(${add(filters.locations)})`);
    if (filters.difficulties.length) where.push(`r.difficulty = ANY(${add(filters.difficulties)})`);
    if (filters.surfaces.length) where.push(`r.surface = ANY(${add(filters.surfaces)})`);
    if (filters.distanceMin !== undefined) where.push(`r.distance_km >= ${add(filters.distanceMin)}`);
    if (filters.distanceMax !== undefined) where.push(`r.distance_km <= ${add(filters.distanceMax)}`);

    const whereSql = `WHERE ${where.join(" AND ")}`;

    const { rows: countRows } = await pool.query(`SELECT COUNT(*)::int AS total ${BASE_FROM} ${whereSql}`, params);

    const listParams = [...params, filters.limit, (filters.page - 1) * filters.limit];
    const { rows } = await pool.query(
      `${SELECT_CARD} ${BASE_FROM} ${JOIN_CARD_DATA} ${whereSql} ${ORDER_BY[filters.sort]}
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );

    return { rows, total: countRows[0].total };
  },

  async findRouteBySlug(slug) {
    const { rows } = await pool.query(
      `${SELECT_CARD} ${BASE_FROM} ${JOIN_CARD_DATA} WHERE r.slug = $1 AND ${BASE_CONDITIONS.join(" AND ")}`,
      [slug]
    );
    return rows[0] ?? null;
  },

  async findRouteImages(routeId) {
    const { rows } = await pool.query(
      `SELECT image_url AS url, alt_text AS alt FROM rutas_images
       WHERE ruta_id = $1 AND deleted_at IS NULL
       ORDER BY is_primary DESC, sort_order ASC`,
      [routeId]
    );
    return rows;
  },

  /** Salidas futuras, programadas, activas y con plazas libres. */
  async findAvailableDepartures(routeId) {
    const { rows } = await pool.query(
      `SELECT id AS "_id", start_datetime AS "startDatetime", end_datetime AS "endDatetime",
              capacity, booked_participants AS "bookedParticipants", price
       FROM departures
       WHERE ruta_id = $1 AND deleted_at IS NULL AND is_active = TRUE
         AND status = 'scheduled' AND start_datetime > NOW()
         AND booked_participants < capacity
       ORDER BY start_datetime ASC`,
      [routeId]
    );
    return rows;
  },

  async findActiveCategories() {
    const { rows } = await pool.query(
      `SELECT id AS "_id", name, slug FROM categories
       WHERE deleted_at IS NULL AND is_active = TRUE ORDER BY name ASC`
    );
    return rows;
  },

  async findActiveHosts() {
    const { rows } = await pool.query(
      `SELECT id AS "_id", name, slug, biography FROM hosts
       WHERE deleted_at IS NULL AND is_active = TRUE AND status = 'active' ORDER BY name ASC`
    );
    return rows;
  },

  async findActiveLocations() {
    const { rows } = await pool.query(
      `SELECT id AS "_id", city, region, country, slug FROM locations
       WHERE deleted_at IS NULL AND is_active = TRUE AND status = 'active'
       ORDER BY country ASC, city ASC`
    );
    return rows;
  },
};
