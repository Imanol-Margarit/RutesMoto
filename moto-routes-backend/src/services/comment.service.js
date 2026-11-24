import { commentRepository } from "../repositories/comment.repository.js";
import { shopRepository } from "../repositories/shop.repository.js";
import { AppError } from "../utils/app-error.js";

const WRITER_ROLES = ["admin", "host"];

const notFound = () => new AppError("Comentario no encontrado", 404);

// Solo se comenta en rutas publicadas y visibles en la tienda.
async function getPublishedRoute(slug) {
  const route = await shopRepository.findRouteBySlug(slug);
  if (!route) throw new AppError("Ruta no encontrada", 404);
  return route;
}

// Cargar el comentario y comprobar que el usuario puede tocarlo.
async function getOwnComment(id, user, { allowWriters = false } = {}) {
  const comment = await commentRepository.findById(id);
  if (!comment) throw notFound();

  const isOwner = comment.userId === user.id;
  const isWriter = allowWriters && WRITER_ROLES.includes(user.role);
  if (!isOwner && !isWriter) {
    throw new AppError("No puedes modificar el comentario de otro usuario", 403);
  }
  return comment;
}

export const commentService = {
  /** Lista pública: estadísticas + comentarios de una ruta publicada. */
  async listByRoute(slug) {
    const route = await getPublishedRoute(slug);
    const [stats, items] = await Promise.all([
      commentRepository.statsByRoute(route._id),
      commentRepository.findByRoute(route._id)
    ]);
    return { route: { _id: route._id, title: route.title, slug: route.slug }, stats, items };
  },

  async create(slug, user, payload) {
    const route = await getPublishedRoute(slug);
    return commentRepository.create({ ...payload, routeId: route._id, userId: user.id });
  },

  /** Solo el autor puede editar su comentario. */
  async update(id, user, payload) {
    await getOwnComment(id, user);
    const updated = await commentRepository.update(id, payload);
    if (!updated) throw notFound();
    return updated;
  },

  /** El autor, o un admin/host (moderación), pueden borrar. */
  async remove(id, user) {
    await getOwnComment(id, user, { allowWriters: true });
    const removed = await commentRepository.softDelete(id);
    if (!removed) throw notFound();
    return removed;
  }
};
