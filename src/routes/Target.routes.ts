import { Router } from "express";
import TargetController from "../controller/Target.controller.js";
import asyncHandler from "../utils/asyncHandler.js";

const targetRouter = Router();
const targetController = new TargetController();

targetRouter.post("/target", asyncHandler((req, res) => targetController.setTarget(req, res)));
targetRouter.get("/target/:key", asyncHandler((req, res) => targetController.getTarget(req, res)));
targetRouter.put("/target/:key", asyncHandler((req, res) => targetController.updateTarget(req, res)));
targetRouter.delete("/target/:key", asyncHandler((req, res) => targetController.deleteTarget(req, res)));

export default targetRouter; 