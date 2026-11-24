import { env } from "../config/env.js";
import { fetchJson, HttpError, toQueryString } from "../utils/http.util.js";

// Cliente de la API principal. Solo usa los endpoints públicos de la tienda (/shop),
// así el agente nunca ve rutas en borrador, borradas o inactivas.

async function get(path) {
  try {
    const body = await fetchJson(`${env.motoRoutesApiUrl}${path}`);
    return body.data;
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return null;
    if (error instanceof HttpError && error.status === 400) {
      throw new Error(error.body?.message || "Filtros no válidos");
    }
    throw new Error("No se pudo conectar con la tienda de Moto Routes");
  }
}

export const motoRoutesClient = {
  /** filters: los mismos query params que acepta GET /shop/routes. */
  searchRoutes(filters) {
    return get(`/shop/routes${toQueryString(filters)}`);
  },

  getRoute(slug) {
    return get(`/shop/routes/${encodeURIComponent(slug)}`);
  },

  getCategories() {
    return get("/shop/categories");
  },

  getLocations() {
    return get("/shop/locations");
  },

  getHosts() {
    return get("/shop/hosts");
  },

  /** Comentarios públicos de una ruta: { route, stats, items }. */
  getComments(slug) {
    return get(`/comments/route/${encodeURIComponent(slug)}`);
  },
};
