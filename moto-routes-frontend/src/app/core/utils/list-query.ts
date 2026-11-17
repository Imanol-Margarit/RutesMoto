import { ParamMap } from '@angular/router';

/** Quita los filtros vacíos antes de pedir el listado o de escribirlos en la URL. */
export function compactParams(values: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value !== '' && value !== null && value !== undefined) out[key] = value;
  }
  return out;
}

/** Lee de la URL solo las claves que el listado admite. */
export function readParams(params: ParamMap, keys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of keys) {
    const value = params.get(key);
    if (value) out[key] = value;
  }
  return out;
}
