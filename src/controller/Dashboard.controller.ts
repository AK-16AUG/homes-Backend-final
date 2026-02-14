import Property from "../entities/Properties.entity.js";
import Target from "../entities/Target.entity.js";
import User from "../entities/User.entitiy.js";
import { RealEstateLeadModel as Leads } from "../entities/Leads.js";
import { Appointment } from "../entities/appointment.entity.js";
import { Request, Response } from "express";

const DashboardController = {
  // 1. Revenue summary
  async getRevenueSummary(_req: Request, res: Response) {
    try {
      // All unavailable flats
      const unavailableFlats = await Property.find({ availability: false });
      const revenueUnavailable = unavailableFlats.reduce(
        (sum: number, prop: any) => sum + Number(prop.rate || 0),
        0
      );

      // All unavailable sales
      const unavailableSales = await Property.find({ availability: false, category: "sale" });
      const revenueSales = unavailableSales.reduce(
        (sum: number, prop: any) => sum + Number(prop.rate || 0),
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
        (sum: number, prop: any) => sum + Number(prop.rate || 0),
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

  // 3. Comprehensive Dashboard Stats
  async getComprehensiveStats(_req: Request, res: Response) {
    try {
      // 1. Core KPIs
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isVerified: true });
      const totalProperties = await Property.countDocuments();
      const occupiedProperties = await Property.countDocuments({ availability: false });
      const totalLeads = await Leads.countDocuments();
      const totalAppointments = await Appointment.countDocuments();

      // 2. Revenue Data
      const allUnavailable = await Property.find({ availability: false });
      const totalRevenue = allUnavailable.reduce((sum: number, p: any) => sum + Number(p.rate || 0), 0);

      // 3. Last 6 Months Trends (Mocking or calculating based on createdAt/updatedAt)
      // Since we don't have historical snapshots, we calculate based on the current data's timestamps
      const getMonthlyTrend = async (Model: any, dateField = "createdAt") => {
        const trends = [];
        for (let i = 5; i >= 0; i--) {
          const start = new Date();
          start.setMonth(start.getMonth() - i);
          start.setDate(1);
          start.setHours(0, 0, 0, 0);

          const end = new Date(start);
          end.setMonth(end.getMonth() + 1);

          const count = await Model.countDocuments({
            [dateField]: { $gte: start, $lt: end }
          });
          trends.push({ month: start.toLocaleString('default', { month: 'short' }), count });
        }
        return trends;
      };

      const userTrends = await getMonthlyTrend(User);
      const leadTrends = await getMonthlyTrend(Leads);
      const propertyTrends = await getMonthlyTrend(Property);

      // 4. Occupancy Rate
      const occupancyRate = totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0;

      res.json({
        kpis: {
          totalUsers,
          activeUsers,
          totalProperties,
          occupiedProperties,
          totalLeads,
          totalAppointments,
          totalRevenue,
          occupancyRate,
        },
        trends: {
          users: userTrends,
          leads: leadTrends,
          properties: propertyTrends,
        }
      });
    } catch (err) {
      console.error("Dashboard comprehensive error:", err);
      res.status(500).json({ error: "Failed to fetch comprehensive stats" });
    }
  },
};

export default DashboardController;