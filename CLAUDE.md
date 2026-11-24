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
- El autor/propietario sale siempre de `req.user` (sesión), nunca del body ni de la URL.
- Las piezas de la tarjeta de ruta de la tienda (`SELECT_CARD`, `BASE_FROM`, `JOIN_CARD_DATA`, `BASE_CONDITIONS` en `shop.repository`, `toRouteCard` en `shop.service`) se exportan para reutilizarlas.

## Módulos de usuario
| Módulo | Tabla | Endpoints | Acceso |
|---|---|---|---|
| Comentarios | `comments` (ruta ↔ usuario, `rating` 1–5, `content`; único vivo por usuario y ruta: `uq_comments_ruta_user`) | `GET/POST /api/comments/route/:slug`, `PATCH/DELETE /api/comments/:id` | Leer: público. Crear: con sesión. Editar: autor. Borrar: autor, admin o host |
| Wishlist | `wishlists` (N:M usuario ↔ ruta; único vivo: `uq_wishlists_user_ruta`) | `GET /api/wishlist`, `POST/DELETE /api/wishlist/:slug` | Todo con sesión. POST idempotente |

- Solo se comenta o guarda en rutas publicadas (`shopRepository.findRouteBySlug`).
- El detalle `GET /api/shop/routes/:slug` incluye `rating: { count, average }` y `wishlistCount`.
- IA: `GET /api/ia/agent/comments/:slug/summary` resume los comentarios con Groq (`services/comments-summary.service.js`, caché en memoria por ruta).

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
- Guards: `authGuard` (sesión), `adminGuard` (panel), `roleGuard`. Rutas públicas: `/shop`, `/login`, `/register`. `/shop/wishlist` exige sesión.
- Componentes de usuario:
  - `features/shop/components/route-comments`: lista, formulario y botón "Resumir con IA" en el detalle (emite `statsChange`).
  - `shared/components/wishlist-button` (corazón, `variant` `full`/`icon`; sin sesión lleva a `/login?returnUrl`) y `wishlist-link` (corazón con badge en el navbar de la tienda y del panel).
  - `features/shop/pages/shop-wishlist`: página de rutas guardadas (reutiliza `route-shop-card`).
- Wishlist: `WishlistStore` (signals: `items`, `slugs`, `count`) + `WishlistService` (carga al iniciar sesión, vacía al cerrarla, `toggle` optimista).
- Llamadas a la IA con `fetch` en `AgentService` (Groq puede tardar más que `apiTimeoutMs`).
