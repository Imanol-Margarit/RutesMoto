# Moto Routes Gateway

API Gateway de Moto Routes: el **único punto de entrada** para Angular.
Recibe todas las peticiones en el puerto **4000** y las reenvía al microservicio que toca.

```
                         ┌──► /api/ia/*  ──► Agente IA        (3001)  /api/*
Angular (4200) ──► Gateway (4000)
                         └──► /api/*     ──► API Moto Routes  (3000)  /api/*
```

| Angular llama a | El gateway lo reenvía a |
|---|---|
| `http://localhost:4000/api/ia/agent/chat` | `http://localhost:3001/api/agent/chat` |
| `http://localhost:4000/api/routes?page=2` | `http://localhost:3000/api/routes?page=2` |
| `http://localhost:4000/api/auth/login` | `http://localhost:3000/api/auth/login` |
| `http://localhost:4000/api/docs` | `http://localhost:3000/api/docs` (Swagger) |

## Qué hace

- **Enrutado**: según el prefijo de la URL elige el microservicio (`src/config/services.js`).
- **CORS centralizado**: solo el gateway responde a Angular; quita las cabeceras CORS de los microservicios.
- **Cookies**: reenvía la cookie `access_token` al backend y devuelve los `Set-Cookie` al navegador, así el login sigue funcionando.
- **Errores**: si un microservicio está apagado responde **502**, y si tarda demasiado **504**, con el mismo formato `{ success, message, errors }`.
- **Logs**: cada petición se muestra en consola (morgan).
- **Health check**: `GET /gateway/health` comprueba si responden los dos microservicios.

El agente IA sigue llamando a la API principal directamente (`http://localhost:3000/api`):
es una llamada interna entre microservicios y no necesita pasar por el gateway.

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

Orden de arranque: Docker (PostgreSQL) → `moto-routes-backend` → `moto-routes-ai` → `moto-routes-gateway` → Angular.

## Variables de entorno

| Variable | Ejemplo | Para qué sirve |
|---|---|---|
| `PORT` | `4000` | Puerto del gateway |
| `CORS_ORIGIN` | `http://localhost:4200` | Orígenes permitidos (separados por coma) |
| `API_SERVICE_URL` | `http://localhost:3000` | API principal |
| `AI_SERVICE_URL` | `http://localhost:3001` | Agente IA |
| `PROXY_TIMEOUT_MS` | `60000` | Espera máxima por petición |

## Estructura

```
src/
  config/
    env.js                 Variables de entorno
    services.js            Tabla de enrutado: prefijo -> microservicio
  middlewares/
    proxy.middleware.js    Reenvía la petición y devuelve la respuesta
    error.middleware.js    404 y errores
  routes/
    health.routes.js       GET /gateway/health
  app.js                   CORS, logs, health y un proxy por servicio
  server.js                Arranque
```

El proxy está hecho con el módulo `http` de Node, sin librerías: el body se reenvía en streaming,
por eso el gateway **no** usa `express.json()`.

## Añadir otro microservicio

Una entrada más en `src/config/services.js`, antes de la de `/api`:

```js
{ name: "Pagos", prefix: "/api/pagos", target: "http://localhost:3002", targetPrefix: "/api", healthPath: "/api/health" },
```

## Probar

- `GET http://localhost:4000/gateway/health` → estado de los dos servicios.
- `GET http://localhost:4000/api/shop/routes` → rutas de la tienda (vía gateway).
- `POST http://localhost:4000/api/ia/agent/chat` con `{ "messages": [{ "role": "user", "content": "hola" }] }`.
- Apaga `moto-routes-ai` y repite el POST → **502** "Agente IA no está disponible".
