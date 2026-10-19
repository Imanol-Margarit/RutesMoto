# Moto Routes — Frontend (Angular 20)

Panel de administración para la API `moto-routes-api`: rutas, sus imágenes y las salidas programadas.

## Requisitos

- Node.js 20 o superior
- La API en marcha en `http://localhost:3000` (ver el README del backend)

## Arrancar

```bash
npm install
npm start          # http://localhost:4200
```

La URL de la API está en `src/environments/environment.development.ts`.

## Estructura

```
src/app/
├── core/                  Piezas comunes a todo el proyecto
│   ├── interceptors/      request, loading (barra de carga) y error (avisos)
│   ├── models/            Tipos de la API: rutas, salidas, imágenes y respuestas
│   ├── services/          ApiService (HttpClient con Promise), AlertService (SweetAlert2)...
│   └── stores/            Estado de los listados con signals
├── shared/components/     Componentes reutilizables: skeleton, error, empty state
├── layouts/               main-layout y navbar
├── features/
│   ├── routes/            Rutas de moto
│   │   ├── components/    route-form (formulario reactivo), route-images (varias imágenes)
│   │   ├── pages/         routes-list, route-create, route-edit
│   │   └── routes.routes.ts
│   └── departures/        Salidas de una ruta
│       ├── components/    departure-form (formulario reactivo con select de ruta)
│       ├── pages/         departures-list, departure-create, departure-edit
│       └── departures.routes.ts
└── app.routes.ts          Carga diferida (lazy) de cada feature
```

## Convenciones

- **Peticiones**: todas pasan por `ApiService`, que devuelve Promises. Los servicios de cada feature (`RoutesService`, `DeparturesService`, `RouteImagesService`) solo definen los endpoints.
- **Errores**: el `errorInterceptor` muestra un aviso con el mensaje de la API. Las páginas solo capturan el error para no seguir con la acción; por eso los `catch` van vacíos.
- **Estado**: los listados guardan sus datos en un store con signals. Las páginas de crear y editar no usan el store.
- **Carga**: cada listado muestra `app-skeleton-loader` mientras carga, `app-error-state` si falla (con botón para reintentar) y `app-empty-state` si no hay datos.
- **Formularios**: reactive forms. Las reglas replican las del backend (longitudes, rangos y valores permitidos). Los `select` usan listas de opciones definidas en los modelos.
- **Rutas**: las páginas reciben `:id` como `input()` (`withComponentInputBinding`).

## Notas

- La ruta se identifica por `_id` en la URL (`/routes/:id/edit`). El slug cambia al cambiar el título, así que no es estable.
- El formulario de rutas no envía `region`: ese campo ya no existe en el backend.
- Las localizaciones, guías y categorías todavía no tienen endpoints en el backend, así que no se pueden elegir en los formularios.
