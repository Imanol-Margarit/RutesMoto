import "dotenv/config";
import fs from "node:fs";
import { pool, closeDB } from "../config/db.js";
import { generateSlug } from "../utils/slug.util.js";

// Estructura de las tablas (sin datos).
const schemaSql = fs.readFileSync(new URL("../../db/moto_routes_schema.sql", import.meta.url), "utf8");

const ROLES = [
  { name: "admin", slug: "admin", description: "Administrador del panel" },
  { name: "host", slug: "host", description: "Guía que organiza rutas" },
  { name: "user", slug: "user", description: "Usuario registrado" }
];

const CATEGORIES = [
  { name: "Curvas", slug: "curvas", description: "Carreteras con muchas curvas y horquillas" },
  { name: "Paisaje", slug: "paisaje", description: "Rutas con vistas y paisajes destacados" },
  { name: "Off-road", slug: "off-road", description: "Tramos de tierra o pista" },
  { name: "Costa", slug: "costa", description: "Recorridos junto al mar" }
];

const HOSTS = [
  { name: "Lucía Ruta Norte", slug: "lucia-ruta-norte", biography: "Guía especializada en puertos de montaña del norte peninsular." },
  { name: "Javier Motoviaje", slug: "javier-motoviaje", biography: "Organiza salidas de fin de semana por el Mediterráneo y el interior." },
  { name: "Carmen Sierra Tours", slug: "carmen-sierra-tours", biography: "Rutas tranquilas para principiantes con paradas gastronómicas." }
];

const LOCATIONS = [
  { city: "Oviedo", region: "Asturias", country: "España", slug: "oviedo-espana", latitude: 43.3614, longitude: -5.8593 },
  { city: "Ronda", region: "Andalucía", country: "España", slug: "ronda-espana", latitude: 36.7462, longitude: -5.1613 },
  { city: "Níjar", region: "Andalucía", country: "España", slug: "nijar-espana", latitude: 36.9719, longitude: -2.1914 },
  { city: "Olot", region: "Cataluña", country: "España", slug: "olot-espana", latitude: 42.1817, longitude: 2.4903 },
  { city: "Ávila", region: "Castilla y León", country: "España", slug: "avila-espana", latitude: 40.6566, longitude: -4.6818 },
  { city: "Plasencia", region: "Extremadura", country: "España", slug: "plasencia-espana", latitude: 40.031, longitude: -6.0893 },
  { city: "Laguardia", region: "País Vasco", country: "España", slug: "laguardia-espana", latitude: 42.5412, longitude: -2.5659 },
  { city: "Hecho", region: "Aragón", country: "España", slug: "hecho-espana", latitude: 42.7655, longitude: -0.749 },
  { city: "Órgiva", region: "Andalucía", country: "España", slug: "orgiva-espana", latitude: 36.8985, longitude: -3.4224 },
  { city: "Sóller", region: "Islas Baleares", country: "España", slug: "soller-espana", latitude: 39.7987, longitude: 2.715 }
];

const ROUTES = [
  { title: "Puerto de Tarna y Ventana", description: "Cruce de la cordillera entre Asturias y León por carreteras de montaña con curvas rápidas, bosques y buenas vistas. Mejor fuera de los meses de nieve.", difficulty: "media", distanceKm: 112.4, surface: "asfalto", startPoint: "Plaza de la Catedral, Oviedo", estimatedMinutes: 150, host: "lucia-ruta-norte", category: "curvas", location: "oviedo-espana" },
  { title: "Ronda - Grazalema por la Serranía", description: "Ruta entre pueblos blancos y sierras calizas, con tramos revirados y paisajes de dehesa. Ideal para una salida de día con parada a comer.", difficulty: "media", distanceKm: 68.0, surface: "asfalto", startPoint: "Puerta de Almocábar, Ronda", estimatedMinutes: 120, host: "javier-motoviaje", category: "paisaje", location: "ronda-espana" },
  { title: "Cabo de Gata y costa de Níjar", description: "Recorrido por el parque natural con paisaje desértico y calas al fondo. Asfalto en buen estado, curvas suaves y poco tráfico fuera de verano.", difficulty: "facil", distanceKm: 85.2, surface: "mixto", startPoint: "Aparcamiento de San José", estimatedMinutes: 110, host: "carmen-sierra-tours", category: "costa", location: "nijar-espana" },
  { title: "Garrotxa volcánica: Olot - Santa Pau", description: "Carreteras estrechas entre volcanes extintos y hayedos, con pueblos de piedra y muchas curvas encadenadas. Conviene ir con calma por el firme irregular.", difficulty: "media", distanceKm: 74.6, surface: "asfalto", startPoint: "Plaza Clarà, Olot", estimatedMinutes: 105, host: "javier-motoviaje", category: "paisaje", location: "olot-espana" },
  { title: "Sierra de Gredos por el Puerto del Pico", description: "Subida por la antigua calzada hacia el valle del Tiétar, con rectas largas, curvas amplias y miradores sobre la sierra.", difficulty: "media", distanceKm: 83.3, surface: "asfalto", startPoint: "Plaza Mayor de Ávila", estimatedMinutes: 135, host: "lucia-ruta-norte", category: "curvas", location: "avila-espana" },
  { title: "Valle del Jerte en flor", description: "Ruta tranquila entre cerezos y pueblos serranos. Especialmente bonita en primavera. Carretera ancha y buen asfalto, apta para principiantes.", difficulty: "facil", distanceKm: 62.8, surface: "asfalto", startPoint: "Plaza Mayor de Plasencia", estimatedMinutes: 90, host: "carmen-sierra-tours", category: "paisaje", location: "plasencia-espana" },
  { title: "Ruta del vino por la Rioja Alavesa", description: "Circuito entre viñedos, bodegas y pueblos medievales con carreteras secundarias en muy buen estado. Perfecto para ir sin prisa y hacer varias paradas.", difficulty: "facil", distanceKm: 58.9, surface: "asfalto", startPoint: "Plaza de la Paz, Laguardia", estimatedMinutes: 75, host: "javier-motoviaje", category: "paisaje", location: "laguardia-espana" },
  { title: "Valles de Hecho y Ansó", description: "Recorrido por los valles del Pirineo aragonés con carreteras estrechas, tramos sin quitamiedos y mucha curva cerrada. Requiere experiencia y atención al tráfico de ganado.", difficulty: "dificil", distanceKm: 105.5, surface: "mixto", startPoint: "Plaza de Hecho", estimatedMinutes: 180, host: "lucia-ruta-norte", category: "off-road", location: "hecho-espana" },
  { title: "La Alpujarra granadina", description: "Pueblos colgados de la ladera sur de Sierra Nevada, con curvas continuas y desniveles marcados. Buena opción para dos jornadas con noche en la zona.", difficulty: "media", distanceKm: 96.7, surface: "asfalto", startPoint: "Plaza de la Iglesia, Órgiva", estimatedMinutes: 170, host: "carmen-sierra-tours", category: "curvas", location: "orgiva-espana" },
  { title: "Sa Calobra y la Serra de Tramuntana", description: "Clásico para motoristas: carretera de montaña con horquillas muy cerradas y paisaje espectacular. Mucha afluencia en temporada alta, mejor ir temprano.", difficulty: "dificil", distanceKm: 62.4, surface: "asfalto", startPoint: "Puerto de Sóller", estimatedMinutes: 120, host: "javier-motoviaje", category: "curvas", location: "soller-espana" }
];

const DEPARTURE_DATES = ["2026-11-14", "2026-11-21", "2026-12-05"];

// Inserta una fila (columnas en snake_case) y devuelve su id.
async function insert(table, data) {
  const columns = Object.keys(data);
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
  const { rows } = await pool.query(
    `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders}) RETURNING id`,
    columns.map((column) => data[column])
  );
  return rows[0].id;
}

async function seed() {
  // Recrea el esquema vacío y después inserta los datos.
  await pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  await pool.query(schemaSql);

  const roleIds = {};
  for (const role of ROLES) {
    roleIds[role.slug] = await insert("roles", role);
  }

  // Hash de marcador: el login se hará con scrypt cuando se monte la autenticación.
  const adminId = await insert("users", {
    role_id: roleIds.admin,
    first_name: "System",
    last_name: "Admin",
    email: "admin@motoroutes.local",
    password_hash: "PENDIENTE_HASH"
  });
  await insert("users_images", {
    user_id: adminId,
    image_url: `https://picsum.photos/seed/${adminId}/200/200`,
    alt_text: "System Admin",
    is_primary: true,
    sort_order: 0
  });

  const categoryIds = {};
  for (const category of CATEGORIES) {
    categoryIds[category.slug] = await insert("categories", category);
    await insert("categories_images", {
      category_id: categoryIds[category.slug],
      image_url: `https://picsum.photos/seed/${category.slug}/800/400`,
      alt_text: category.name,
      is_primary: true,
      sort_order: 0
    });
  }

  const hostIds = {};
  for (const host of HOSTS) {
    hostIds[host.slug] = await insert("hosts", { ...host, status: "active" });
    await insert("hosts_images", {
      host_id: hostIds[host.slug],
      image_url: `https://picsum.photos/seed/${host.slug}/400/400`,
      alt_text: host.name,
      is_primary: true,
      sort_order: 0
    });
  }

  const locationIds = {};
  for (const location of LOCATIONS) {
    locationIds[location.slug] = await insert("locations", location);
    await insert("locations_images", {
      location_id: locationIds[location.slug],
      image_url: `https://picsum.photos/seed/${location.slug}/800/600`,
      alt_text: location.city,
      is_primary: true,
      sort_order: 0
    });
  }

  for (const [index, route] of ROUTES.entries()) {
    const slug = generateSlug(route.title);
    const routeId = await insert("rutas", {
      title: route.title,
      slug,
      description: route.description,
      distance_km: route.distanceKm,
      difficulty: route.difficulty,
      surface: route.surface,
      start_point: route.startPoint,
      estimated_minutes: route.estimatedMinutes,
      host_id: hostIds[route.host],
      category_id: categoryIds[route.category],
      location_id: locationIds[route.location]
    });

    await insert("rutas_images", {
      ruta_id: routeId,
      image_url: `https://picsum.photos/seed/${slug}/800/600`,
      alt_text: route.title,
      is_primary: true,
      sort_order: 0
    });

    // Las tres primeras rutas tienen una salida de ejemplo.
    if (index < DEPARTURE_DATES.length) {
      const date = DEPARTURE_DATES[index];
      await insert("departures", {
        ruta_id: routeId,
        slug: `${slug}-${date}`,
        start_datetime: `${date}T09:00:00+01:00`,
        end_datetime: `${date}T18:00:00+01:00`,
        capacity: 12,
        booked_participants: 3,
        price: 45,
        status: "scheduled"
      });
    }
  }

  console.log(`Datos cargados: ${ROUTES.length} rutas y ${DEPARTURE_DATES.length} salidas.`);
}

seed()
  .catch((error) => {
    console.error("Error al ejecutar el seed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => closeDB());
