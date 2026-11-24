# Moto Routes (Motoruta)

Proyecto de clase: tienda y panel de rutas en moto. Monorepo con 4 aplicaciones.

## Preferencias
- Responder en **español**, de forma **concisa**.
- Si pido revisar o planificar, **explicar qué y cómo antes de modificar nada**.
- No hacer comprobaciones ni pruebas si no las pido: las hago yo.
- No ejecutar `npm run seed` sin preguntar: hace `DROP SCHEMA` y borra los datos.

## Estructura y puertos
| Carpeta | Qué es | Puerto | Arrancar |
|---|---|---|---|
| `moto-routes-backend` | API REST (Express 5 + PostgreSQL con `pg`, sin ORM) | 3000 | `npm run dev` |
| `moto-routes-ai` | Agente IA (Groq) que consulta la API | 3001 | `npm run dev` |
| `moto-routes-gateway` | Proxy: `/api/ia` → IA, `/api` → backend. Gestiona el CORS | 4000 | `npm run dev` |
| `moto-routes-frontend` | Angular (standalone, signals, Tailwind) | 4200 | `npm start` |

- Angular solo habla con el gateway (`environment.apiUrl = http://localhost:4000/api`).
- PostgreSQL en Docker (`moto-routes-backend/docker-compose.yml`), puerto 5433.
- Esquema: `moto-routes-backend/db/moto_routes_schema.sql`. Datos: `npm run seed` (usuarios de prueba `admin@`, `lucia@` (host), `marcos@` (user) `@motoroutes.local`, contraseña `Motoroutes123`).
- Pruebas manuales de la API: `moto-routes-backend/postman.md`.

## Backend: convenciones
- Capas: `routes` (con Swagger JSDoc) → `controllers` → `services` → `repositories` → `models`.
- Validación con Zod en `schemas/` + `validate(schema)`. Los esquemas son `.strict()`.
- Errores: `throw new AppError(mensaje, status)`. `error.middleware.js` traduce errores de PostgreSQL por nombre de constraint.
- Respuestas: `respond(res, status, message, data)` → `{ success, message, data }`.
- La API usa camelCase; la BD, snake_case (alias `AS "camelCase"` en los SELECT). Borrado lógico con `deleted_at`.
- Transacciones: `withTransaction(async (client) => ...)` de `config/db.js`; los repositorios aceptan `client = pool`.
- Mensajes y comentarios en español.

## Autenticación
- Roles: `admin`, `host` (escriben, entran al panel) y `user` (cliente). El registro público siempre crea `user`.
- Endpoints `/api/auth`: `register`, `login`, `refresh`, `logout`, `me`.
- Tokens **solo en cookies HttpOnly**, nunca en el JSON:
  - `access_token`: JWT de 1 h (`JWT_ACCESS_EXPIRES_IN`), path `/api`.
  - `refresh_token`: aleatorio de 7 días (`REFRESH_TOKEN_DAYS`), path `/api/auth`.
- Los dos se guardan **hasheados (SHA-256)** en `refresh_tokens` y `access_tokens` (con `status` active/revoked). Cada access se enlaza a su refresh (`refresh_token_id`).
- `/refresh` rota el par. Si se reutiliza un refresh revocado, se revocan todas las sesiones del usuario.
- `/logout` no exige access: revoca el refresh y su access, y borra las cookies.
- Middleware `authenticate`: solo cookie; verifica el JWT y que el access esté activo en la BD (1 consulta con JOIN a users y roles). `requireWriter` = admin o host.

## Frontend: convenciones
- `ApiService` envuelve HttpClient con Promises y `withCredentials: true`.
- Estado con signals en `core/stores` y `auth/auth.store.ts` (`user`, `role`, `isAuthenticated`, `isAdmin`; `canWrite` es alias de `isAdmin`).
- Interceptors (orden importa): `request → loading → error → auth`. `auth` hace el refresh ante un 401 y repite la petición; `error` va por fuera para avisar solo del error final.
- Guards: `authGuard` (sesión), `adminGuard` (panel), `roleGuard`. Rutas públicas: `/shop`, `/login`, `/register`.
