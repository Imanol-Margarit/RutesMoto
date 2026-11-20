import http from "node:http";
import https from "node:https";
import { env } from "../config/env.js";

// Cabeceras que no se copian de una conexión a otra (son propias de cada salto).
const HOP_BY_HOP = ["connection", "keep-alive", "proxy-connection", "transfer-encoding", "upgrade", "te", "trailer"];

/**
 * Reenvía la petición tal cual al microservicio (método, cabeceras, cookies y body)
 * y devuelve su respuesta tal cual (estado, cabeceras, Set-Cookie y body).
 * El body no se lee: se pasa en streaming, por eso el gateway NO usa express.json().
 */
export function proxyTo(service) {
  const target = new URL(service.target);
  const client = target.protocol === "https:" ? https : http;

  return (req, res) => {
    // Dentro de app.use(prefix, ...), Express ya ha quitado el prefijo de req.url.
    const path = `${service.targetPrefix}${req.url === "/" ? "" : req.url}`;

    const headers = { ...req.headers, host: target.host };
    HOP_BY_HOP.forEach((name) => delete headers[name]);
    headers["x-forwarded-for"] = [req.headers["x-forwarded-for"], req.socket.remoteAddress].filter(Boolean).join(", ");
    headers["x-forwarded-host"] = req.headers.host;
    headers["x-forwarded-proto"] = req.protocol;

    const upstream = client.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port,
        method: req.method,
        path,
        headers,
        timeout: env.proxyTimeoutMs,
      },
      (upstreamRes) => {
        const responseHeaders = { ...upstreamRes.headers };
        HOP_BY_HOP.forEach((name) => delete responseHeaders[name]);
        // El CORS lo gestiona solo el gateway: se quitan las cabeceras CORS del microservicio.
        Object.keys(responseHeaders)
          .filter((name) => name.startsWith("access-control-"))
          .forEach((name) => delete responseHeaders[name]);

        res.status(upstreamRes.statusCode);
        for (const [name, value] of Object.entries(responseHeaders)) {
          res.setHeader(name, value);
        }
        upstreamRes.pipe(res);
      }
    );

    upstream.on("timeout", () => {
      upstream.destroy(new Error("timeout"));
    });

    upstream.on("error", (error) => {
      if (res.headersSent) {
        res.end();
        return;
      }
      const timedOut = error.message === "timeout";
      console.error(`[gateway] ${service.name} (${req.method} ${path}):`, error.code ?? error.message);
      res.status(timedOut ? 504 : 502).json({
        success: false,
        message: timedOut
          ? `${service.name} ha tardado demasiado en responder`
          : `${service.name} no está disponible`,
        errors: [],
      });
    });

    // Si el navegador cancela la petición, se cancela también la del microservicio.
    res.on("close", () => {
      if (!res.writableFinished) upstream.destroy();
    });

    req.pipe(upstream);
  };
}
