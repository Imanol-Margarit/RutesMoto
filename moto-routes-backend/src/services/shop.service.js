import { shopRepository } from "../repositories/shop.repository.js";
import { AppError } from "../utils/app-error.js";
import { DIFFICULTIES, SURFACES } from "../schemas/shop.schema.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 9;

/** "facil,media" -> ["facil", "media"]. Si algún valor no está permitido, responde 400. */
function parseList(raw, allowed, name) {
  if (!raw) return [];
  const values = [...new Set(raw.split(",").map((value) => value.trim()).filter(Boolean))];
  const invalid = values.filter((value) => !allowed.includes(value));
  if (invalid.length) {
    throw new AppError(`Valor no válido en ${name}: ${invalid.join(", ")}`, 400);
  }
  return values;
}

/** Los slugs de categoría, guía y localización son libres, pero se limpian y se separan. */
function parseSlugList(raw) {
  if (!raw) return [];
  return [...new Set(raw.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean))];
}

const toRouteCard = (row) => ({
  _id: row._id,
  title: row.title,
  slug: row.slug,
  description: row.description,
  difficulty: row.difficulty,
  surface: row.surface,
  distanceKm: Number(row.distanceKm),
  estimatedMinutes: row.estimatedMinutes,
  startPoint: row.startPoint,
  host: row.hostSlug ? { name: row.hostName, slug: row.hostSlug } : null,
  category: row.categorySlug ? { name: row.categoryName, slug: row.categorySlug } : null,
  location: row.locationSlug
    ? { city: row.locationCity, country: row.locationCountry, slug: row.locationSlug }
    : null,
  image: row.imageUrl ? { url: row.imageUrl, alt: row.imageAlt } : null,
  minPrice: row.minPrice === null ? null : Number(row.minPrice),
});

export const shopService = {
  async getCategories() {
    return shopRepository.findActiveCategories();
  },

  async getHosts() {
    return shopRepository.findActiveHosts();
  },

  async getLocations() {
    return shopRepository.findActiveLocations();
  },

  async getRoutes(query) {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;

    if (query.distanceMin !== undefined && query.distanceMax !== undefined && query.distanceMin > query.distanceMax) {
      throw new AppError("distanceMin no puede ser mayor que distanceMax", 400);
    }

    const filters = {
      search: query.search ?? "",
      categories: parseSlugList(query.category),
      hosts: parseSlugList(query.host),
      locations: parseSlugList(query.location),
      difficulties: parseList(query.difficulty, DIFFICULTIES, "difficulty"),
      surfaces: parseList(query.surface, SURFACES, "surface"),
      distanceMin: query.distanceMin,
      distanceMax: query.distanceMax,
      sort: query.sort ?? "recent",
      page,
      limit,
    };

    const { rows, total } = await shopRepository.findRoutes(filters);

    return {
      items: rows.map(toRouteCard),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getRouteDepartures(slug) {
    const row = await shopRepository.findRouteBySlug(slug);
    if (!row) throw new AppError("Ruta no encontrada", 404);

    const departures = await shopRepository.findAvailableDepartures(row._id);
    return departures.map((departure) => ({
      ...departure,
      price: Number(departure.price),
      seatsLeft: departure.capacity - departure.bookedParticipants,
    }));
  },

  async getRouteDetail(slug) {
    const row = await shopRepository.findRouteBySlug(slug);
    if (!row) throw new AppError("Ruta no encontrada", 404);

    const [images, departures] = await Promise.all([
      shopRepository.findRouteImages(row._id),
      shopRepository.findAvailableDepartures(row._id),
    ]);

    return {
      ...toRouteCard(row),
      images,
      departures: departures.map((departure) => ({
        ...departure,
        price: Number(departure.price),
        seatsLeft: departure.capacity - departure.bookedParticipants,
      })),
    };
  },
};
