import { z } from "zod";

export const DIFFICULTIES = ["facil", "media", "dificil"];
export const SURFACES = ["asfalto", "mixto", "tierra"];
export const SORTS = ["recent", "distance_asc", "distance_desc", "duration_asc", "title_asc"];

/** Query de /api/shop/routes. Los filtros de lista admiten varios valores separados por coma: ?difficulty=facil,media */
export const shopRouteQuerySchema = z.object({
  search: z.string().trim().max(100, "search no puede superar 100 caracteres").optional(),
  category: z.string().trim().max(300).optional(),
  host: z.string().trim().max(300).optional(),
  location: z.string().trim().max(300).optional(),
  difficulty: z.string().trim().max(100).optional(),
  surface: z.string().trim().max(100).optional(),
  distanceMin: z.coerce.number().min(0, "distanceMin debe ser >= 0").optional(),
  distanceMax: z.coerce.number().min(0, "distanceMax debe ser >= 0").optional(),
  sort: z.enum(SORTS, { errorMap: () => ({ message: `sort debe ser: ${SORTS.join(", ")}` }) }).optional(),
  page: z.coerce.number().int("page debe ser entero").min(1, "page debe ser >= 1").optional(),
  limit: z.coerce.number().int("limit debe ser entero").min(1).max(50, "limit no puede superar 50").optional(),
});
