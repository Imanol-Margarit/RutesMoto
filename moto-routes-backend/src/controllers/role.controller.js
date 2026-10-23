import { roleService } from "../services/role.service.js";
import { respond } from "../utils/response.util.js";

export const roleController = {
  async listActive(_req, res, next) {
    try {
      const data = await roleService.listActive();
      return respond(res, 200, "Solo los roles activos", data);
    } catch (error) {
      return next(error);
    }
  }
};
