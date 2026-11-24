import { buildSchemas, requiredNumber, requiredText } from "./common.schema.js";

// El usuario y la ruta no llegan en el body: salen de la sesión (req.user) y del slug de la URL.
export const commentSchemas = buildSchemas({
  rating: requiredNumber("La valoración", { min: 1, max: 5, int: true }),
  content: requiredText("El comentario", 1000)
});
