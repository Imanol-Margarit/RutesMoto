# Postman — Moto Routes API

Guía para probar todos los endpoints. La documentación interactiva también está en
**http://localhost:3000/api/docs** (Swagger).

## Variables

Crea estas variables en Postman (entorno "Moto Routes Local"):

```text
baseUrl     = http://localhost:3000
routeId     = (se rellena con una ruta existente)
routeSlug   = puerto-de-tarna-y-ventana
departureId = (se rellena con una salida existente)
imageId     = (se rellena con una imagen existente)
```

Para obtener los ids, ejecuta antes `GET {{baseUrl}}/api/routes` y copia el `_id` de una ruta.
Los ids cambian cada vez que ejecutas `npm run seed`.

Todas las respuestas tienen esta forma:

```json
{ "success": true, "message": "...", "data": { } }
```

Los errores tienen `success: false`, `message` y `errors` (con `field` y `message` cuando es de validación).

---

## 0. Sistema

### 0.1 Health check
**GET** `{{baseUrl}}/api/health`

Respuesta **200**:
```json
{ "success": true, "message": "API en funcionamiento" }
```

---

## 1. Rutas

Campos de una ruta (la API usa camelCase): `title`, `distanceKm`, `difficulty`, `description`,
`slug`, `surface`, `startPoint`, `estimatedMinutes`, `status`, `isActive`, `hostId`, `categoryId`,
`locationId`, `createdAt`, `updatedAt`, `deletedAt`.

Valores permitidos:
- `difficulty`: `facil`, `media`, `dificil`
- `surface`: `asfalto`, `mixto`, `tierra`
- `status`: `borrador`, `publicada`, `archivada`

### 1.1 Listar todas (no borradas)
**GET** `{{baseUrl}}/api/routes` → **200**

### 1.2 Listar solo activas
**GET** `{{baseUrl}}/api/routes/active` → **200**

### 1.3 Listar solo inactivas
**GET** `{{baseUrl}}/api/routes/inactive` → **200**

### 1.4 Listar la papelera (borradas)
**GET** `{{baseUrl}}/api/routes/deleted` → **200**

### 1.5 Obtener por slug
**GET** `{{baseUrl}}/api/routes/slug/{{routeSlug}}` → **200**

Si no existe: **404** `"Ruta no encontrada"`.

### 1.6 Obtener por id
**GET** `{{baseUrl}}/api/routes/{{routeId}}` → **200**

La respuesta incluye `hostId`, `categoryId` y `locationId` (ids, o `null`).

### 1.7 Crear una ruta
**POST** `{{baseUrl}}/api/routes`

Body (raw → JSON):
```json
{
  "title": "Puerto de Montserrat",
  "distanceKm": 58.5,
  "difficulty": "media",
  "description": "Subida por carreteras de montaña con vistas al monasterio.",
  "surface": "asfalto",
  "startPoint": "Plaza de Espanya, Barcelona",
  "estimatedMinutes": 120
}
```

Respuesta **201**. El slug se genera solo: `puerto-de-montserrat`. Si ya existe, añade `-2`, `-3`...

Errores de validación (**400**), por ejemplo con `"difficulty": "imposible"`:
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    { "field": "difficulty", "message": "La dificultad debe ser: facil, media o dificil" }
  ]
}
```

Campos que no existen (por ejemplo `region`) también dan **400**: "La petición contiene campos no permitidos".

### 1.8 Editar una ruta
**PATCH** `{{baseUrl}}/api/routes/{{routeId}}`

Body con solo los campos que cambian:
```json
{ "distanceKm": 60.0, "estimatedMinutes": 130 }
```

Si cambias `title`, el slug se regenera. Si no lo cambias, se mantiene.
Respuesta **200**. Si la ruta no existe o está borrada: **404**.

### 1.9 Cambiar solo el estado
**PATCH** `{{baseUrl}}/api/routes/{{routeId}}/status`

```json
{ "status": "archivada" }
```

Respuesta **200**. Un valor distinto de los tres permitidos: **400**.

### 1.10 Activar / desactivar
**PATCH** `{{baseUrl}}/api/routes/{{routeId}}/activate`
**PATCH** `{{baseUrl}}/api/routes/{{routeId}}/deactivate`

Sin body. Respuesta **200** con la ruta actualizada (`isActive` true o false).

### 1.11 Borrar (soft delete)
**DELETE** `{{baseUrl}}/api/routes/{{routeId}}` → **200**

La ruta deja de aparecer en `/api/routes` y pasa a `/api/routes/deleted`.

### 1.12 Restaurar desde la papelera
**PATCH** `{{baseUrl}}/api/routes/{{routeId}}/restore` → **200**

Si la ruta no está borrada: **404** `"Ruta eliminada no encontrada"`.

---

## 2. Imágenes de rutas

Campos de una imagen: `imageUrl`, `altText`, `position`, `isCover` (la imagen principal; solo una por ruta).

### 2.1 Listar imágenes de una ruta
**GET** `{{baseUrl}}/api/routes/{{routeId}}/images` → **200**

Ordenadas por `position`.

### 2.2 Añadir una imagen
**POST** `{{baseUrl}}/api/routes/{{routeId}}/images`

```json
{
  "imageUrl": "https://picsum.photos/seed/montserrat/800/600",
  "altText": "Vista del monasterio",
  "position": 1,
  "isCover": false
}
```

Respuesta **201**. Si `isCover` es `true`, la imagen principal anterior deja de serlo.

`imageUrl` debe empezar por `http://` o `https://`. Si no, **400**.

### 2.3 Editar una imagen
**PATCH** `{{baseUrl}}/api/routes/{{routeId}}/images/{{imageId}}`

```json
{ "isCover": true }
```

Respuesta **200**. Imagen que no pertenece a la ruta o no existe: **404** `"Imagen no encontrada"`.

### 2.4 Borrar una imagen
**DELETE** `{{baseUrl}}/api/routes/{{routeId}}/images/{{imageId}}` → **200**

---

## 3. Salidas

Campos de una salida: `routeId`, `slug`, `startDatetime`, `endDatetime`, `capacity`,
`bookedParticipants`, `price`, `status`, `isActive`, `route` (la ruta a la que pertenece).

Valores de `status`: `scheduled`, `full`, `cancelled`, `completed`.

Las fechas van en formato ISO 8601 con zona horaria, por ejemplo `2026-11-14T09:00:00+01:00`.

### 3.1 Listar todas (no borradas)
**GET** `{{baseUrl}}/api/departures` → **200**

### 3.2 Listar solo activas / inactivas / papelera
**GET** `{{baseUrl}}/api/departures/active`
**GET** `{{baseUrl}}/api/departures/inactive`
**GET** `{{baseUrl}}/api/departures/deleted`

### 3.3 Obtener por slug
**GET** `{{baseUrl}}/api/departures/slug/puerto-de-tarna-y-ventana-2026-11-14` → **200**

### 3.4 Obtener por id
**GET** `{{baseUrl}}/api/departures/{{departureId}}` → **200**

La respuesta incluye `route` con `_id`, `title` y `slug` de la ruta.

### 3.5 Crear una salida
**POST** `{{baseUrl}}/api/departures`

```json
{
  "routeId": "{{routeId}}",
  "startDatetime": "2026-12-12T09:00:00+01:00",
  "endDatetime": "2026-12-12T18:00:00+01:00",
  "capacity": 12,
  "bookedParticipants": 0,
  "price": 45
}
```

Respuesta **201**. El slug se genera como `{slug-de-la-ruta}-{fecha}`.

Errores (**400**):
- `endDatetime` anterior a `startDatetime`: "La fecha de fin debe ser posterior a la de inicio".
- `routeId` que no existe: "La ruta indicada no existe".
- `bookedParticipants` mayor que `capacity`: "Las plazas reservadas no pueden superar la capacidad".

### 3.6 Editar una salida
**PATCH** `{{baseUrl}}/api/departures/{{departureId}}`

```json
{ "price": 50, "bookedParticipants": 5 }
```

Respuesta **200**. Si cambias `routeId` o `startDatetime`, el slug se recalcula.

### 3.7 Activar / desactivar
**PATCH** `{{baseUrl}}/api/departures/{{departureId}}/activate`
**PATCH** `{{baseUrl}}/api/departures/{{departureId}}/deactivate`

### 3.8 Borrar y restaurar
**DELETE** `{{baseUrl}}/api/departures/{{departureId}}` → **200**
**PATCH** `{{baseUrl}}/api/departures/{{departureId}}/restore` → **200**

---

## Flujo recomendado de prueba

1. `GET /api/health`
2. `GET /api/routes` → copia un `_id` en `routeId`.
3. `POST /api/routes` → crea una ruta nueva y comprueba que el slug se genera.
4. `PATCH /api/routes/{{routeId}}` → cambia el título y comprueba que cambia el slug.
5. `PATCH /api/routes/{{routeId}}/deactivate` → sale de `/active` y entra en `/inactive`.
6. `POST /api/routes/{{routeId}}/images` → añade una imagen con `isCover: true`.
7. `POST /api/departures` → crea una salida para esa ruta.
8. `DELETE /api/routes/{{routeId}}` → sale de `/api/routes` y aparece en `/deleted`.
9. `PATCH /api/routes/{{routeId}}/restore` → vuelve a `/api/routes`.
