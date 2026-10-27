// Solo documentación Swagger de las imágenes de cada entidad (no contiene código ejecutable).
// Las rutas reales están en image.routes.js y en cada *.routes.js.

export {};

/**
 * @swagger
 * /api/routes/{id}/images:
 *   get:
 *     summary: Listar las imágenes de un ruta
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/RouteId'
 *     responses:
 *       200:
 *         description: Listado de imágenes ordenado por posición
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { type: array, items: { $ref: '#/components/schemas/EntityImage' } }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   post:
 *     summary: Añadir una imagen a un ruta
 *     description: Si isCover es true, la imagen principal anterior deja de serlo.
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/RouteId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RouteImageInput' }
 *     responses:
 *       201:
 *         description: Imagen añadida
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/routes/{id}/images/{imageId}:
 *   patch:
 *     summary: Editar una imagen de un ruta (solo los campos enviados)
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/RouteId'
 *       - $ref: '#/components/parameters/ImageId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RouteImageUpdate' }
 *     responses:
 *       200:
 *         description: Imagen actualizada
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Borrar una imagen de un ruta (soft delete)
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/RouteId'
 *       - $ref: '#/components/parameters/ImageId'
 *     responses:
 *       200:
 *         description: Imagen eliminada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/hosts/{id}/images:
 *   get:
 *     summary: Listar las imágenes de un guía
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/HostId'
 *     responses:
 *       200:
 *         description: Listado de imágenes ordenado por posición
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { type: array, items: { $ref: '#/components/schemas/EntityImage' } }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   post:
 *     summary: Añadir una imagen a un guía
 *     description: Si isCover es true, la imagen principal anterior deja de serlo.
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/HostId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RouteImageInput' }
 *     responses:
 *       201:
 *         description: Imagen añadida
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/hosts/{id}/images/{imageId}:
 *   patch:
 *     summary: Editar una imagen de un guía (solo los campos enviados)
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/HostId'
 *       - $ref: '#/components/parameters/ImageId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RouteImageUpdate' }
 *     responses:
 *       200:
 *         description: Imagen actualizada
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Borrar una imagen de un guía (soft delete)
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/HostId'
 *       - $ref: '#/components/parameters/ImageId'
 *     responses:
 *       200:
 *         description: Imagen eliminada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/categories/{id}/images:
 *   get:
 *     summary: Listar las imágenes de un categoría
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/CategoryId'
 *     responses:
 *       200:
 *         description: Listado de imágenes ordenado por posición
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { type: array, items: { $ref: '#/components/schemas/EntityImage' } }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   post:
 *     summary: Añadir una imagen a un categoría
 *     description: Si isCover es true, la imagen principal anterior deja de serlo.
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/CategoryId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RouteImageInput' }
 *     responses:
 *       201:
 *         description: Imagen añadida
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/categories/{id}/images/{imageId}:
 *   patch:
 *     summary: Editar una imagen de un categoría (solo los campos enviados)
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/CategoryId'
 *       - $ref: '#/components/parameters/ImageId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RouteImageUpdate' }
 *     responses:
 *       200:
 *         description: Imagen actualizada
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Borrar una imagen de un categoría (soft delete)
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/CategoryId'
 *       - $ref: '#/components/parameters/ImageId'
 *     responses:
 *       200:
 *         description: Imagen eliminada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/locations/{id}/images:
 *   get:
 *     summary: Listar las imágenes de un localización
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/LocationId'
 *     responses:
 *       200:
 *         description: Listado de imágenes ordenado por posición
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { type: array, items: { $ref: '#/components/schemas/EntityImage' } }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   post:
 *     summary: Añadir una imagen a un localización
 *     description: Si isCover es true, la imagen principal anterior deja de serlo.
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/LocationId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RouteImageInput' }
 *     responses:
 *       201:
 *         description: Imagen añadida
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/locations/{id}/images/{imageId}:
 *   patch:
 *     summary: Editar una imagen de un localización (solo los campos enviados)
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/LocationId'
 *       - $ref: '#/components/parameters/ImageId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RouteImageUpdate' }
 *     responses:
 *       200:
 *         description: Imagen actualizada
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Borrar una imagen de un localización (soft delete)
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/LocationId'
 *       - $ref: '#/components/parameters/ImageId'
 *     responses:
 *       200:
 *         description: Imagen eliminada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/users/{id}/images:
 *   get:
 *     summary: Listar las imágenes de un usuario
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *     responses:
 *       200:
 *         description: Listado de imágenes ordenado por posición
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { type: array, items: { $ref: '#/components/schemas/EntityImage' } }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   post:
 *     summary: Añadir una imagen a un usuario
 *     description: Si isCover es true, la imagen principal anterior deja de serlo.
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RouteImageInput' }
 *     responses:
 *       201:
 *         description: Imagen añadida
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/users/{id}/images/{imageId}:
 *   patch:
 *     summary: Editar una imagen de un usuario (solo los campos enviados)
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *       - $ref: '#/components/parameters/ImageId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RouteImageUpdate' }
 *     responses:
 *       200:
 *         description: Imagen actualizada
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Borrar una imagen de un usuario (soft delete)
 *     tags: [Imágenes]
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *       - $ref: '#/components/parameters/ImageId'
 *     responses:
 *       200:
 *         description: Imagen eliminada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
