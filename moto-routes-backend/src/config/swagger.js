import swaggerJsdoc from "swagger-jsdoc";

const definition = {
  openapi: "3.0.3",
  info: {
    title: "Moto Routes API",
    version: "1.0.0",
    description: "API de rutas de moto, salidas y sus imágenes. Las respuestas tienen success, message y data (o errors si hay fallos)."
  },
  servers: [{ url: "http://localhost:3000", description: "Desarrollo" }],
  tags: [
    { name: "Sistema", description: "Estado de la API" },
    { name: "Rutas", description: "Rutas de moto" },
    { name: "Imágenes de rutas", description: "Imágenes asociadas a una ruta" },
    { name: "Salidas", description: "Salidas programadas de una ruta" },
    { name: "Guías", description: "Guías que organizan las rutas" },
    { name: "Categorías", description: "Tipos de ruta: curvas, paisaje, off-road..." },
    { name: "Localizaciones", description: "Ciudad, región y país de cada ruta" },
    { name: "Usuarios", description: "Cuentas de usuario, con rol y contraseña" },
    { name: "Roles", description: "Roles de usuario" }
  ],
  components: {
    schemas: {
      Route: {
        type: "object",
        properties: {
          _id: { type: "string", format: "uuid" },
          title: { type: "string", maxLength: 120, example: "Puerto de Tarna y Ventana" },
          distanceKm: { type: "number", example: 112.4 },
          difficulty: { type: "string", enum: ["facil", "media", "dificil"] },
          description: { type: "string", nullable: true, maxLength: 500 },
          slug: { type: "string", example: "puerto-de-tarna-y-ventana" },
          surface: { type: "string", enum: ["asfalto", "mixto", "tierra"] },
          startPoint: { type: "string", nullable: true, maxLength: 200 },
          estimatedMinutes: { type: "integer", nullable: true, example: 150 },
          status: { type: "string", enum: ["borrador", "publicada", "archivada"] },
          isActive: { type: "boolean" },
          hostId: { type: "string", format: "uuid", nullable: true },
          categoryId: { type: "string", format: "uuid", nullable: true },
          locationId: { type: "string", format: "uuid", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          deletedAt: { type: "string", format: "date-time", nullable: true }
        }
      },
      RouteInput: {
        type: "object",
        required: ["title", "distanceKm", "difficulty"],
        additionalProperties: false,
        properties: {
          title: { type: "string", maxLength: 120 },
          distanceKm: { type: "number", minimum: 0, maximum: 9999.99 },
          difficulty: { type: "string", enum: ["facil", "media", "dificil"] },
          description: { type: "string", nullable: true, maxLength: 500 },
          surface: { type: "string", enum: ["asfalto", "mixto", "tierra"] },
          startPoint: { type: "string", nullable: true, maxLength: 200 },
          estimatedMinutes: { type: "integer", nullable: true, minimum: 1 },
          status: { type: "string", enum: ["borrador", "publicada", "archivada"] },
          isActive: { type: "boolean" },
          hostId: { type: "string", format: "uuid", nullable: true },
          categoryId: { type: "string", format: "uuid", nullable: true },
          locationId: { type: "string", format: "uuid", nullable: true }
        }
      },
      RouteStatusInput: {
        type: "object",
        required: ["status"],
        additionalProperties: false,
        properties: {
          status: { type: "string", enum: ["borrador", "publicada", "archivada"] }
        }
      },
      Departure: {
        type: "object",
        properties: {
          _id: { type: "string", format: "uuid" },
          routeId: { type: "string", format: "uuid" },
          slug: { type: "string", example: "puerto-de-tarna-y-ventana-2026-11-14" },
          startDatetime: { type: "string", format: "date-time" },
          endDatetime: { type: "string", format: "date-time" },
          capacity: { type: "integer", example: 12 },
          bookedParticipants: { type: "integer", example: 3 },
          price: { type: "number", example: 45 },
          status: { type: "string", enum: ["scheduled", "full", "cancelled", "completed"] },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          deletedAt: { type: "string", format: "date-time", nullable: true },
          route: {
            type: "object",
            nullable: true,
            description: "Ruta a la que pertenece la salida",
            properties: {
              _id: { type: "string", format: "uuid" },
              title: { type: "string" },
              slug: { type: "string" }
            }
          }
        }
      },
      DepartureInput: {
        type: "object",
        required: ["routeId", "startDatetime", "endDatetime", "capacity"],
        additionalProperties: false,
        properties: {
          routeId: { type: "string", format: "uuid" },
          startDatetime: { type: "string", format: "date-time", example: "2026-11-14T09:00:00+01:00" },
          endDatetime: { type: "string", format: "date-time", example: "2026-11-14T18:00:00+01:00" },
          capacity: { type: "integer", minimum: 1 },
          bookedParticipants: { type: "integer", minimum: 0 },
          price: { type: "number", minimum: 0, maximum: 999999.99 },
          status: { type: "string", enum: ["scheduled", "full", "cancelled", "completed"] },
          isActive: { type: "boolean" }
        }
      },
      RouteImage: {
        type: "object",
        properties: {
          _id: { type: "string", format: "uuid" },
          routeId: { type: "string", format: "uuid" },
          imageUrl: { type: "string", format: "uri" },
          altText: { type: "string", nullable: true },
          position: { type: "integer", example: 0 },
          isCover: { type: "boolean", description: "Imagen principal de la ruta (solo una)" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      RouteImageInput: {
        type: "object",
        required: ["imageUrl"],
        additionalProperties: false,
        properties: {
          imageUrl: { type: "string", format: "uri", maxLength: 500 },
          altText: { type: "string", nullable: true, maxLength: 200 },
          position: { type: "integer", minimum: 0 },
          isCover: { type: "boolean" }
        }
      },
      RouteImageUpdate: {
        type: "object",
        additionalProperties: false,
        description: "Al menos un campo",
        properties: {
          imageUrl: { type: "string", format: "uri", maxLength: 500 },
          altText: { type: "string", nullable: true, maxLength: 200 },
          position: { type: "integer", minimum: 0 },
          isCover: { type: "boolean" }
        }
      },
      Host: {
        type: "object",
        properties: {
          _id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid", nullable: true },
          name: { type: "string", maxLength: 100, example: "Lucía Ruta Norte" },
          slug: { type: "string", example: "lucia-ruta-norte" },
          biography: { type: "string", nullable: true, maxLength: 1000 },
          status: { type: "string", enum: ["active", "inactive", "suspended"] },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          deletedAt: { type: "string", format: "date-time", nullable: true }
        }
      },
      HostInput: {
        type: "object",
        required: ["name"],
        additionalProperties: false,
        properties: {
          userId: { type: "string", format: "uuid", nullable: true },
          name: { type: "string", maxLength: 100 },
          biography: { type: "string", nullable: true, maxLength: 1000 },
          status: { type: "string", enum: ["active", "inactive", "suspended"] },
          isActive: { type: "boolean" }
        }
      },
      CategoryInput: {
        type: "object",
        required: ["name"],
        additionalProperties: false,
        properties: {
          name: { type: "string", maxLength: 60, example: "Curvas" },
          description: { type: "string", nullable: true, maxLength: 500 },
          isActive: { type: "boolean" }
        }
      },
      LocationInput: {
        type: "object",
        required: ["city", "country"],
        additionalProperties: false,
        properties: {
          city: { type: "string", maxLength: 100, example: "Oviedo" },
          region: { type: "string", nullable: true, maxLength: 100 },
          country: { type: "string", maxLength: 100, example: "España" },
          address: { type: "string", nullable: true, maxLength: 255 },
          postalCode: { type: "string", nullable: true, maxLength: 20 },
          latitude: { type: "number", nullable: true, minimum: -90, maximum: 90 },
          longitude: { type: "number", nullable: true, minimum: -180, maximum: 180 },
          status: { type: "string", enum: ["active", "inactive"] },
          isActive: { type: "boolean" }
        }
      },
      UserCreate: {
        type: "object",
        required: ["roleId", "firstName", "lastName", "email", "password"],
        additionalProperties: false,
        properties: {
          roleId: { type: "string", format: "uuid" },
          firstName: { type: "string", maxLength: 100, example: "Marcos" },
          lastName: { type: "string", maxLength: 150, example: "Motero" },
          email: { type: "string", format: "email", maxLength: 150 },
          password: { type: "string", minLength: 8, maxLength: 100 },
          avatarUrl: { type: "string", format: "uri", nullable: true, maxLength: 500 },
          isActive: { type: "boolean" }
        }
      },
      UserUpdate: {
        type: "object",
        additionalProperties: false,
        description: "Al menos un campo. La contraseña es opcional.",
        properties: {
          roleId: { type: "string", format: "uuid" },
          firstName: { type: "string", maxLength: 100 },
          lastName: { type: "string", maxLength: 150 },
          email: { type: "string", format: "email", maxLength: 150 },
          password: { type: "string", minLength: 8, maxLength: 100 },
          avatarUrl: { type: "string", format: "uri", nullable: true, maxLength: 500 },
          isActive: { type: "boolean" }
        }
      },
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error de validación" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string", example: "distanceKm" },
                message: { type: "string", example: "La distancia debe estar entre 0 y 9999.99" }
              }
            }
          }
        }
      }
    },
    parameters: {
      RouteId: { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" }, description: "Id de la ruta" },
      DepartureId: { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" }, description: "Id de la salida" },
      ImageId: { name: "imageId", in: "path", required: true, schema: { type: "string", format: "uuid" }, description: "Id de la imagen" },
      Slug: { name: "slug", in: "path", required: true, schema: { type: "string" }, description: "Slug (URL amigable)" }
    },
    responses: {
      ValidationError: {
        description: "Error de validación",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
      },
      NotFound: {
        description: "No encontrado",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
      }
    }
  }
};

export const swaggerSpec = swaggerJsdoc({
  definition,
  apis: ["./src/app.js", "./src/routes/*.js"]
});
