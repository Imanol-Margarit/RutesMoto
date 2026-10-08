# Postman — Moto Routes API

Colección/documentación para probar los endpoints de la API.

## Variables

Usa estas variables en Postman:

```text
baseUrl = http://localhost:3000
routeId = reemplazar_por_un_uuid
```

---
## 1. Health check

**GET**

```text
{{baseUrl}}/api/health
```

### Respuesta esperada

```json
{
  "success": true,
  "message": "API en funcionamiento"
}
```

---
## 2. Listar routes

**GET**

```text
{{baseUrl}}/api/routes
```

### Respuesta esperada

```json
[
  {
    "_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Puerto de la Bonaigua en moto",
    "region": "Lleida",
    "distanceKm": 78.5,
    "difficulty": "media",
    "description": "Curvas de montaña con vistas al Pirineo catalán.",
    "slug": "puerto-de-la-bonaigua-en-moto",
    "status": "publicada",
    "isActive": true,
    "createdAt": "2026-09-16T09:00:00.000Z",
    "updatedAt": "2026-09-16T09:00:00.000Z",
    "deletedAt": null
  }
]
```

---
## 2b. Listar solo activas / solo inactivas

**GET**

```text
{{baseUrl}}/api/routes/active
{{baseUrl}}/api/routes/inactive
```

Misma forma de respuesta que el listado normal, filtrando por `isActive`.
`GET /api/routes` sigue devolviendo todas (activas e inactivas). Ninguna incluye rutas
borradas (soft delete).

---
## 2c. Listar las borradas (soft delete)

**GET**

```text
{{baseUrl}}/api/routes/deleted
```

Devuelve solo las rutas con `deletedAt` distinto de `null`, la más recientemente borrada
primero. Úsalo para elegir cuál restaurar con `PATCH /api/routes/{{routeId}}/restore`.
`GET /api/routes` no las incluye.

---
## 3. Obtener una route

**GET**

```text
{{baseUrl}}/api/routes/{{routeId}}
```

> Sustituye `routeId` por el `_id` obtenido al crear una route o al listar.

---
## 4. Crear una route

**POST**

```text
{{baseUrl}}/api/routes
```

### Headers

```text
Content-Type: application/json
```

### Body → raw → JSON

```json
{
  "title": "Puerto de la Bonaigua en moto",
  "region": "Lleida",
  "distanceKm": 78.5,
  "difficulty": "media",
  "description": "Curvas de montaña con vistas al Pirineo catalán, firme en buen estado."
}
```

### Respuesta esperada

**201 Created**

El campo `_id` será un UUID generado por la aplicación.

---
## 5. Actualizar una route

**PATCH**

```text
{{baseUrl}}/api/routes/{{routeId}}
```

### Headers

```text
Content-Type: application/json
```

### Body

Puedes actualizar solo los campos que necesites:

```json
{
  "distanceKm": 80,
  "difficulty": "dificil"
}
```

---
## 5b. Activar / desactivar una route

**PATCH**

```text
{{baseUrl}}/api/routes/{{routeId}}/deactivate
{{baseUrl}}/api/routes/{{routeId}}/activate
```

Sin body. Devuelven **200 OK** con la ruta completa y `"isActive": false` / `true`.
Si el `id` no existe o la ruta está borrada → **404 Not Found**.

---
## 5c. Cambiar el status

**PATCH**

```text
{{baseUrl}}/api/routes/{{routeId}}/status
```

### Body → raw → JSON

```json
{
  "status": "archivada"
}
```

Valores permitidos: `borrador`, `publicada`, `archivada`. Cualquier otro valor o campo
extra devuelve **400 Bad Request**.

---
## 6. Eliminar una route

**DELETE**

```text
{{baseUrl}}/api/routes/{{routeId}}
```

### Respuesta esperada

**200 OK**, con `"message": "Ruta eliminada correctamente"`.

---
## 7. Restaurar una route borrada

**PATCH**

```text
{{baseUrl}}/api/routes/{{routeId}}/restore
```

> `DELETE` hace soft delete (pone `deletedAt`). Este endpoint deshace eso: pone
> `deletedAt` a `null` de nuevo. Debe usarse con el `id` de una ruta ya borrada.

### Respuesta esperada

**200 OK**, con la ruta completa y `"deletedAt": null`.

---
# Pruebas de errores

## ID inválido

**GET**

```text
{{baseUrl}}/api/routes/123
```

### Respuesta esperada

**400 Bad Request**

```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    { "field": "id", "message": "El id debe ser un UUID válido" }
  ]
}
```

## Route inexistente

Usa un UUID válido que no exista:

```text
{{baseUrl}}/api/routes/550e8400-e29b-41d4-a716-446655440099
```

### Respuesta esperada

**404 Not Found**

```json
{
  "success": false,
  "message": "Ruta no encontrada",
  "errors": []
}
```

## Crear sin campos obligatorios

**POST**

```text
{{baseUrl}}/api/routes
```

Body:

```json
{
  "description": "Route sin title, region ni distanceKm"
}
```

La API devuelve **400 Bad Request** porque `title`, `region`, `distanceKm` y `difficulty`
son obligatorios.

## Difficulty inválida

**POST**

```text
{{baseUrl}}/api/routes
```

Body:

```json
{
  "title": "Ruta de prueba",
  "region": "Valencia",
  "distanceKm": 30,
  "difficulty": "imposible"
}
```

### Respuesta esperada

**400 Bad Request**

```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    { "field": "difficulty", "message": "La dificultad debe ser: facil, media o dificil" }
  ]
}
```

---
# Flujo recomendado de prueba

1. `GET /api/health`
2. `POST /api/routes`
3. Copiar el `_id` de la respuesta a `routeId`
4. `GET /api/routes/{{routeId}}`
5. `GET /api/routes`
6. `PATCH /api/routes/{{routeId}}`
7. `DELETE /api/routes/{{routeId}}`
8. Volver a hacer `GET` para comprobar que devuelve `404`

## Configuración previa

Levanta el Postgres de este proyecto con Docker (puerto 5433, ver README.md):

```bash
docker compose up -d
```

Después:

```bash
npm install
cp .env.example .env
npm run dev
```

Por defecto la API estará disponible en:

```text
http://localhost:3000
```
