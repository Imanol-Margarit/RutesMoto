# Moto Routes AI

Backend del agente de IA de Moto Routes. Es un proyecto **separado** de la API principal:

- **Express 5** (ES Modules), sin base de datos.
- **Groq** como modelo de IA (API compatible con OpenAI, se llama con `fetch`, sin SDK).
- **Open-Meteo** para el clima (gratis, sin registro).
- Los datos de rutas los pide a la **API principal** (`/api/shop`), por HTTP.

```
Angular ──► moto-routes-ai (3001) ──► Groq
                    │
                    ├──► moto-routes-backend (3000) /api/shop
                    └──► Open-Meteo
```

## Requisitos

- Node.js 20 o superior
- La API principal arrancada (`moto-routes-backend` en el puerto 3000)
- Una API key de Groq (gratis)

## Conseguir la API key de Groq

1. Entra en https://console.groq.com y crea una cuenta (Google, GitHub o email). No pide tarjeta.
2. Ve a **API Keys** → **Create API Key**, ponle un nombre (`moto-routes`) y copia la clave.
   Empieza por `gsk_` y **solo se muestra una vez**.
3. Pégala en el `.env` en `GROQ_API_KEY`.

La clave solo vive en este backend. **Nunca** se pone en Angular ni se sube a git (`.env` está en `.gitignore`).

## Instalación

```bash
npm install
cp .env.example .env     # y rellena GROQ_API_KEY
npm run dev
```

El agente arranca en `http://localhost:3001`.

## Variables de entorno

| Variable | Ejemplo | Para qué sirve |
|---|---|---|
| `PORT` | `3001` | Puerto del agente |
| `CORS_ORIGIN` | `http://localhost:4200` | Orígenes permitidos (separados por coma) |
| `GROQ_API_KEY` | `gsk_...` | Clave de Groq |
| `GROQ_MODEL` | `openai/gpt-oss-120b` | Modelo. Alternativa: `llama-3.3-70b-versatile` |
| `GROQ_BASE_URL` | `https://api.groq.com/openai/v1` | URL de la API de Groq |
| `MOTO_ROUTES_API_URL` | `http://localhost:3000/api` | API principal |
| `HTTP_TIMEOUT_MS` | `15000` | Tiempo máximo de cada llamada externa |

## Estructura

```
src/
  agent/
    system-prompt.js       Instrucciones del agente y FAQ
    tools.js               Herramientas que puede usar la IA y su implementación
  clients/
    groq.client.js         Llamada a Groq (/chat/completions)
    moto-routes.client.js  Llamada a la API principal (/shop)
    weather.client.js      Open-Meteo: geocoding y previsión
  config/env.js            Variables de entorno
  controllers/             Reciben la petición y responden
  middlewares/             Validación y errores
  routes/                  Rutas HTTP
  schemas/                 Validación Zod
  services/agent.service.js  Bucle del agente
  utils/                   AppError, respond, fetch con timeout
  app.js / server.js
```

## Cómo funciona el agente

1. El frontend envía el historial de la conversación.
2. Se añade el *system prompt* y se manda a Groq junto con la lista de herramientas.
3. Si Groq pide herramientas (`tool_calls`), se ejecutan y se le devuelve el resultado.
4. Se repite (máximo 5 vueltas) hasta que Groq responde con texto.
5. Se devuelve el texto y las rutas que han aparecido, para que el frontend pinte tarjetas o el mapa.

Herramientas:

| Herramienta | Qué hace | Fuente |
|---|---|---|
| `buscar_rutas` | Busca rutas con filtros (texto, categoría, zona, dificultad, superficie, distancia, precio) | `GET /shop/routes` |
| `detalle_ruta` | Detalle de una ruta y sus próximas salidas | `GET /shop/routes/:slug` |
| `listar_opciones` | Categorías, localizaciones y guías con su slug | `GET /shop/categories`, `/locations`, `/hosts` |
| `consultar_clima` | Previsión diaria (14 días) por coordenadas o ciudad | Open-Meteo |

La FAQ, recomendar y comparar no necesitan herramientas propias: la FAQ está en el system prompt
y para comparar la IA llama varias veces a `detalle_ruta`.

## Endpoints

### GET `/api/health`
```json
{ "success": true, "message": "Agente IA en funcionamiento" }
```

### POST `/api/agent/chat`

Público, sin sesión. Body:
```json
{
  "messages": [
    { "role": "user", "content": "Busco una ruta fácil por menos de 50 €" }
  ]
}
```

Para seguir la conversación se envía todo el historial (máximo 20 mensajes de 2000 caracteres;
el último tiene que ser del usuario):
```json
{
  "messages": [
    { "role": "user", "content": "Busco una ruta fácil por menos de 50 €" },
    { "role": "assistant", "content": "Te recomiendo Valle del Jerte en flor..." },
    { "role": "user", "content": "¿Qué tiempo hará el sábado?" }
  ]
}
```

Respuesta **200**:
```json
{
  "success": true,
  "message": "Respuesta generada",
  "data": {
    "reply": "Te recomiendo Valle del Jerte en flor: 62,8 km, dificultad fácil, desde 40 €...",
    "routes": [
      {
        "title": "Valle del Jerte en flor",
        "slug": "valle-del-jerte-en-flor",
        "difficulty": "facil",
        "distanceKm": 62.8,
        "minPrice": 40,
        "image": { "url": "...", "alt": "..." },
        "location": { "city": "Plasencia", "latitude": 40.031, "longitude": -6.0893 }
      }
    ]
  }
}
```

Errores:

| Código | Cuándo |
|---|---|
| 400 | Body no válido (mensajes vacíos, demasiado largos, último mensaje no es del usuario...) |
| 500 | Falta `GROQ_API_KEY` o no es válida |
| 502 | Groq no responde o falla |
| 503 | Groq ha llegado a su límite gratuito por minuto: esperar unos segundos |
| 504 | Groq ha tardado demasiado |

Si la API principal está apagada, el chat sigue respondiendo, pero dirá que no puede consultar las rutas.

## Probar con Postman

**POST** `http://localhost:3001/api/agent/chat` → Body → raw → JSON, con el ejemplo de arriba.

Preguntas de prueba:
- "¿Qué rutas fáciles hay en Andalucía?"
- "Compárame Sa Calobra con La Alpujarra granadina"
- "¿Qué tiempo hará en Ronda este fin de semana?"
- "¿Qué equipo necesito para una ruta de tierra?"
