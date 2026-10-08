import "dotenv/config";
import { connectDB } from "./config/db.js";
import app from "./app.js";
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`API escuchando en el puerto ${PORT}`)))
  .catch((err) => {
    console.error("Error al conectar con la base de datos:", err);
    process.exit(1);
  });
