import TargetDao from "../dao/Target.dao.js";

export default class TargetService {
  private targetDao: TargetDao;
  constructor() {
    this.targetDao = new TargetDao();
  }

  async setTarget(key: string, value: number) {
    return await this.targetDao.setTarget(key, value);
  }

  async getTarget(key: string) {
    return await this.targetDao.getTarget(key);
  }

  async updateTarget(key: string, value: number) {
    return await this.targetDao.updateTarget(key, value);
  }

  async deleteTarget(key: string) {
    return await this.targetDao.deleteTarget(key);
  }
} 