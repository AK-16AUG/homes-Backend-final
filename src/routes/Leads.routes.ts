import { Router } from "express";
import LeadsController from "../controller/Leads.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import { authMiddleware, authorizeRoles } from "../middleware/Auth.middleware.js";

const leadsRouter = Router();
const leadsController = new LeadsController();

// Public endpoint for inquiry form (no auth required)
leadsRouter.post("/inquiry", asyncHandler(async (req, res) => {
  await leadsController.createLead(req, res);
}));

leadsRouter.get("/", authMiddleware, authorizeRoles("admin", "superadmin"), asyncHandler(async (req, res) => {
  await leadsController.getAllLeads(req, res);
}));

leadsRouter.post("/", authMiddleware, asyncHandler(async (req, res) => {
  await leadsController.createLead(req, res);
}));

leadsRouter.get("/status/:status", authMiddleware, authorizeRoles("admin", "superadmin"), asyncHandler(async (req, res) => {
  await leadsController.getLeadsByStatus(req, res);
}));

leadsRouter.get("/user/:userId", authMiddleware, asyncHandler(async (req, res) => {
  await leadsController.getLeadsByUser(req, res);
}));

leadsRouter.get("/total", authMiddleware, authorizeRoles("admin", "superadmin"), asyncHandler(async (req, res) => {
  await leadsController.getTotalLeads(req, res);
}));

leadsRouter.get("/:id", authMiddleware, asyncHandler(async (req, res) => {
  await leadsController.getLeadById(req, res);
}));

leadsRouter.put("/:id", authMiddleware, asyncHandler(async (req, res) => {
  await leadsController.updateLead(req, res);
}));

leadsRouter.delete("/:id", authMiddleware, authorizeRoles("admin", "superadmin"), asyncHandler(async (req, res) => {
  await leadsController.deleteLead(req, res);
}));

export default leadsRouter;
