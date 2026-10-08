import "dotenv/config";
import { randomUUID } from "node:crypto";
import { connectDB, pool, closeDB } from "./config/db.js";
import { generateSlug } from "./utils/slug.util.js";

// 10 rutas "normales" (todas activas y publicadas por defecto).
const sampleRoutes = [
  {
    title: "Puerto de Tarna y Ventana",
    region: "Asturias",
    distanceKm: 112.4,
    difficulty: "media",
    description: "Cruce de la cordillera entre Asturias y León por carreteras de montaña con curvas rápidas, bosques y buenas vistas. Mejor fuera de los meses de nieve."
  },
  {
    title: "Ronda - Grazalema por la Serranía",
    region: "Málaga",
    distanceKm: 68.0,
    difficulty: "media",
    description: "Ruta entre pueblos blancos y sierras calizas, con tramos revirados y paisajes de dehesa. Ideal para una salida de día con parada a comer."
  },
  {
    title: "Cabo de Gata y costa de Níjar",
    region: "Almería",
    distanceKm: 85.2,
    difficulty: "facil",
    description: "Recorrido por el parque natural con paisaje desértico y calas al fondo. Asfalto en buen estado, curvas suaves y poco tráfico fuera de verano."
  },
  {
    title: "Garrotxa volcánica: Olot - Santa Pau",
    region: "Girona",
    distanceKm: 74.6,
    difficulty: "media",
    description: "Carreteras estrechas entre volcanes extintos y hayedos, con pueblos de piedra y muchas curvas encadenadas. Conviene ir con calma por el firme irregular."
  },
  {
    title: "Sierra de Gredos por el Puerto del Pico",
    region: "Ávila",
    distanceKm: 83.3,
    difficulty: "media",
    description: "Subida por la antigua calzada hacia el valle del Tiétar, con rectas largas, curvas amplias y miradores sobre la sierra."
  },
  {
    title: "Valle del Jerte en flor",
    region: "Cáceres",
    distanceKm: 62.8,
    difficulty: "facil",
    description: "Ruta tranquila entre cerezos y pueblos serranos. Especialmente bonita en primavera. Carretera ancha y buen asfalto, apta para principiantes."
  },
  {
    title: "Ruta del vino por la Rioja Alavesa",
    region: "Álava",
    distanceKm: 58.9,
    difficulty: "facil",
    description: "Circuito entre viñedos, bodegas y pueblos medievales con carreteras secundarias en muy buen estado. Perfecto para ir sin prisa y hacer varias paradas."
  },
  {
    title: "Valles de Hecho y Ansó",
    region: "Huesca",
    distanceKm: 105.5,
    difficulty: "dificil",
    description: "Recorrido por los valles del Pirineo aragonés con carreteras estrechas, tramos sin quitamiedos y mucha curva cerrada. Requiere experiencia y atención al tráfico de ganado."
  },
  {
    title: "La Alpujarra granadina",
    region: "Granada",
    distanceKm: 96.7,
    difficulty: "media",
    description: "Pueblos colgados de la ladera sur de Sierra Nevada, con curvas continuas y desniveles marcados. Buena opción para dos jornadas con noche en la zona."
  },
  {
    title: "Sa Calobra y la Serra de Tramuntana",
    region: "Mallorca",
    distanceKm: 62.4,
    difficulty: "dificil",
    description: "Clásico para motoristas: carretera de montaña con horquillas muy cerradas y paisaje espectacular. Mucha afluencia en temporada alta, mejor ir temprano."
  }
];

async function seedDatabase() {
  try {
    await connectDB();

    // OJO: borra todas las rutas existentes antes de insertar (igual que seed.js).
    await pool.query("TRUNCATE TABLE routes");
    console.log("Tabla de rutas limpiada correctamente.");

    for (const route of sampleRoutes) {
      await pool.query(
        `INSERT INTO routes
        (id, title, region, "distanceKm", difficulty, description, slug)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          randomUUID(),
          route.title,
          route.region,
          route.distanceKm,
          route.difficulty,
          route.description,
          generateSlug(route.title)
        ]
      );
    }

    console.log(`¡Éxito! Se han insertado ${sampleRoutes.length} rutas.`);
  } catch (error) {
    console.error("Error al ejecutar el seed:", error);
    process.exitCode = 1;
  } finally {
    await closeDB();
  }
}

seedDatabase();
