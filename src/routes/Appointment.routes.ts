import { Router } from "express";
import AppointmentController from "../controller/Appointment.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import { authMiddleware, authorizeRoles } from "../middleware/Auth.middleware.js";

const appointmentRouter = Router();
const appointmentController = new AppointmentController();

appointmentRouter.get("/", authMiddleware, authorizeRoles("admin", "superadmin"), asyncHandler(async (req, res) => {
  await appointmentController.getAllAppointments(req, res);
}));

appointmentRouter.get("/calendar", authMiddleware, authorizeRoles("admin", "superadmin"), asyncHandler(async (req, res) => {
  await appointmentController.getCalendarAppointments(req, res);
}));

appointmentRouter.post("/", authMiddleware, asyncHandler(async (req, res) => {
  await appointmentController.createAppointment(req, res);
}));

appointmentRouter.get("/user/:userid/:propertyid", authMiddleware, asyncHandler(async (req, res) => {
  await appointmentController.getAppointmentByUserId(req, res);
}));

appointmentRouter.get("/user/:userid", authMiddleware, asyncHandler(async (req, res) => {
  await appointmentController.getAppointmentForUserId(req, res);
}));

appointmentRouter.get("/property/:propertyid", authMiddleware, asyncHandler(async (req, res) => {
  await appointmentController.getAppointmentByPropertyId(req, res);
}));

appointmentRouter.get("/total", authMiddleware, authorizeRoles("admin", "superadmin"), asyncHandler(async (req, res) => {
  await appointmentController.getTotalAppointments(req, res);
}));

appointmentRouter.get("/:id", authMiddleware, asyncHandler(async (req, res) => {
  await appointmentController.getAppointmentById(req, res);
}));

appointmentRouter.put("/:id", authMiddleware, authorizeRoles("admin", "superadmin"), asyncHandler(async (req, res) => {
  await appointmentController.updateAppointment(req, res);
}));

appointmentRouter.put("/:id/lead", authMiddleware, authorizeRoles("admin", "superadmin"), asyncHandler(async (req, res) => {
  await appointmentController.createLeadFromAppointmentUpdate(req, res);
}));

appointmentRouter.delete("/:id", authMiddleware, asyncHandler(async (req, res) => {
  await appointmentController.deleteAppointment(req, res);
}));

export default appointmentRouter;
