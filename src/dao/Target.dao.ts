import Target from "../entities/Target.entity.js";

export default class TargetDao {
  async setTarget(key: string, value: number) {
    return await Target.create({ key, value });
  }

  async getTarget(key: string) {
    return await Target.findOne({ key });
  }

  async updateTarget(key: string, value: number) {
    return await Target.findOneAndUpdate({ key }, { value }, { new: true });
  }

  async deleteTarget(key: string) {
    return await Target.findOneAndDelete({ key });
  }
} 