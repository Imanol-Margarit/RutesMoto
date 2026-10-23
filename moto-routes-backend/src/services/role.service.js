import { roleRepository } from "../repositories/role.repository.js";

export const roleService = {
  async listActive() {
    return roleRepository.findAll();
  }
};
