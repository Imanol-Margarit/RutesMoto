# Moto Routes — Frontend (Angular 20)

Panel de administración para la API `moto-routes-api`.

## Requisitos

- Node 20+ (ver `.nvmrc`)
- La API corriendo en `http://localhost:3000` (cambia `apiUrl` en `src/environments/`)
- En el `.env` de la API: `CORS_ORIGIN=http://localhost:4200`

## Arrancar

```bash
npm install
npm start        # http://localhost:4200
```

## Estructura

```
src/app/
├── core/              # api.service, interceptores, alertas, modelos, services y stores (signals)
├── shared/components/ # navbar, loader, empty-state, error-state
├── layouts/           # main-layout
└── features/routes/   # listado, crear, editar, detalle + formulario reutilizable
```

## Pantallas

| URL | Qué hace |
|---|---|
| `/routes` | Tabla de rutas. Botón Active/Inactive para activar o desactivar (las inactivas se ven en gris), Edit y Delete (soft delete). |
| `/routes/create` | Crear ruta |
| `/routes/:slug/edit` | Editar ruta, incluido el **Status** (solo se cambia aquí). Si cambias el título, el slug se regenera |
| `/routes/:slug` | Detalle |

## Preparado para auth

Todas las llamadas pasan por `ApiService` y `requestInterceptor`, así que más adelante
basta con añadir el token en esos dos sitios (y un guard en `app.routes.ts`).
