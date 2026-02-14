import express from "express";
import DashboardController from "../controller/Dashboard.controller.js";

const router = express.Router();

router.get("/dashboard/revenue", DashboardController.getRevenueSummary);
router.get("/dashboard/monthly-revenue", DashboardController.getMonthlyRevenue);
router.get("/dashboard/comprehensive", DashboardController.getComprehensiveStats);

export default router;