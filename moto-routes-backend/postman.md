# Postman — Moto Routes API

Guía para probar todos los endpoints. La documentación interactiva está en
**http://localhost:3000/api/docs** (Swagger).

## Variables del entorno

Crea un entorno en Postman ("Moto Routes Local") con estas variables:

| Variable | Valor de ejemplo | Cómo se obtiene |
|---|---|---|
| `baseUrl` | `http://localhost:3000` | Fija |
| `routeId` | `{id de una ruta}` | `GET {{baseUrl}}/api/routes` |
| `hostId` | `{id de un guía}` | `GET {{baseUrl}}/api/hosts` |
| `categoryId` | `{id de una categoría}` | `GET {{baseUrl}}/api/categories` |
| `locationId` | `{id de una localización}` | `GET {{baseUrl}}/api/locations` |
| `userId` | `{id de un usuario}` | `GET {{baseUrl}}/api/users` |
| `roleId` | `{id de un rol}` | `GET {{baseUrl}}/api/roles/active` |
| `departureId` | `{id de una salida}` | `GET {{baseUrl}}/api/departures` |
| `imageId` | `{id de una imagen}` | `GET {{baseUrl}}/api/routes/{{routeId}}/images` |
| `sku` | `DEPARTURE-...` | Campo `sku` de una salida |
| `slug` | `puerto-de-tarna-y-ventana` | Campo `slug` de una ruta |

Los ids cambian cada vez que ejecutas `npm run seed`. Copia los nuevos después de sembrar.

## Formato de las respuestas

Éxito:
```json
{ "success": true, "message": "Ruta creada correctamente", "data": { } }
```

Error:
```json
{ "success": false, "message": "Error de validación", "errors": [ { "field": "difficulty", "message": "..." } ] }
```

Códigos que verás:
- **200** lectura, edición, activar, desactivar, restaurar o borrar.
- **201** creación.
- **400** validación, id con formato incorrecto o referencia que no existe.
- **404** el recurso no existe o está borrado.
- **409** la operación se bloquea por integridad referencial (ver sección 0).
- **500** error interno: si lo ves, revisa la consola del backend.

---

## 0. Integridad referencial (qué bloquea qué)

Estas reglas se comprueban en los services. Desactivar o borrar un padre con hijos responde 409.

| Al desactivar o borrar... | Se bloquea si... | Mensaje |
|---|---|---|
| Ruta | tiene salidas que no están canceladas y aún no han terminado | "No puedes desactivar ni borrar una ruta con salidas que aún no han terminado" |
| Guía | tiene rutas no borradas | "No puedes desactivar ni borrar una guía con rutas asociadas" |
| Categoría | tiene rutas no borradas | "No puedes desactivar ni borrar una categoría con rutas asociadas" |
| Localización | tiene rutas no borradas | "No puedes desactivar ni borrar una localización con rutas asociadas" |
| Usuario | es guía | "No puedes desactivar ni borrar un usuario que es guía" |
| Rol | tiene usuarios no borrados | "No puedes desactivar ni borrar un rol con usuarios asignados" |

Al crear o editar un hijo, el padre debe existir y no estar borrado. Si no, responde 400.

---

## 1. Sistema

### 1.1 Health check
**GET** `{{baseUrl}}/api/health` → **200**
```json
{ "success": true, "message": "API en funcionamiento" }
```

---

## 2. Rutas

Campos: `title`, `distanceKm`, `difficulty` (`facil`, `media`, `dificil`), `description`, `surface` (`asfalto`, `mixto`, `tierra`), `startPoint`, `estimatedMinutes`, `status` (`borrador`, `publicada`, `archivada`), `isActive`, `hostId`, `categoryId`, `locationId`.

### 2.1 Listar todas (no borradas)
**GET** `{{baseUrl}}/api/routes` → **200**

### 2.2 Listar activas / inactivas / papelera
**GET** `{{baseUrl}}/api/routes/active`
**GET** `{{baseUrl}}/api/routes/inactive`
**GET** `{{baseUrl}}/api/routes/deleted`

### 2.3 Obtener por slug
**GET** `{{baseUrl}}/api/routes/slug/{{slug}}` → **200**

### 2.4 Obtener por id
**GET** `{{baseUrl}}/api/routes/{{routeId}}` → **200**

### 2.5 Crear
**POST** `{{baseUrl}}/api/routes`
```json
{
  "title": "Puerto de Montserrat",
  "distanceKm": 58.5,
  "difficulty": "media",
  "description": "Subida por carreteras de montaña con vistas al monasterio.",
  "surface": "asfalto",
  "startPoint": "Plaza de Espanya, Barcelona",
  "estimatedMinutes": 120,
  "hostId": "{{hostId}}",
  "categoryId": "{{categoryId}}",
  "locationId": "{{locationId}}"
}
```
→ **201**. El slug se genera solo (`puerto-de-montserrat`). Si ya existe, añade `-2`, `-3`...

Prueba de error: `"hostId": "00000000-0000-4000-8000-000000000000"` → **400** "El guía indicado no existe o está borrado".

### 2.6 Editar
**PATCH** `{{baseUrl}}/api/routes/{{routeId}}`
```json
{ "distanceKm": 60.0, "estimatedMinutes": 130 }
```
→ **200**. Si cambias `title`, el slug se regenera. Si envías `"isActive": false`, se aplica la misma comprobación que en el botón de desactivar (409 si tiene salidas abiertas).

Prueba de error: `"region": "Asturias"` → **400** "La petición contiene campos no permitidos".

### 2.7 Cambiar solo el estado
**PATCH** `{{baseUrl}}/api/routes/{{routeId}}/status`
```json
{ "status": "archivada" }
```
→ **200**. Un valor fuera de `borrador`, `publicada`, `archivada` → **400**.

### 2.8 Activar / desactivar
**PATCH** `{{baseUrl}}/api/routes/{{routeId}}/activate`
**PATCH** `{{baseUrl}}/api/routes/{{routeId}}/deactivate` → **200** o **409** (ver sección 0).

### 2.9 Borrar y restaurar
**DELETE** `{{baseUrl}}/api/routes/{{routeId}}` → **200** o **409**.
**PATCH** `{{baseUrl}}/api/routes/{{routeId}}/restore` → **200**.

---

## 3. Imágenes de rutas

Campos: `imageUrl` (obligatoria, `http://` o `https://`), `altText`, `position`, `isCover` (solo una principal por entidad).

El mismo patrón sirve para **guías**, **categorías**, **localizaciones** y **usuarios**. Solo cambia la ruta base (`hosts`, `categories`, `locations`, `users`) y el id (`hostId`, `categoryId`, `locationId`, `userId`).

### 3.1 Listar
**GET** `{{baseUrl}}/api/routes/{{routeId}}/images` → **200**, ordenadas por `position`.

### 3.2 Añadir
**POST** `{{baseUrl}}/api/routes/{{routeId}}/images`
```json
{
  "imageUrl": "https://picsum.photos/seed/montserrat/800/600",
  "altText": "Vista del monasterio",
  "position": 1,
  "isCover": false
}
```
→ **201**. Si `isCover` es `true`, la principal anterior deja de serlo.

Prueba de error: `"imageUrl": "ftp://ejemplo.com/foto.jpg"` → **400**.

### 3.3 Editar
**PATCH** `{{baseUrl}}/api/routes/{{routeId}}/images/{{imageId}}`
```json
{ "isCover": true }
```
→ **200**. Imagen de otra entidad o inexistente → **404** "Imagen no encontrada".

### 3.4 Borrar
**DELETE** `{{baseUrl}}/api/routes/{{routeId}}/images/{{imageId}}` → **200**.

---

## 4. Salidas

Campos: `routeId`, `startDatetime`, `endDatetime` (ISO 8601 con zona, p. ej. `2026-11-14T09:00:00+01:00`), `capacity`, `bookedParticipants`, `price`, `status` (`scheduled`, `full`, `cancelled`, `completed`), `isActive`.

El `sku` lo genera el servidor y no se envía: tiene la forma `DEPARTURE-<ruta>-<AAAAMMDD>-<HHMM>-<salida>` (UTC).

### 4.1 Listar
**GET** `{{baseUrl}}/api/departures` → **200** (ordenadas por fecha de inicio).
**GET** `{{baseUrl}}/api/departures/active`
**GET** `{{baseUrl}}/api/departures/inactive`
**GET** `{{baseUrl}}/api/departures/deleted`

### 4.2 Obtener
**GET** `{{baseUrl}}/api/departures/{{departureId}}` → **200**
**GET** `{{baseUrl}}/api/departures/sku/{{sku}}` → **200**
**GET** `{{baseUrl}}/api/departures/slug/{{slug}}` → **200**

### 4.3 Crear
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
→ **201** con `sku` y `slug` generados.

Errores (**400**):
- `endDatetime` anterior a `startDatetime`: "La fecha de fin debe ser posterior a la de inicio".
- `bookedParticipants` mayor que `capacity`: "Las plazas reservadas no pueden superar la capacidad".
- `routeId` inexistente: "La ruta indicada no existe".

### 4.4 Editar
**PATCH** `{{baseUrl}}/api/departures/{{departureId}}`
```json
{ "price": 50, "bookedParticipants": 5 }
```
→ **200**. El `sku` no cambia al editar.

### 4.5 Cambiar solo el estado
**PATCH** `{{baseUrl}}/api/departures/{{departureId}}/status`
```json
{ "status": "cancelled" }
```
→ **200**. Un valor no permitido → **400**. Al cancelar una salida, la ruta deja de estar bloqueada.

### 4.6 Activar / desactivar, borrar y restaurar
**PATCH** `{{baseUrl}}/api/departures/{{departureId}}/activate`
**PATCH** `{{baseUrl}}/api/departures/{{departureId}}/deactivate`
**DELETE** `{{baseUrl}}/api/departures/{{departureId}}`
**PATCH** `{{baseUrl}}/api/departures/{{departureId}}/restore`

---

## 5. Guías

Campos: `name` (obligatorio, máx. 100), `biography` (máx. 1000), `userId` (opcional, debe existir), `status` (`active`, `inactive`, `suspended`), `isActive`.

### 5.1 Listar
**GET** `{{baseUrl}}/api/hosts` → **200**
**GET** `{{baseUrl}}/api/hosts/active`, `/inactive`, `/deleted`

### 5.2 Obtener
**GET** `{{baseUrl}}/api/hosts/{{hostId}}` → **200**
**GET** `{{baseUrl}}/api/hosts/slug/lucia-ruta-norte` → **200**

### 5.3 Crear
**POST** `{{baseUrl}}/api/hosts`
```json
{
  "name": "Ana Motoviaje",
  "biography": "Organiza salidas por la sierra de Madrid.",
  "status": "active",
  "isActive": true
}
```
→ **201**. El slug sale del nombre.

### 5.4 Editar
**PATCH** `{{baseUrl}}/api/hosts/{{hostId}}`
```json
{ "biography": "Nueva biografía" }
```
→ **200**. Si envías `"isActive": false`, puede responder **409** si tiene rutas.

### 5.5 Cambiar estado
**PATCH** `{{baseUrl}}/api/hosts/{{hostId}}/status`
```json
{ "status": "suspended" }
```

### 5.6 Activar, desactivar, borrar y restaurar
**PATCH** `{{baseUrl}}/api/hosts/{{hostId}}/activate` → **200**
**PATCH** `{{baseUrl}}/api/hosts/{{hostId}}/deactivate` → **200** o **409**
**DELETE** `{{baseUrl}}/api/hosts/{{hostId}}` → **200** o **409**
**PATCH** `{{baseUrl}}/api/hosts/{{hostId}}/restore` → **200**

### 5.7 Imágenes de una guía
**GET** / **POST** `{{baseUrl}}/api/hosts/{{hostId}}/images`
**PATCH** / **DELETE** `{{baseUrl}}/api/hosts/{{hostId}}/images/{{imageId}}`
Mismo formato que la sección 3.

---

## 6. Categorías

Campos: `name` (obligatorio, máx. 60), `description` (máx. 500), `isActive`. No tienen estado.

### 6.1 Listar
**GET** `{{baseUrl}}/api/categories` → **200**
**GET** `{{baseUrl}}/api/categories/active`, `/inactive`, `/deleted`

### 6.2 Obtener
**GET** `{{baseUrl}}/api/categories/{{categoryId}}` → **200**
**GET** `{{baseUrl}}/api/categories/slug/curvas` → **200**

### 6.3 Crear
**POST** `{{baseUrl}}/api/categories`
```json
{ "name": "Aventura", "description": "Pistas y tramos de tierra" }
```
→ **201**. Nombre duplicado → **409** (restricción de la base de datos).

### 6.4 Editar
**PATCH** `{{baseUrl}}/api/categories/{{categoryId}}`
```json
{ "description": "Nueva descripción" }
```

### 6.5 Activar, desactivar, borrar y restaurar
**PATCH** `{{baseUrl}}/api/categories/{{categoryId}}/activate` → **200**
**PATCH** `{{baseUrl}}/api/categories/{{categoryId}}/deactivate` → **200** o **409**
**DELETE** `{{baseUrl}}/api/categories/{{categoryId}}` → **200** o **409**
**PATCH** `{{baseUrl}}/api/categories/{{categoryId}}/restore` → **200**

### 6.6 Imágenes de una categoría
**GET** / **POST** `{{baseUrl}}/api/categories/{{categoryId}}/images`
**PATCH** / **DELETE** `{{baseUrl}}/api/categories/{{categoryId}}/images/{{imageId}}`

---

## 7. Localizaciones

Campos: `city` (obligatorio, máx. 100), `region`, `country` (obligatorio), `address`, `postalCode`, `latitude` (-90 a 90), `longitude` (-180 a 180), `status` (`active`, `inactive`), `isActive`.

### 7.1 Listar
**GET** `{{baseUrl}}/api/locations` → **200**
**GET** `{{baseUrl}}/api/locations/active`, `/inactive`, `/deleted`

### 7.2 Obtener
**GET** `{{baseUrl}}/api/locations/{{locationId}}` → **200**
**GET** `{{baseUrl}}/api/locations/slug/oviedo-espana` → **200**

### 7.3 Crear
**POST** `{{baseUrl}}/api/locations`
```json
{
  "city": "Gijón",
  "region": "Asturias",
  "country": "España",
  "address": "Plaza Mayor, 1",
  "postalCode": "33201",
  "latitude": 43.5322,
  "longitude": -5.6611
}
```
→ **201**. Latitud fuera de rango → **400**.

### 7.4 Editar, estado, activar y desactivar
**PATCH** `{{baseUrl}}/api/locations/{{locationId}}` → **200**
**PATCH** `{{baseUrl}}/api/locations/{{locationId}}/status`
```json
{ "status": "inactive" }
```
**PATCH** `{{baseUrl}}/api/locations/{{locationId}}/activate` → **200**
**PATCH** `{{baseUrl}}/api/locations/{{locationId}}/deactivate` → **200** o **409**

### 7.5 Borrar y restaurar
**DELETE** `{{baseUrl}}/api/locations/{{locationId}}` → **200** o **409**
**PATCH** `{{baseUrl}}/api/locations/{{locationId}}/restore` → **200**

### 7.6 Imágenes de una localización
**GET** / **POST** `{{baseUrl}}/api/locations/{{locationId}}/images`
**PATCH** / **DELETE** `{{baseUrl}}/api/locations/{{locationId}}/images/{{imageId}}`

---

## 8. Roles

Campos: `name` (obligatorio, máx. 50, único), `description`, `isActive`.

### 8.1 Listar
**GET** `{{baseUrl}}/api/roles` → **200**
**GET** `{{baseUrl}}/api/roles/active` → **200** (lo usa el formulario de usuarios)
**GET** `{{baseUrl}}/api/roles/inactive`, `/deleted`

### 8.2 Obtener
**GET** `{{baseUrl}}/api/roles/{{roleId}}` → **200**
**GET** `{{baseUrl}}/api/roles/slug/host` → **200**

### 8.3 Crear, editar, activar, desactivar, borrar y restaurar
**POST** `{{baseUrl}}/api/roles`
```json
{ "name": "moderador", "description": "Revisa el contenido" }
```
→ **201**. Nombre duplicado → **409**.

**PATCH** `{{baseUrl}}/api/roles/{{roleId}}` → **200**
**PATCH** `{{baseUrl}}/api/roles/{{roleId}}/activate` → **200**
**PATCH** `{{baseUrl}}/api/roles/{{roleId}}/deactivate` → **200** o **409**
**DELETE** `{{baseUrl}}/api/roles/{{roleId}}` → **200** o **409**
**PATCH** `{{baseUrl}}/api/roles/{{roleId}}/restore` → **200**

---

## 9. Usuarios

Campos: `roleId` (obligatorio, debe existir), `firstName` (obligatorio, máx. 100), `lastName` (obligatorio, máx. 150), `email` (obligatorio, único), `password` (obligatoria al crear, mínimo 8; opcional al editar), `avatarUrl` (opcional), `isActive`.

La respuesta **nunca** incluye la contraseña.

### 9.1 Listar
**GET** `{{baseUrl}}/api/users` → **200**
**GET** `{{baseUrl}}/api/users/active`, `/inactive`, `/deleted`

### 9.2 Obtener
**GET** `{{baseUrl}}/api/users/{{userId}}` → **200**

### 9.3 Crear
**POST** `{{baseUrl}}/api/users`
```json
{
  "roleId": "{{roleId}}",
  "firstName": "Laura",
  "lastName": "Ruta",
  "email": "laura@motoroutes.local",
  "password": "contraseña123",
  "avatarUrl": "https://picsum.photos/seed/laura/200/200"
}
```
→ **201**.

Errores de validación:
- Sin `password`: **400** "La contraseña es obligatoria".
- `password` de menos de 8 caracteres: **400**.
- Email repetido: **409**.
- `roleId` que no existe: **400** "El rol indicado no existe o está borrado".

### 9.4 Editar
**PATCH** `{{baseUrl}}/api/users/{{userId}}`
```json
{ "firstName": "Laura María" }
```
→ **200**. Sin `password` no cambia la contraseña. Con `"isActive": false` puede responder **409** si es guía.

### 9.5 Activar, desactivar, borrar y restaurar
**PATCH** `{{baseUrl}}/api/users/{{userId}}/activate` → **200**
**PATCH** `{{baseUrl}}/api/users/{{userId}}/deactivate` → **200** o **409**
**DELETE** `{{baseUrl}}/api/users/{{userId}}` → **200** o **409**
**PATCH** `{{baseUrl}}/api/users/{{userId}}/restore` → **200**

### 9.6 Imágenes de un usuario
**GET** / **POST** `{{baseUrl}}/api/users/{{userId}}/images`
**PATCH** / **DELETE** `{{baseUrl}}/api/users/{{userId}}/images/{{imageId}}`

---

## 10. Flujo recomendado de prueba

1. `GET /api/health`.
2. Sembrar: `npm run seed`. Copia `routeId`, `hostId`, `categoryId`, `locationId`, `roleId`, `userId` y `departureId`.
3. **Rutas**: crea una ruta con `hostId`, `categoryId` y `locationId`. Comprueba que el slug se genera.
4. **Integridad**:
   - Intenta desactivar el guía de Lucía (tiene rutas): **409**.
   - Intenta desactivar una ruta con una salida futura: **409**.
   - Cancela la salida (`PATCH .../status` con `cancelled`) y desactiva la ruta: **200**.
5. **Imágenes**: añade dos imágenes a una ruta, marca la segunda como principal y comprueba que la primera deja de serlo.
6. **Usuarios**: crea uno con contraseña de 8 caracteres o más y comprueba que la respuesta no incluye `passwordHash`.
7. **Papelera**: borra una categoría sin rutas, consulta `/api/categories/deleted` y restáurala.
