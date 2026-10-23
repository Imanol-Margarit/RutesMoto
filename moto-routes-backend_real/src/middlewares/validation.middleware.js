import { AppError } from "../utils/app-error.js";

export function validate(schema, source = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || source,
        message: issue.message
      }));
      return next(new AppError("Error de validación", 400, details));
    }

    req[source] = result.data;
    return next();
  };
}
