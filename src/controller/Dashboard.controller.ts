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
      // 1. Core KPIs and Revenue Data in parallel
      const [
        totalUsers,
        activeUsers,
        totalProperties,
        occupiedProperties,
        totalLeads,
        totalAppointments,
        revenueData
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isVerified: true }),
        Property.countDocuments(),
        Property.countDocuments({ availability: false }),
        Leads.countDocuments(),
        Appointment.countDocuments(),
        Property.aggregate([
          { $match: { availability: false } },
          { $group: { _id: null, total: { $sum: { $toDouble: "$rate" } } } }
        ])
      ]);

      const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

      // 3. Last 6 Months Trends using Aggregation
      const getMonthlyTrendAgg = async (Model: any, dateField = "createdAt") => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const results = await Model.aggregate([
          { $match: { [dateField]: { $gte: sixMonthsAgo } } },
          {
            $group: {
              _id: {
                month: { $month: "$" + dateField },
                year: { $year: "$" + dateField }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Map back to the expected format (last 6 months including zeroes)
        const trend = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const monthNum = d.getMonth() + 1;
          const yearNum = d.getFullYear();
          
          const found = results.find((r: any) => r._id.month === monthNum && r._id.year === yearNum);
          trend.push({
            month: d.toLocaleString('default', { month: 'short' }),
            count: found ? found.count : 0
          });
        }
        return trend;
      };

      const [userTrends, leadTrends, propertyTrends] = await Promise.all([
        getMonthlyTrendAgg(User),
        getMonthlyTrendAgg(Leads),
        getMonthlyTrendAgg(Property)
      ]);

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