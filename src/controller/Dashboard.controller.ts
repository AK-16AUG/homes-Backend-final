import Property from "../entities/Properties.entity.js";
import Target from "../entities/Target.entity.js";
import { RealEstateLeadModel as Leads } from "../entities/Leads.js";
import { Appointment } from "../entities/appointment.entity.js";
import Tenant from "../entities/tenant.entity.js";
import { Request, Response } from "express";

const DashboardController = {
  // 1. Revenue summary
  async getRevenueSummary(_req: Request, res: Response) {
    try {
      const parseSafe = (val: any) => parseFloat(String(val || "0").replace(/[^0-9.]/g, "")) || 0;
      const unavailableFlats = await Property.find({ availability: false });
      const revenueUnavailable = unavailableFlats.reduce(
        (sum: number, prop: any) => sum + parseSafe(prop.rate),
        0
      );
      const unavailableSales = await Property.find({ availability: false, category: "sale" });
      const revenueSales = unavailableSales.reduce(
        (sum: number, prop: any) => sum + parseSafe(prop.rate),
        0
      );
      res.json({ revenueUnavailable, revenueSales });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch revenue summary" });
    }
  },

  // 2. Monthly revenue vs target
  async getMonthlyRevenue(_req: Request, res: Response) {
    try {
      const parseSafe = (val: any) => parseFloat(String(val || "0").replace(/[^0-9.]/g, "")) || 0;
      const target = await Target.findOne({ key: "monthlyRevenue" });
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const unavailableThisMonth = await Property.find({
        availability: false,
        updatedAt: { $gte: startOfMonth, $lt: endOfMonth },
      });

      const monthlyRevenue = unavailableThisMonth.reduce(
        (sum: number, prop: any) => sum + parseSafe(prop.rate),
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
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const startOfLast7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startOfPrevious7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const parseSafe = (val: any) => parseFloat(String(val || "0").replace(/[^0-9.]/g, "")) || 0;

      // 0. Fetch initial data once
      const [allTenants, allConvertedLeads] = await Promise.all([
        Tenant.find().lean(),
        Leads.find({ status: 'converted' }).lean()
      ]);

      // 1. Core KPIs with Growth logic
      const totalProperties = await Property.countDocuments();
      const occupiedProperties = await Property.countDocuments({ availability: false });
      const currentOccupancyRate = totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0;

      const previousOccupiedProperties = await Property.countDocuments({
        availability: false,
        updatedAt: { $lt: startOfLast7Days }
      });
      const previousOccupancyRate = totalProperties > 0 ? (previousOccupiedProperties / totalProperties) * 100 : 0;
      const occupancyGrowth = previousOccupancyRate > 0 ? ((currentOccupancyRate - previousOccupancyRate) / previousOccupancyRate) * 100 : 0;

      const totalLeads = await Leads.countDocuments();
      const newLeads7Days = await Leads.countDocuments({ createdAt: { $gte: startOfLast7Days } });
      const previousLeads7Days = await Leads.countDocuments({
        createdAt: { $gte: startOfPrevious7Days, $lt: startOfLast7Days }
      });
      const leadGrowth = previousLeads7Days > 0 ? ((newLeads7Days - previousLeads7Days) / previousLeads7Days) * 100 : 0;

      const confirmedBookingsCount = await Appointment.countDocuments({
        status: 'Confirmed',
        createdAt: { $gte: startOfLast7Days }
      });
      const previousConfirmedBookings = await Appointment.countDocuments({
        status: 'Confirmed',
        createdAt: { $gte: startOfPrevious7Days, $lt: startOfLast7Days }
      });
      const bookingGrowth = previousConfirmedBookings > 0 ? ((confirmedBookingsCount - previousConfirmedBookings) / previousConfirmedBookings) * 100 : 0;

      // 2. Optimized Revenue Data
      const revenueData = await Tenant.aggregate([
        {
          $facet: {
            currentMonth: [
              { $unwind: "$Payments" },
              { $match: { "Payments.dateOfPayment": { $gte: startOfMonth } } },
              { $group: { _id: null, total: { $sum: { $toDouble: "$Payments.amount" } } } }
            ],
            lastMonth: [
              { $unwind: "$Payments" },
              { $match: { "Payments.dateOfPayment": { $gte: startOfLastMonth, $lt: startOfMonth } } },
              { $group: { _id: null, total: { $sum: { $toDouble: "$Payments.amount" } } } }
            ]
          }
        }
      ]);

      const revenueThisMonth = revenueData[0].currentMonth[0]?.total || 0;
      const revenueLastMonth = revenueData[0].lastMonth[0]?.total || 0;
      const revenueGrowth = revenueLastMonth > 0 ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 : 0;

      // Calculate Outstanding Rent
      const outstandingRent = allTenants.reduce((sum, t: any) => {
        const hasPaidThisMonth = (t.Payments || []).some((p: any) => p.dateOfPayment && new Date(p.dateOfPayment) >= startOfMonth);
        if (!hasPaidThisMonth && t.startDate && new Date(t.startDate) < startOfMonth) {
          return sum + parseSafe(t.rent);
        }
        return sum;
      }, 0);

      // 3. Occupancy Map Data
      const properties = await Property.find().limit(80).lean();
      const roomStatusGrid = properties.map(p => ({
        id: p._id,
        name: p.property_name || "Unknown Unit",
        flatNo: (p as any).flat_no || "N/A",
        status: !p.availability ? 'occupied' : 'vacant',
        rent: parseSafe(p.rate),
        type: p.category || "pg"
      }));

      // 4. Lead Funnel
      const funnel = {
        visits: await Leads.countDocuments({ status: 'inquiry' }),
        booked: await Leads.countDocuments({ status: 'contacted' }),
        converted: allConvertedLeads.length
      };

      // 5. Revenue by Room Type
      const revenueByType = await Property.aggregate([
        { $match: { availability: false } },
        {
          $group: {
            _id: "$category",
            total: { $sum: { $toDouble: "$rate" } },
            count: { $sum: 1 }
          }
        },
        { $project: { _id: { $ifNull: ["$_id", "other"] }, total: 1, count: 1 } }
      ]);

      const trends = [];
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const monthPayments = await Tenant.aggregate([
          { $unwind: "$Payments" },
          { $match: { "Payments.dateOfPayment": { $gte: start, $lt: end } } },
          { $group: { _id: null, total: { $sum: { $toDouble: "$Payments.amount" } } } }
        ]);
        trends.push({
          month: start.toLocaleString('default', { month: 'short' }),
          amount: monthPayments[0]?.total || 0
        });
      }

      const recentLeads = await Leads.find().sort({ createdAt: -1 }).limit(4).lean();
      const smartQueue = recentLeads.map(lead => {
        const diffInMs = now.getTime() - new Date((lead as any).createdAt).getTime();
        const diffMins = Math.floor(diffInMs / 60000);
        let activity = `${diffMins} mins ago`;
        if (diffMins > 60) activity = `${Math.floor(diffMins / 60)} hours ago`;
        if (diffMins > 1440) activity = `${Math.floor(diffMins / 1440)} days ago`;
        const temp = diffMins < 60 ? "hot" : diffMins < 1440 ? "warm" : "cold";
        return {
          name: lead.contactInfo?.name || "Anonymous",
          phone: lead.contactInfo?.phone || "",
          type: lead.searchQuery || "General Inquiry",
          activity,
          temp,
          icon: temp === "hot" ? "Flame" : temp === "warm" ? "Droplets" : "Snowflake"
        };
      });

      // AI Insights
      const insights = [];
      if (totalLeads > 5 && (funnel.converted / totalLeads) < 0.1) insights.push("Low conversion rate detected. Review follow-up speed.");
      if (outstandingRent > 50000) insights.push(`Significant arrears (₹${outstandingRent.toLocaleString()}). Prioritize collections.`);
      const pgProp = revenueByType.find(r => r._id === 'pg');
      if (pgProp && pgProp.count > 10) insights.push("PG category is performing well. Consider expanding capacity.");
      if (leadGrowth > 20) insights.push(`Lead volume is up ${leadGrowth.toFixed(0)}%. Scalability check required.`);

      // Retention & velocity
      let avgRetention = 0;
      if (allTenants.length > 0) {
        const totalMonths = allTenants.reduce((acc, t: any) => {
          const start = new Date(t.startDate);
          const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
          return acc + Math.max(0, months);
        }, 0);
        avgRetention = totalMonths / allTenants.length;
      }

      let avgVelocity = 0;
      if (allConvertedLeads.length > 0) {
        const totalHours = allConvertedLeads.reduce((acc, lead: any) => {
          const start = new Date(lead.createdAt);
          const end = new Date(lead.updatedAt);
          const hours = (end.getTime() - start.getTime()) / 3600000;
          return acc + Math.max(0, hours);
        }, 0);
        avgVelocity = totalHours / allConvertedLeads.length;
      }

      res.json({
        kpis: {
          revenueThisMonth,
          revenueGrowth,
          occupancyRate: currentOccupancyRate,
          occupancyGrowth,
          vacantBeds: totalProperties - occupiedProperties,
          newLeads7Days,
          leadGrowth,
          bookingsConfirmed: confirmedBookingsCount,
          bookingGrowth,
          outstandingRent,
          totalLeads
        },
        revenueIntelligence: {
          trend: trends,
          byType: revenueByType,
          averageRent: totalProperties > 0 ? (revenueThisMonth / totalProperties) : 0
        },
        occupancyMap: roomStatusGrid,
        leadFunnel: {
          total: totalLeads,
          funnel: [
            { stage: 'Inquiries', value: await Leads.countDocuments({ createdAt: { $gte: startOfMonth } }) },
            { stage: 'Visits', value: funnel.visits },
            { stage: 'Booked', value: funnel.booked },
            { stage: 'Converted', value: funnel.converted }
          ]
        },
        smartQueue,
        insights,
        tenantHealth: {
          atRisk: allTenants.filter((t: any) => (t.Payments || []).length < 2 && t.startDate && new Date(t.startDate) < new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)).length,
          retention: `${avgRetention.toFixed(1)} Months`,
          resolutionVelocity: `${avgVelocity.toFixed(1)} Hours`
        }
      });
    } catch (err) {
      console.error("Dashboard comprehensive error:", err);
      res.status(500).json({ error: "Failed to fetch comprehensive stats" });
    }
  },
};

export default DashboardController;