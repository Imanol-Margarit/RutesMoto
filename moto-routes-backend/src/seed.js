import "dotenv/config";
import { randomUUID } from "node:crypto";
import { connectDB, pool, closeDB } from "./config/db.js";
import { generateSlug } from "./utils/slug.util.js";

const sampleRoutes = [
  {
    title: "Puerto de la Bonaigua en moto",
    region: "Lleida",
    distanceKm: 78.5,
    difficulty: "media",
    description: "Curvas de montaña con vistas espectaculares al Pirineo catalán, firme en buen estado y poco tráfico entre semana."
  },
  {
    title: "Ruta costera Calpe - Jávea",
    region: "Alicante",
    distanceKm: 42.3,
    difficulty: "facil",
    description: "Recorrido tranquilo por la costa mediterránea, ideal para iniciarse, con miradores y paradas junto al mar."
  },
  {
    title: "Alto del Angliru",
    region: "Asturias",
    distanceKm: 95.1,
    difficulty: "dificil",
    description: "Ascensión exigente con rampas muy pronunciadas y curvas cerradas, recomendada solo para pilotos experimentados."
  }
];

async function seedDatabase() {
  try {
    await connectDB();

    await pool.query("TRUNCATE TABLE routes");
    console.log("Tabla de rutas limpiada correctamente.");

    for (const route of sampleRoutes) {
      const slug = generateSlug(route.title);

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
          slug
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
