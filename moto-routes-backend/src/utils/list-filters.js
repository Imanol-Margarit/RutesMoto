import { AppError } from "./app-error.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Escapa los comodines de LIKE para que la búsqueda sea literal. */
export const escapeLike = (value) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

/** Filtros permitidos por entidad: "string", "boolean", "uuid", "number" o lista de valores permitidos. */
export const ROUTE_FILTERS = {
  search: "string", isActive: "boolean",
  status: ["borrador", "publicada", "archivada"],
  difficulty: ["facil", "media", "dificil"],
  surface: ["asfalto", "mixto", "tierra"],
  hostId: "uuid", categoryId: "uuid", locationId: "uuid",
};
export const DEPARTURE_FILTERS = {
  search: "string", isActive: "boolean",
  status: ["scheduled", "full", "cancelled", "completed"],
  routeId: "uuid", priceMin: "number", priceMax: "number",
};
export const HOST_FILTERS = { search: "string", isActive: "boolean", status: ["active", "inactive", "suspended"] };
export const CATEGORY_FILTERS = { search: "string", isActive: "boolean" };
export const LOCATION_FILTERS = { search: "string", isActive: "boolean", status: ["active", "inactive"] };
export const ROLE_FILTERS = { search: "string", isActive: "boolean" };
export const USER_FILTERS = { search: "string", isActive: "boolean", roleId: "uuid" };

/** Convierte la query de la URL en filtros válidos. Un valor no permitido responde 400. */
export function parseListQuery(query, spec) {
  const filters = {};
  for (const [key, rule] of Object.entries(spec)) {
    const raw = query?.[key];
    if (raw === undefined || raw === "") continue;

    if (rule === "string") {
      const text = String(raw).trim().slice(0, 100);
      if (text) filters[key] = text;
    } else if (rule === "boolean") {
      if (raw !== "true" && raw !== "false") throw new AppError(`${key} debe ser true o false`, 400);
      filters[key] = raw === "true";
    } else if (rule === "uuid") {
      if (!UUID_REGEX.test(String(raw))) throw new AppError(`${key} debe ser un UUID válido`, 400);
      filters[key] = String(raw);
    } else if (rule === "number") {
      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0) throw new AppError(`${key} debe ser un número positivo`, 400);
      filters[key] = value;
    } else if (Array.isArray(rule)) {
      if (!rule.includes(String(raw))) throw new AppError(`${key} debe ser: ${rule.join(", ")}`, 400);
      filters[key] = String(raw);
    }
  }
  return filters;
}
