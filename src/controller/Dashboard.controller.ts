import Property from "../entities/Properties.entity.js";
import Target from "../entities/Target.entity.js";
import { Request, Response } from "express";

const DashboardController = {
  // 1. Revenue summary
  async getRevenueSummary(_req: Request, res: Response) {
    try {
      // All unavailable flats
      const unavailableFlats = await Property.find({ availability: false });
      const revenueUnavailable = unavailableFlats.reduce(
        (sum, prop) => sum + Number(prop.rate || 0),
        0
      );

      // All unavailable sales
      const unavailableSales = await Property.find({ availability: false, category: "sale" });
      const revenueSales = unavailableSales.reduce(
        (sum, prop) => sum + Number(prop.rate || 0),
        0
      );

      res.json({
        revenueUnavailable,
        revenueSales,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch revenue summary" });
    }
  },

  // 2. Monthly revenue vs target
  async getMonthlyRevenue(_req: Request, res: Response) {
    try {
      // Get target
      const target = await Target.findOne({ key: "monthlyRevenue" });

      // Get unavailable flats for this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);

      // Assuming 'updatedAt' is set when property becomes unavailable
      const unavailableThisMonth = await Property.find({
        availability: false,
        updatedAt: { $gte: startOfMonth, $lt: endOfMonth },
      });

      const monthlyRevenue = unavailableThisMonth.reduce(
        (sum, prop) => sum + Number(prop.rate || 0),
        0
      );

      res.json({
        target: target?.value || 0,
        monthlyRevenue,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch monthly revenue" });
    }
  },
};

export default DashboardController; 