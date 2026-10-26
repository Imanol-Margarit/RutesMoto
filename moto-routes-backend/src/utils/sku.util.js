// SKU de salida: DEPARTURE-<últimos 5 del id de la ruta>-<AAAAMMDD>-<HHMM>-<últimos 5 del id de la salida>
// Se calcula en UTC. El id de la salida se genera antes de guardar, para que el SKU sea único.
export function buildSku(routeId, startDatetime, departureId) {
  const date = new Date(startDatetime);
  const routeCode = routeId.slice(-5).toUpperCase();
  const departureCode = departureId.slice(-5).toUpperCase();
  const dateCode = date.toISOString().slice(0, 10).replace(/-/g, "");
  const timeCode = date.toISOString().slice(11, 16).replace(":", "");
  return `DEPARTURE-${routeCode}-${dateCode}-${timeCode}-${departureCode}`;
}
