import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import morgan from "morgan";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, "..", "..", "logs");

// Crea la carpeta logs/ si no existe todavía.
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const accessLogStream = fs.createWriteStream(path.join(logsDir, "access.log"), {
  flags: "a" // append: no sobreescribe el log en cada arranque
});

// Log legible en la consola del servidor (formato "dev", con colores/estado).
export const consoleLogger = morgan("dev");

// Log detallado en fichero, formato "combined" (estilo Apache),
// útil para auditoría o depuración posterior.
export const fileLogger = morgan("combined", { stream: accessLogStream });
