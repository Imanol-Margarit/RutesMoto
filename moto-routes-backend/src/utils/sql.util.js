/**
 * Convierte un objeto camelCase de la API en columnas snake_case de la base de datos.
 * columnMap: { camelCase: "snake_case" } definido en cada model.
 */
export function toColumns(columnMap, data) {
  const keys = Object.keys(data);
  return {
    names: keys.map((key) => columnMap[key]),
    values: keys.map((key) => data[key])
  };
}
