import { motoRoutesClient } from "../clients/moto-routes.client.js";
import { weatherClient } from "../clients/weather.client.js";

const DIFFICULTIES = ["facil", "media", "dificil"];
const SURFACES = ["asfalto", "mixto", "tierra"];
const SORTS = ["recent", "distance_asc", "distance_desc", "duration_asc", "title_asc"];
const MAX_RESULTS = 5;
const MAX_DEPARTURES = 5;

// ── Definiciones que ve el modelo (formato OpenAI / Groq) ─────────────────────

export const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "buscar_rutas",
      description:
        "Busca rutas publicadas en la tienda. Todos los filtros son opcionales y se pueden combinar. Devuelve como máximo 5 rutas.",
      parameters: {
        type: "object",
        properties: {
          search: { type: "string", description: "Texto libre que se busca en el título y la descripción" },
          category: { type: "string", description: "Slug de categoría (ver listar_opciones). Varios separados por coma" },
          location: { type: "string", description: "Slug de localización (ver listar_opciones). Varios separados por coma" },
          difficulty: { type: "string", description: `Una o varias separadas por coma: ${DIFFICULTIES.join(", ")}` },
          surface: { type: "string", description: `Una o varias separadas por coma: ${SURFACES.join(", ")}` },
          distanceMin: { type: "number", description: "Distancia mínima en km" },
          distanceMax: { type: "number", description: "Distancia máxima en km" },
          priceMax: { type: "number", description: "Precio máximo por persona en euros (de la salida más barata)" },
          sort: { type: "string", enum: SORTS, description: "Orden de los resultados" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "detalle_ruta",
      description:
        "Devuelve el detalle de una ruta por su slug: descripción, punto de salida, guía, localización con coordenadas y próximas salidas con plazas libres y precio.",
      parameters: {
        type: "object",
        properties: { slug: { type: "string", description: "Slug de la ruta, por ejemplo valle-del-jerte-en-flor" } },
        required: ["slug"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listar_opciones",
      description: "Lista las categorías, localizaciones y guías disponibles, con su slug, para poder filtrar rutas.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "consultar_clima",
      description:
        "Previsión diaria del tiempo (máximo 14 días). Indica latitud y longitud, o el nombre de una ciudad. Si se da una fecha, devuelve solo ese día.",
      parameters: {
        type: "object",
        properties: {
          latitude: { type: "number" },
          longitude: { type: "number" },
          city: { type: "string", description: "Ciudad o pueblo, por ejemplo Ronda" },
          date: { type: "string", description: "Fecha en formato AAAA-MM-DD" },
        },
        additionalProperties: false,
      },
    },
  },
];

// ── Resúmenes compactos: menos datos = menos tokens y respuestas más rápidas ─

function summarizeRoute(route) {
  return {
    title: route.title,
    slug: route.slug,
    difficulty: route.difficulty,
    surface: route.surface,
    distanceKm: route.distanceKm,
    estimatedMinutes: route.estimatedMinutes,
    category: route.category?.name ?? null,
    location: route.location
      ? {
          city: route.location.city,
          country: route.location.country,
          latitude: route.location.latitude ?? null,
          longitude: route.location.longitude ?? null,
        }
      : null,
    host: route.host?.name ?? null,
    minPriceEur: route.minPrice,
  };
}

const summarizeDeparture = (departure) => ({
  start: departure.startDatetime,
  end: departure.endDatetime,
  priceEur: departure.price,
  seatsLeft: departure.seatsLeft,
});

// ── Implementación de cada herramienta ────────────────────────────────────────
// Cada una recibe (args, context). context.routes guarda las rutas que han salido,
// para devolverlas al frontend y que pinte tarjetas o el mapa.

const handlers = {
  async buscar_rutas(args, context) {
    const result = await motoRoutesClient.searchRoutes({
      search: args.search,
      category: args.category,
      location: args.location,
      difficulty: args.difficulty,
      surface: args.surface,
      distanceMin: args.distanceMin,
      distanceMax: args.distanceMax,
      priceMax: args.priceMax,
      sort: args.sort,
      limit: MAX_RESULTS,
    });

    const items = result?.items ?? [];
    items.forEach((route) => context.addRoute(route));

    return { total: result?.pagination?.total ?? 0, routes: items.map(summarizeRoute) };
  },

  async detalle_ruta({ slug }, context) {
    const route = await motoRoutesClient.getRoute(slug);
    if (!route) return { error: `No existe ninguna ruta publicada con el slug "${slug}"` };

    context.addRoute(route);

    return {
      ...summarizeRoute(route),
      description: route.description,
      startPoint: route.startPoint,
      upcomingDepartures: (route.departures ?? []).slice(0, MAX_DEPARTURES).map(summarizeDeparture),
      totalUpcomingDepartures: route.departures?.length ?? 0,
    };
  },

  async listar_opciones() {
    const [categories, locations, hosts] = await Promise.all([
      motoRoutesClient.getCategories(),
      motoRoutesClient.getLocations(),
      motoRoutesClient.getHosts(),
    ]);
    return {
      categories: (categories ?? []).map(({ name, slug }) => ({ name, slug })),
      locations: (locations ?? []).map(({ city, region, slug }) => ({ city, region, slug })),
      hosts: (hosts ?? []).map(({ name, slug }) => ({ name, slug })),
    };
  },

  async consultar_clima({ latitude, longitude, city, date }) {
    let place = null;

    if (typeof latitude === "number" && typeof longitude === "number") {
      place = { name: city ?? null, latitude, longitude };
    } else if (city) {
      place = await weatherClient.geocode(city);
      if (!place) return { error: `No se ha encontrado la ciudad "${city}"` };
    } else {
      return { error: "Indica latitude y longitude, o city" };
    }

    const days = await weatherClient.dailyForecast(place.latitude, place.longitude);

    if (date) {
      const day = days.find((item) => item.date === date);
      if (!day) {
        return {
          place,
          error: `No hay previsión para ${date}. Solo hay datos del ${days[0].date} al ${days.at(-1).date}.`,
        };
      }
      return { place, forecast: [day] };
    }

    return { place, forecast: days.slice(0, 7) };
  },
};

/** Ejecuta una llamada a herramienta del modelo. Nunca lanza: los errores vuelven al modelo como { error }. */
export async function runTool(name, rawArguments, context) {
  const handler = handlers[name];
  if (!handler) return { error: `La herramienta ${name} no existe` };

  let args;
  try {
    args = rawArguments ? JSON.parse(rawArguments) : {};
  } catch {
    return { error: "Los argumentos no son un JSON válido" };
  }

  try {
    return await handler(args ?? {}, context);
  } catch (error) {
    console.error(`Error en la herramienta ${name}:`, error.message);
    return { error: error.message || "No se pudo completar la consulta" };
  }
}
