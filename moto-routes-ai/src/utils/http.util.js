import { env } from "../config/env.js";

export class HttpError extends Error {
  constructor(status, body) {
    super(`HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

/** fetch con tiempo máximo y JSON en ambos sentidos. Lanza HttpError si la respuesta no es 2xx. */
export async function fetchJson(url, { method = "GET", headers = {}, body } = {}) {
  const response = await fetch(url, {
    method,
    headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(env.httpTimeoutMs),
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) throw new HttpError(response.status, data);
  return data;
}

/** Construye ?a=1&b=2 ignorando valores vacíos. */
export function toQueryString(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}
