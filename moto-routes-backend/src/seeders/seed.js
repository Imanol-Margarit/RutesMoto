import "dotenv/config";
import fs from "node:fs";
import { pool, closeDB } from "../config/db.js";
import { generateSlug } from "../utils/slug.util.js";

// Estructura de las tablas (sin datos).
const schemaSql = fs.readFileSync(new URL("../../db/moto_routes_schema.sql", import.meta.url), "utf8");

const picsum = (seed, w, h) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

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

const ROLES = [
  { name: "admin", slug: "admin", description: "Administrador del panel: gestiona todo el catálogo", is_active: true },
  { name: "host", slug: "host", description: "Guía que organiza rutas y salidas", is_active: true },
  { name: "user", slug: "user", description: "Usuario registrado que consulta las rutas", is_active: true }
];

const CATEGORIES = [
  { name: "Curvas", description: "Carreteras con muchas curvas y horquillas", is_active: true },
  { name: "Paisaje", description: "Rutas con vistas y paisajes destacados", is_active: true },
  { name: "Off-road", description: "Tramos de tierra o pista", is_active: true },
  { name: "Costa", description: "Recorridos junto al mar", is_active: true }
];

// user_id se rellena después: solo Lucía tiene cuenta de usuario con rol host.
const HOSTS = [
  { key: "lucia", name: "Lucía Ruta Norte", biography: "Guía especializada en puertos de montaña del norte peninsular. Organiza salidas de fin de semana desde Asturias.", status: "active", is_active: true },
  { key: "javier", name: "Javier Motoviaje", biography: "Organiza salidas de fin de semana por el Mediterráneo y el interior, con paradas para comer.", status: "active", is_active: true },
  { key: "carmen", name: "Carmen Sierra Tours", biography: "Rutas tranquilas para principiantes con paradas gastronómicas. Temporalmente sin salidas.", status: "suspended", is_active: true }
];

const LOCATIONS = [
  { key: "oviedo", city: "Oviedo", region: "Asturias", country: "España", address: "Plaza de la Catedral, s/n", postal_code: "33003", latitude: 43.361400, longitude: -5.859300 },
  { key: "ronda", city: "Ronda", region: "Andalucía", country: "España", address: "Plaza de España, 1", postal_code: "29400", latitude: 36.746200, longitude: -5.161300 },
  { key: "nijar", city: "Níjar", region: "Andalucía", country: "España", address: "Calle Real, 10", postal_code: "04150", latitude: 36.971900, longitude: -2.191400 },
  { key: "olot", city: "Olot", region: "Cataluña", country: "España", address: "Plaza Clarà, 2", postal_code: "17800", latitude: 42.181700, longitude: 2.490300 },
  { key: "avila", city: "Ávila", region: "Castilla y León", country: "España", address: "Plaza Mayor, 1", postal_code: "05001", latitude: 40.656600, longitude: -4.681800 },
  { key: "plasencia", city: "Plasencia", region: "Extremadura", country: "España", address: "Plaza Mayor, 3", postal_code: "10600", latitude: 40.031000, longitude: -6.089300 },
  { key: "laguardia", city: "Laguardia", region: "País Vasco", country: "España", address: "Plaza de la Paz, 4", postal_code: "01300", latitude: 42.541200, longitude: -2.565900 },
  { key: "hecho", city: "Hecho", region: "Aragón", country: "España", address: "Plaza de Hecho, s/n", postal_code: "22760", latitude: 42.765500, longitude: -0.749000 },
  { key: "orgiva", city: "Órgiva", region: "Andalucía", country: "España", address: "Plaza de la Iglesia, s/n", postal_code: "18400", latitude: 36.898500, longitude: -3.422400 },
  { key: "soller", city: "Sóller", region: "Islas Baleares", country: "España", address: "Puerto de Sóller, s/n", postal_code: "07100", latitude: 39.798700, longitude: 2.715000, status: "inactive" }
];

const ROUTES = [
  { title: "Puerto de Tarna y Ventana", description: "Cruce de la cordillera entre Asturias y León por carreteras de montaña con curvas rápidas, bosques y buenas vistas. Mejor fuera de los meses de nieve.", difficulty: "media", distance_km: 112.4, surface: "asfalto", start_point: "Plaza de la Catedral, Oviedo", estimated_minutes: 150, status: "publicada", is_active: true, host: "lucia", category: "Curvas", location: "oviedo" },
  { title: "Ronda - Grazalema por la Serranía", description: "Ruta entre pueblos blancos y sierras calizas, con tramos revirados y paisajes de dehesa. Ideal para una salida de día con parada a comer.", difficulty: "media", distance_km: 68.0, surface: "asfalto", start_point: "Puerta de Almocábar, Ronda", estimated_minutes: 120, status: "publicada", is_active: false, host: "javier", category: "Paisaje", location: "ronda" },
  { title: "Cabo de Gata y costa de Níjar", description: "Recorrido por el parque natural con paisaje desértico y calas al fondo. Asfalto en buen estado, curvas suaves y poco tráfico fuera de verano.", difficulty: "facil", distance_km: 85.2, surface: "mixto", start_point: "Aparcamiento de San José", estimated_minutes: 110, status: "publicada", is_active: true, host: "carmen", category: "Costa", location: "nijar" },
  { title: "Garrotxa volcánica: Olot - Santa Pau", description: "Carreteras estrechas entre volcanes extintos y hayedos, con pueblos de piedra y muchas curvas encadenadas. Conviene ir con calma por el firme irregular.", difficulty: "media", distance_km: 74.6, surface: "asfalto", start_point: "Plaza Clarà, Olot", estimated_minutes: 105, status: "publicada", is_active: true, host: "javier", category: "Paisaje", location: "olot" },
  { title: "Sierra de Gredos por el Puerto del Pico", description: "Subida por la antigua calzada hacia el valle del Tiétar, con rectas largas, curvas amplias y miradores sobre la sierra.", difficulty: "media", distance_km: 83.3, surface: "asfalto", start_point: "Plaza Mayor de Ávila", estimated_minutes: 135, status: "publicada", is_active: true, host: "lucia", category: "Curvas", location: "avila" },
  { title: "Valle del Jerte en flor", description: "Ruta tranquila entre cerezos y pueblos serranos. Especialmente bonita en primavera. Carretera ancha y buen asfalto, apta para principiantes.", difficulty: "facil", distance_km: 62.8, surface: "asfalto", start_point: "Plaza Mayor de Plasencia", estimated_minutes: 90, status: "publicada", is_active: true, host: "carmen", category: "Paisaje", location: "plasencia" },
  { title: "Ruta del vino por la Rioja Alavesa", description: "Circuito entre viñedos, bodegas y pueblos medievales con carreteras secundarias en muy buen estado. Perfecto para ir sin prisa y hacer varias paradas.", difficulty: "facil", distance_km: 58.9, surface: "asfalto", start_point: "Plaza de la Paz, Laguardia", estimated_minutes: 75, status: "publicada", is_active: true, host: "javier", category: "Paisaje", location: "laguardia" },
  { title: "Valles de Hecho y Ansó", description: "Recorrido por los valles del Pirineo aragonés con carreteras estrechas, tramos sin quitamiedos y mucha curva cerrada. Requiere experiencia y atención al tráfico de ganado.", difficulty: "dificil", distance_km: 105.5, surface: "mixto", start_point: "Plaza de Hecho", estimated_minutes: 180, status: "archivada", is_active: false, host: "lucia", category: "Off-road", location: "hecho" },
  { title: "La Alpujarra granadina", description: "Pueblos colgados de la ladera sur de Sierra Nevada, con curvas continuas y desniveles marcados. Buena opción para dos jornadas con noche en la zona.", difficulty: "media", distance_km: 96.7, surface: "asfalto", start_point: "Plaza de la Iglesia, Órgiva", estimated_minutes: 170, status: "borrador", is_active: true, host: "carmen", category: "Curvas", location: "orgiva" },
  { title: "Sa Calobra y la Serra de Tramuntana", description: "Clásico para motoristas: carretera de montaña con horquillas muy cerradas y paisaje espectacular. Mucha afluencia en temporada alta, mejor ir temprano.", difficulty: "dificil", distance_km: 62.4, surface: "asfalto", start_point: "Puerto de Sóller", estimated_minutes: 120, status: "publicada", is_active: true, host: "javier", category: "Curvas", location: "soller" }
];

async function seed() {
  // Recrea el esquema vacío y después inserta los datos.
  await pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  await pool.query(schemaSql);

  // ROLES
  const roleIds = {};
  for (const role of ROLES) {
    roleIds[role.slug] = await insert("roles", role);
  }

  // USUARIOS (hash de marcador: el login se hará con scrypt cuando se monte la autenticación)
  const users = {
    admin: { role_id: roleIds.admin, first_name: "System", last_name: "Admin", email: "admin@motoroutes.local", password_hash: "PENDIENTE_HASH", avatar_url: picsum("admin", 200, 200), is_active: true },
    lucia: { role_id: roleIds.host, first_name: "Lucía", last_name: "Ruta Norte", email: "lucia@motoroutes.local", password_hash: "PENDIENTE_HASH", avatar_url: picsum("lucia-user", 200, 200), is_active: true },
    marcos: { role_id: roleIds.user, first_name: "Marcos", last_name: "Motero", email: "marcos@motoroutes.local", password_hash: "PENDIENTE_HASH", avatar_url: null, is_active: true }
  };
  const userIds = {};
  for (const [key, user] of Object.entries(users)) {
    userIds[key] = await insert("users", user);
    await insert("users_images", { user_id: userIds[key], image_url: picsum(`user-${key}`, 200, 200), alt_text: `Foto de ${user.first_name} ${user.last_name}`, is_primary: true, sort_order: 0 });
  }

  // CATEGORÍAS (con imagen principal)
  const categoryIds = {};
  for (const category of CATEGORIES) {
    const slug = generateSlug(category.name);
    categoryIds[category.name] = await insert("categories", { ...category, slug });
    await insert("categories_images", { category_id: categoryIds[category.name], image_url: picsum(slug, 800, 400), alt_text: `Categoría ${category.name}`, is_primary: true, sort_order: 0 });
  }

  // GUÍAS (Lucía es la única ligada a un usuario con rol host)
  const hostIds = {};
  for (const host of HOSTS) {
    const { key, ...data } = host;
    const slug = generateSlug(data.name);
    hostIds[key] = await insert("hosts", { ...data, slug, user_id: key === "lucia" ? userIds.lucia : null });
    await insert("hosts_images", { host_id: hostIds[key], image_url: picsum(slug, 400, 400), alt_text: `Foto de ${data.name}`, is_primary: true, sort_order: 0 });
  }
  // Una segunda imagen de Lucía, no principal, para comprobar el orden
  await insert("hosts_images", { host_id: hostIds.lucia, image_url: picsum("lucia-2", 400, 400), alt_text: "Lucía en ruta", is_primary: false, sort_order: 1 });

  // LOCALIZACIONES (con imagen principal)
  const locationIds = {};
  for (const location of LOCATIONS) {
    const { key, ...data } = location;
    const slug = generateSlug(`${data.city} ${data.country}`);
    locationIds[key] = await insert("locations", { ...data, slug, status: data.status ?? "active", is_active: data.status !== "inactive" });
    await insert("locations_images", { location_id: locationIds[key], image_url: picsum(slug, 800, 600), alt_text: `Vista de ${data.city}`, is_primary: true, sort_order: 0 });
  }

  // RUTAS con sus imágenes
  const routeIds = {};
  for (const [index, route] of ROUTES.entries()) {
    const { host, category, location, ...data } = route;
    const slug = generateSlug(data.title);
    const routeId = await insert("rutas", {
      ...data,
      slug,
      host_id: hostIds[host],
      category_id: categoryIds[category],
      location_id: locationIds[location]
    });
    routeIds[slug] = routeId;

    // Las tres primeras rutas tienen varias imágenes; el resto, una principal.
    const imageCount = index < 3 ? 3 : 1;
    for (let position = 0; position < imageCount; position += 1) {
      await insert("rutas_images", {
        ruta_id: routeId,
        image_url: picsum(`${slug}-${position + 1}`, 800, 600),
        alt_text: `${data.title} (${position + 1})`,
        is_primary: position === 0,
        sort_order: position
      });
    }
  }

  // SALIDAS: cubren todos los estados y casos (programada, completa, cancelada, finalizada, inactiva)
  const departures = [
    { route: 0, date: "2026-11-14", start: "09:00", end: "18:00", capacity: 12, booked: 3, price: 45.0, status: "scheduled", is_active: true },
    { route: 0, date: "2026-12-05", start: "08:30", end: "17:30", capacity: 10, booked: 10, price: 45.0, status: "full", is_active: true },
    { route: 1, date: "2026-11-21", start: "09:00", end: "15:00", capacity: 8, booked: 0, price: 35.5, status: "cancelled", is_active: true },
    { route: 2, date: "2026-06-20", start: "10:00", end: "19:00", capacity: 15, booked: 15, price: 60.0, status: "completed", is_active: true },
    { route: 3, date: "2026-11-28", start: "09:30", end: "16:00", capacity: 12, booked: 5, price: 40.0, status: "scheduled", is_active: false },
    { route: 4, date: "2026-12-12", start: "08:00", end: "20:00", capacity: 6, booked: 2, price: 120.0, status: "scheduled", is_active: true }
  ];
  for (const departure of departures) {
    const route = ROUTES[departure.route];
    const slug = generateSlug(route.title);
    await insert("departures", {
      ruta_id: routeIds[slug],
      slug: `${slug}-${departure.date}`,
      start_datetime: `${departure.date}T${departure.start}:00+01:00`,
      end_datetime: `${departure.date}T${departure.end}:00+01:00`,
      capacity: departure.capacity,
      booked_participants: departure.booked,
      price: departure.price,
      status: departure.status,
      is_active: departure.is_active
    });
  }

  console.log(
    `Datos cargados: ${ROLES.length} roles, ${Object.keys(users).length} usuarios, ${CATEGORIES.length} categorías, ` +
      `${HOSTS.length} guías, ${LOCATIONS.length} localizaciones, ${ROUTES.length} rutas y ${departures.length} salidas.`
  );
}

seed()
  .catch((error) => {
    console.error("Error al ejecutar el seed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => closeDB());
