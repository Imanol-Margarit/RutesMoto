export interface CommentAuthor {
  _id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface RouteComment {
  _id: string;
  routeId: string;
  userId: string;
  rating: number;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
}

/** Media de valoraciones y número de comentarios de una ruta. */
export interface CommentStats {
  count: number;
  average: number | null;
}

/** Respuesta de GET /comments/route/:slug. */
export interface RouteComments {
  route: { _id: string; title: string; slug: string };
  stats: CommentStats;
  items: RouteComment[];
}

export interface CommentInput {
  rating: number;
  content: string;
}

/** Respuesta del agente IA: GET /ia/agent/comments/:slug/summary. */
export interface CommentsSummary {
  summary: string | null;
  count: number;
  average: number | null;
}
