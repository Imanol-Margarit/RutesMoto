import { agentService } from "../services/agent.service.js";
import { commentsSummaryService } from "../services/comments-summary.service.js";
import { respond } from "../utils/response.util.js";

export const agentController = {
  async chat(req, res, next) {
    try {
      const result = await agentService.chat(req.body.messages);
      return respond(res, 200, "Respuesta generada", result);
    } catch (error) {
      return next(error);
    }
  },

  async commentsSummary(req, res, next) {
    try {
      const result = await commentsSummaryService.summarize(req.params.slug);
      return respond(res, 200, "Resumen generado", result);
    } catch (error) {
      return next(error);
    }
  },
};
