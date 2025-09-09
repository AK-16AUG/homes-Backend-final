import { Router } from "express";
import TenantController from "../controller/Tenant.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import { authMiddleware, authorizeRoles } from "../middleware/Auth.middleware.js";

const tenantRouter = Router();
const tenantController = new TenantController();

// Basic CRUD operations
tenantRouter.post("/", authMiddleware, authorizeRoles("admin","superadmin"), asyncHandler(async (req, res) => {
  await tenantController.createTenant(req, res);
}));

tenantRouter.get("/", asyncHandler(async (req, res) => {
  await tenantController.getAllTenants(req, res);
}));

tenantRouter.get("/:id", authMiddleware, authorizeRoles("admin","superadmin"), asyncHandler(async (req, res) => {
  await tenantController.getTenantById(req, res);
}));

tenantRouter.put("/:id", authMiddleware, authorizeRoles("admin","superadmin"), asyncHandler(async (req, res) => {
  await tenantController.updateTenant(req, res);
}));

tenantRouter.delete("/:id", authMiddleware, authorizeRoles("admin","superadmin"), asyncHandler(async (req, res) => {
  await tenantController.deleteTenant(req, res);
}));

// Tenant-user relationships
tenantRouter.post("/:tenantId/users", authMiddleware, authorizeRoles("admin","superadmin"), asyncHandler(async (req, res) => {
  await tenantController.addUserToTenant(req, res);
}));

tenantRouter.delete("/:tenantId/users/:userIdentifier", authMiddleware, authorizeRoles("admin", "user","superadmin"), asyncHandler(async (req, res) => {
  await tenantController.removeUserFromTenant(req, res);
}));

// Tenant payments
tenantRouter.post("/:tenantId/users/payments", authMiddleware, authorizeRoles("admin","superadmin"), asyncHandler(async (req, res) => {
  await tenantController.addPayment(req, res);
}));

tenantRouter.get("/:tenantId/payments", authMiddleware, authorizeRoles("admin","superadmin"), asyncHandler(async (req, res) => {
  await tenantController.getPaymentsByTenantId(req, res);
}));

// Filtered queries
tenantRouter.get("/user/:userId", authMiddleware, asyncHandler(async (req, res) => {
  await tenantController.getTenantsByUserId(req, res);
}));

tenantRouter.get("/property/:propertyId", authMiddleware, asyncHandler(async (req, res) => {
  await tenantController.getTenantsByPropertyId(req, res);
}));

tenantRouter.get("/filter/all", asyncHandler(async (req, res) => {
  await tenantController.getTenantsByFilters(req, res);
}));

export default tenantRouter;
