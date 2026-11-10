import { Router } from "express";
import { shopController } from "../controllers/shop.controller.js";

const router = Router();

// Endpoints públicos de la tienda: no requieren sesión.

/**
 * @swagger
 * /api/shop/categories:
 *   get:
 *     summary: Categorías activas (para filtros y portada)
 *     tags: [Tienda]
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get("/categories", shopController.categories);

/**
 * @swagger
 * /api/shop/hosts:
 *   get:
 *     summary: Guías activos (para filtros y portada)
 *     tags: [Tienda]
 *     responses:
 *       200:
 *         description: Lista de guías
 */
router.get("/hosts", shopController.hosts);

/**
 * @swagger
 * /api/shop/locations:
 *   get:
 *     summary: Localizaciones activas (para filtros y portada)
 *     tags: [Tienda]
 *     responses:
 *       200:
 *         description: Lista de localizaciones
 */
router.get("/locations", shopController.locations);

/**
 * @swagger
 * /api/shop/routes:
 *   get:
 *     summary: Listado paginado de rutas publicadas, con filtros en la query
 *     description: Los filtros de lista admiten varios valores separados por coma (difficulty=facil,media).
 *     tags: [Tienda]
 *     parameters:
 *       - { name: search, in: query, schema: { type: string } }
 *       - { name: category, in: query, schema: { type: string }, description: Slug de categoría }
 *       - { name: host, in: query, schema: { type: string }, description: Slug de guía }
 *       - { name: location, in: query, schema: { type: string }, description: Slug de localización }
 *       - { name: difficulty, in: query, schema: { type: string, example: "facil,media" } }
 *       - { name: surface, in: query, schema: { type: string, example: "asfalto,mixto" } }
 *       - { name: distanceMin, in: query, schema: { type: number } }
 *       - { name: distanceMax, in: query, schema: { type: number } }
 *       - { name: sort, in: query, schema: { type: string, enum: [recent, distance_asc, distance_desc, duration_asc, title_asc] } }
 *       - { name: page, in: query, schema: { type: integer, minimum: 1 } }
 *       - { name: limit, in: query, schema: { type: integer, minimum: 1, maximum: 50 } }
 *     responses:
 *       200:
 *         description: Items y paginación
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get("/routes", shopController.routes);

/**
 * @swagger
 * /api/shop/routes/{slug}:
 *   get:
 *     summary: Detalle de una ruta publicada (con imágenes y salidas disponibles)
 *     tags: [Tienda]
 *     parameters:
 *       - { name: slug, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Ruta con imágenes y salidas
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/routes/:slug", shopController.routeDetail);

/**
 * @swagger
 * /api/shop/routes/{slug}/departures:
 *   get:
 *     summary: Salidas disponibles de una ruta (futuras, programadas y con plazas libres)
 *     tags: [Tienda]
 *     parameters:
 *       - { name: slug, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Lista de salidas
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/routes/:slug/departures", shopController.routeDepartures);

export default router;
