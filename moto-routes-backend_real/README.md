# Moto Routes API

API REST para gestionar rutas de moto, sus imágenes y las salidas programadas de cada ruta.

- **Backend**: Node.js + Express 5 (ES Modules)
- **Base de datos**: PostgreSQL 16 (SQL directo con `pg`)
- **Validación**: Zod
- **Documentación**: Swagger en `/api/docs`

## Requisitos

- Node.js 20 o superior
- Docker y Docker Compose (para PostgreSQL)

## Instalación

```bash
npm install
cp .env.example .env
docker compose up -d
npm run seed
npm run dev
```

La API arranca en `http://localhost:3000`.

## Variables de entorno

Están en `.env` (copia de `.env.example`):

| Variable | Ejemplo | Para qué sirve |
|---|---|---|
| `PORT` | `3000` | Puerto de la API |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5433/moto_routes` | Conexión a PostgreSQL |
| `CORS_ORIGIN` | `http://localhost:4200` | Orígenes permitidos (separados por coma) |

PostgreSQL usa el puerto **5433** para no chocar con otros proyectos que usen el 5432.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Arranca la API y se reinicia al cambiar archivos |
| `npm start` | Arranca la API sin recargas |
| `npm run seed` | Borra el esquema `public`, crea las tablas desde `db/moto_routes_schema.sql` y carga los datos de ejemplo |

> `npm run seed` borra todos los datos que haya en la base de datos antes de cargar los de ejemplo.

## Base de datos

El esquema está en `db/moto_routes_schema.sql` (solo estructura, sin datos). Los datos de ejemplo están en `src/seeders/seed.js`.

| Tabla | Contenido |
|---|---|
| `roles` | Roles de usuario: admin, host, user |
| `users` | Cuentas de usuario, con rol |
| `hosts` | Guías que organizan rutas (opcionalmente ligados a un usuario) |
| `categories` | Tipos de ruta: Curvas, Paisaje, Off-road, Costa |
| `locations` | Ciudad, región y país de cada ruta |
| `rutas` | Rutas de moto |
| `rutas_images` | Imágenes de cada ruta (una principal por ruta) |
| `departures` | Salidas programadas de una ruta |
| `hosts_images`, `categories_images`, `locations_images`, `users_images` | Imágenes de cada entidad (sin endpoints todavía) |

Convenciones:
- Nombres de tabla y columna en **snake_case** (`is_active`, `distance_km`).
- La **API** usa **camelCase** (`isActive`, `distanceKm`). Los repositorios hacen la traducción.
- Borrado lógico: la columna `deleted_at` marca las filas borradas. Nada se elimina físicamente.
- `is_active` es el interruptor de activo/inactivo. `status` es el estado propio de cada tabla.

## Estructura del proyecto

```
db/
  moto_routes_schema.sql     Tablas (sin datos)
src/
  config/                    Conexión a PostgreSQL, logger y Swagger
  controllers/               Reciben la petición y responden
  middlewares/               Validación y gestión de errores
  models/                    Tabla, columnas (API → base de datos) y relaciones
  repositories/              Consultas SQL
  routes/                    Rutas HTTP
  schemas/                   Validación Zod
  seeders/                   Datos de ejemplo
  services/                  Lógica: slug, relaciones, papelera
  utils/                     Errores, slug, respuestas y traducción de columnas
  app.js                     Configuración de Express
  server.js                  Arranque del servidor
```

## Endpoints

Todos los endpoints empiezan por `/api`. La lista completa con cuerpos y respuestas está en Swagger (`/api/docs`) y en `postman.md`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Comprobar que la API responde |
| GET | `/api/routes` | Rutas no borradas |
| GET | `/api/routes/active` | Rutas activas |
| GET | `/api/routes/inactive` | Rutas inactivas |
| GET | `/api/routes/deleted` | Papelera |
| GET | `/api/routes/slug/:slug` | Ruta por slug |
| GET | `/api/routes/:id` | Ruta por id |
| POST | `/api/routes` | Crear ruta |
| PATCH | `/api/routes/:id` | Editar ruta |
| PATCH | `/api/routes/:id/status` | Cambiar el estado editorial |
| PATCH | `/api/routes/:id/activate` | Activar |
| PATCH | `/api/routes/:id/deactivate` | Desactivar |
| PATCH | `/api/routes/:id/restore` | Restaurar de la papelera |
| DELETE | `/api/routes/:id` | Borrar (pasa a la papelera) |
| GET | `/api/routes/:id/images` | Imágenes de una ruta |
| POST | `/api/routes/:id/images` | Añadir imagen |
| PATCH | `/api/routes/:id/images/:imageId` | Editar imagen |
| DELETE | `/api/routes/:id/images/:imageId` | Borrar imagen |
| GET, POST | `/api/departures` | Listar / crear salidas |
| GET | `/api/departures/active`, `/inactive`, `/deleted` | Listados por estado |
| GET | `/api/departures/slug/:slug` | Salida por slug |
| GET, PATCH, DELETE | `/api/departures/:id` | Obtener, editar y borrar una salida |
| PATCH | `/api/departures/:id/activate`, `/deactivate`, `/restore` | Activar, desactivar y restaurar |

## Formato de respuesta

Éxito:
```json
{ "success": true, "message": "Ruta creada correctamente", "data": { } }
```

Error de validación (400):
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [ { "field": "difficulty", "message": "La dificultad debe ser: facil, media o dificil" } ]
}
```

Otros errores: `404` (no encontrado) y `409` (duplicado). Los errores de base de datos se traducen a mensajes en español.

## Slugs

- Las rutas tienen slug a partir del título, y las salidas a partir del slug de la ruta y la fecha.
- Si el slug ya existe, se añade `-2`, `-3`... Las rutas borradas también reservan su slug.
- Al cambiar el título de una ruta, el slug se regenera.

## Pendiente

- Endpoints para guías, categorías, localizaciones y usuarios (sus tablas ya existen).
- Autenticación (login, tokens y roles).
- Filtros y paginación en los listados.
