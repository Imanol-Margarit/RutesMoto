# Moto Routes API

API REST mínima con Express + PostgreSQL para una experiencia estilo Wikiloc, pero enfocada
en **rutas en moto**, organizada por capas:

- `app.js`: configuración de Express, middleware y rutas.
- `server.js`: arranque de la aplicación y conexión a la base de datos.
- `controllers`: HTTP/request-response.
- `services`: reglas de negocio.
- `repositories`: acceso a PostgreSQL mediante SQL parametrizado.
- `models`: definición de la estructura de datos.
- `routes`: endpoints.
- `schemas`: esquemas de validación con Zod.
- `middlewares`: validación, errores y respuestas 404.
- `config`: conexión a PostgreSQL y configuración de logging.

La API usa **PostgreSQL** mediante `pg`. No usa MongoDB/Mongoose ni `express-validator`:
la validación de `body` y parámetros se hace con **Zod** antes de llegar al controlador.

## Seguridad y logging

- **Helmet**: añade cabeceras de seguridad HTTP en todas las respuestas. En concreto, se
  configura `frameguard: { action: "deny" }`, que impide que la API se cargue dentro de un
  `<iframe>` de otra página — es la protección estándar contra **clickjacking**.
- **Morgan**: registra cada petición HTTP en dos sitios a la vez (`src/config/logger.js`):
  - En la **consola** del servidor, con formato `dev` (compacto, con colores según el
    código de estado).
  - En un **fichero** `logs/access.log`, con formato `combined` (más detallado: IP,
    fecha, método, ruta, estado, user-agent...). La carpeta `logs/` se crea sola al
    arrancar el servidor si no existe, y no se sube al repositorio (está en
    `.gitignore`).

## Campos de una route (ruta en moto)

Pocos campos, al estilo Wikiloc simplificado:

- `title`: string, obligatorio, máximo 120 caracteres.
- `region`: string, obligatorio, máximo 80 caracteres (provincia/zona de la ruta).
- `distanceKm`: number, obligatorio, >= 0 (distancia en kilómetros).
- `difficulty`: string, obligatorio, uno de `facil` | `media` | `dificil`.
- `description`: string, opcional, máximo 500 caracteres.
- `id`: UUID generado por la aplicación.
- `slug`: string generado automáticamente a partir de `title` (p. ej. "Puerto de la
  Bonaigua" → `puerto-de-la-bonaigua`). Único. Se regenera cuando se actualiza el título.
- `status`: uno de `borrador` | `publicada` | `archivada`. Por defecto `publicada`.
- `isActive`: boolean. Por defecto `true`. Permite activar/desactivar una ruta sin borrarla
  (ver sección *Activar / desactivar*).
- `createdAt` y `updatedAt`: gestionados por PostgreSQL.
- `deletedAt`: `null` mientras la ruta está viva. Al borrarla (soft delete) se rellena con
  la fecha de borrado, pero la fila sigue existiendo en la base de datos.

### Soft delete

`DELETE /api/routes/:id` ya no borra la fila físicamente: le pone `deletedAt = NOW()`. Las
rutas con `deletedAt` relleno dejan de aparecer en `GET /api/routes` y `GET /api/routes/:id`.
Para recuperarla, usa `PATCH /api/routes/:id/restore`, que pone `deletedAt` de nuevo a `null`.

### Activar / desactivar

`isActive` es independiente de `status` y de `deletedAt`:

- `status` → estado editorial (`borrador` / `publicada` / `archivada`).
- `isActive` → interruptor on/off de la ruta (visible/oculta para el público en el frontend).
- `deletedAt` → soft delete.

Se cambia con endpoints dedicados (`PATCH /api/routes/:id/activate` y
`PATCH /api/routes/:id/deactivate`), aunque también se puede seguir enviando `isActive`
en el `PATCH /api/routes/:id` normal. Ambos son idempotentes: activar una ruta ya activa
devuelve la ruta sin error. Una ruta con soft delete devuelve 404.

Los listados disponibles son `GET /api/routes` (todas), `GET /api/routes/active` y
`GET /api/routes/inactive`. Ninguno incluye rutas con soft delete: esas se listan aparte con `GET /api/routes/deleted`
(para poder recuperarlas con `PATCH /api/routes/:id/restore`).

## Requisitos

- Node.js 18+ recomendado.
- PostgreSQL 13+ recomendado (ver sección Docker más abajo).

## Configuración

```bash
npm install
cp .env.example .env
```

Configura `DATABASE_URL` en `.env`, por ejemplo:

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/moto_routes
```

La aplicación crea automáticamente la tabla `routes` al arrancar.

## Ejecutar

```bash
npm run dev
```

o:

```bash
npm start
```

Para cargar datos de ejemplo:

```bash
npm run seed      # 3 rutas
npm run seed:10   # 10 rutas
```

> Ambos seeds ejecutan `TRUNCATE TABLE routes`: **borran todas las rutas existentes**
> antes de insertar.

## Endpoints

| Método | Endpoint | Acción |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/routes` | Listar todas (activas + inactivas) |
| GET | `/api/routes/active` | Listar solo las activas |
| GET | `/api/routes/inactive` | Listar solo las inactivas |
| GET | `/api/routes/deleted` | Listar solo las borradas (soft delete) |
| GET | `/api/routes/slug/:slug` | Obtener una por slug |
| GET | `/api/routes/:id` | Obtener una |
| POST | `/api/routes` | Crear |
| PATCH | `/api/routes/:id` | Actualizar |
| PATCH | `/api/routes/:id/activate` | Activar (`isActive = true`) |
| PATCH | `/api/routes/:id/deactivate` | Desactivar (`isActive = false`) |
| DELETE | `/api/routes/:id` | Eliminar (soft delete) |
| PATCH | `/api/routes/:id/status` | Cambiar `status` (`borrador` / `publicada` / `archivada`) |
| PATCH | `/api/routes/:id/restore` | Restaurar una ruta borrada |

### Ejemplo POST

```json
{
  "title": "Puerto de la Bonaigua en moto",
  "region": "Lleida",
  "distanceKm": 78.5,
  "difficulty": "media",
  "description": "Curvas de montaña con vistas al Pirineo catalán."
}
```

La respuesta devuelve `_id` como UUID para mantener el mismo contrato de respuesta de la API.

---

## Docker: cómo crear un segundo Postgres para este proyecto

Como ya usas Docker para levantar el Postgres de `airbnb-api_v4`, lo más sencillo es
**crear un segundo contenedor de Postgres independiente**, con su propio nombre, su propio
volumen y un puerto de host distinto (para no chocar con el que ya tienes ocupando el 5432).

Este proyecto incluye un `docker-compose.yml` listo para eso:

```yaml
services:
  moto-routes-db:
    image: postgres:16-alpine
    container_name: moto-routes-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: moto_routes
    ports:
      - "5433:5432"   # host:contenedor -> distinto del 5432 que ya usas
    volumes:
      - moto_routes_data:/var/lib/postgresql/data

volumes:
  moto_routes_data:
```

### Pasos

1. Levanta el contenedor:

   ```bash
   docker compose up -d
   ```

2. Comprueba que está corriendo:

   ```bash
   docker ps
   ```

   Deberías ver `moto-routes-db` escuchando en `0.0.0.0:5433->5432/tcp`, además del
   contenedor que ya tenías para `airbnb-api_v4` (normalmente en el 5432).

3. Tu `.env` de este proyecto debe apuntar al puerto `5433`:

   ```text
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/moto_routes
   ```

4. Arranca la API normalmente (`npm run dev`); al iniciar creará la tabla `routes` sola.

### Notas

- Si prefieres usar el **mismo contenedor** de Postgres que ya tienes para `airbnb-api_v4`
  en vez de uno nuevo, basta con crear una base de datos adicional dentro de él:

  ```bash
  docker exec -it <nombre_contenedor_airbnb> psql -U postgres -c "CREATE DATABASE moto_routes;"
  ```

  y apuntar `DATABASE_URL` al mismo host/puerto (`5432`) pero con `/moto_routes` al final.
  Esto ahorra recursos, pero significa que ambos proyectos comparten el mismo servidor
  Postgres (mismo contenedor, mismo proceso).

- Si en cambio quieres aislamiento total (por ejemplo, para poder parar/borrar uno sin
  afectar al otro, o usar versiones distintas de Postgres), usa el `docker-compose.yml`
  de este proyecto con un puerto distinto, como se explica arriba.

- Para parar y eliminar este contenedor sin perder datos:

  ```bash
  docker compose stop
  ```

  Para eliminarlo completamente (incluyendo el volumen de datos):

  ```bash
  docker compose down -v
  ```
