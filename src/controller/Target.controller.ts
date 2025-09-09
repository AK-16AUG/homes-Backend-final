import { Request, Response } from "express";
import TargetService from "../services/Target.service.js";

const targetService = new TargetService();

export default class TargetController {
  async setTarget(req: Request, res: Response) {
    const { key, value } = req.body;
    if (!key || value === undefined) return res.status(400).json({ message: "key and value required" });
    const target = await targetService.setTarget(key, value);
    return res.status(201).json(target);
  }

  async getTarget(req: Request, res: Response) {
    const { key } = req.params;
    const target = await targetService.getTarget(key);
    if (!target) return res.status(404).json({ message: "Target not found" });
    return res.json(target);
  }

  async updateTarget(req: Request, res: Response) {
    const { key } = req.params;
    const { value } = req.body;
    if (value === undefined) return res.status(400).json({ message: "value required" });
    const target = await targetService.updateTarget(key, value);
    if (!target) return res.status(404).json({ message: "Target not found" });
    return res.json(target);
  }

  async deleteTarget(req: Request, res: Response) {
    const { key } = req.params;
    const target = await targetService.deleteTarget(key);
    if (!target) return res.status(404).json({ message: "Target not found" });
    return res.json({ message: "Target deleted" });
  }
} 