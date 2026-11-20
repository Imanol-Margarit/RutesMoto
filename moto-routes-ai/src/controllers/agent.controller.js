import { agentService } from "../services/agent.service.js";
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
};
