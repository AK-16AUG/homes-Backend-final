import Property from "../entities/Properties.entity.js";
import Target from "../entities/Target.entity.js";
import User from "../entities/User.entitiy.js";
import { RealEstateLeadModel as Leads } from "../entities/Leads.js";
import { Appointment } from "../entities/appointment.entity.js";
import { VisitModel as Visit } from "../entities/Visit.js";
import Tenant from "../entities/tenant.entity.js";
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
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLast7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // 1. Core KPIs
      const totalProperties = await Property.countDocuments();
      const occupiedProperties = await Property.countDocuments({ availability: false });
      const totalLeads = await Leads.countDocuments();
      const newLeads7Days = await Leads.countDocuments({ createdAt: { $gte: startOfLast7Days } });
      const currentMonthLeads = await Leads.countDocuments({ createdAt: { $gte: startOfMonth } });

      const confirmedBookings = await Leads.countDocuments({ status: 'converted', updatedAt: { $gte: startOfLast7Days } });

      // 2. Revenue Data
      const allTenants = await Tenant.find();
      const revenueThisMonth = allTenants.reduce((sum, t) => {
        const monthPayments = t.Payments.filter(p => new Date(p.dateOfPayment) >= startOfMonth);
        return sum + monthPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
      }, 0);

      // Simplified outstanding: if no payment this month and started before this month
      const outstandingRent = allTenants.reduce((sum, t) => {
        const hasPaidThisMonth = t.Payments.some(p => new Date(p.dateOfPayment) >= startOfMonth);
        if (!hasPaidThisMonth && new Date(t.startDate) < startOfMonth) {
          return sum + Number(t.rent || 0);
        }
        return sum;
      }, 0);

      // 3. Occupancy Map Data
      const properties = await Property.find().populate('currentTenant');
      const roomStatusGrid = properties.map(p => ({
        id: p._id,
        name: p.property_name,
        flatNo: p.flat_no,
        status: !p.availability ? 'occupied' : 'vacant', // Add 'notice' logic if schema allowed
        rent: p.rate,
        type: p.category
      }));

      // 4. Lead Funnel
      const funnel = {
        visits: await Leads.countDocuments({ status: 'inquiry' }),
        booked: await Leads.countDocuments({ status: 'contacted' }),
        converted: await Leads.countDocuments({ status: 'converted' })
      };

      // 5. Revenue by Room Type
      const revenueByType = await Property.aggregate([
        { $match: { availability: false } },
        { $group: { _id: "$category", total: { $sum: { $toDouble: "$rate" } }, count: { $sum: 1 } } }
      ]);

      // 6. Trends (Last 6 Months)
      const getMonthlyRevenueTrend = async () => {
        const trends = [];
        for (let i = 5; i >= 0; i--) {
          const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

          const monthTenants = await Tenant.find();
          const amount = monthTenants.reduce((sum, t) => {
            const payments = t.Payments.filter(p => new Date(p.dateOfPayment) >= start && new Date(p.dateOfPayment) < end);
            return sum + payments.reduce((s, p) => s + Number(p.amount || 0), 0);
          }, 0);

          trends.push({ month: start.toLocaleString('default', { month: 'short' }), amount });
        }
        return trends;
      };

      const revenueTrend = await getMonthlyRevenueTrend();

      // 7. Smart AI Insights (Heuristics)
      const insights = [];
      if (funnel.converted / (totalLeads || 1) < 0.1) {
        insights.push("Low conversion rate detected. Review follow-up speed.");
      }
      if (outstandingRent > 50000) {
        insights.push("High outstanding rent. Send automated reminders.");
      }
      const pgProp = revenueByType.find(r => r._id === 'pg');
      if (pgProp && pgProp.count > 10) {
        insights.push("PG category is performing well. Consider expanding capacity.");
      }

      res.json({
        kpis: {
          revenueThisMonth,
          occupancyRate: totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0,
          newLeads7Days,
          bookingsConfirmed: confirmedBookings,
          outstandingRent,
          totalLeads,
          vacantBeds: totalProperties - occupiedProperties
        },
        revenueIntelligence: {
          trend: revenueTrend,
          byType: revenueByType,
          averageRent: totalProperties > 0 ? (revenueThisMonth / totalProperties) : 0
        },
        occupancyMap: roomStatusGrid,
        leadFunnel: {
          total: totalLeads,
          funnel: [
            { stage: 'Inquiries', value: currentMonthLeads },
            { stage: 'Visits', value: funnel.visits },
            { stage: 'Booked', value: funnel.booked },
            { stage: 'Converted', value: funnel.converted }
          ]
        },
        insights,
        tenantHealth: {
          atRisk: allTenants.filter(t => t.Payments.length < 2 && new Date(t.startDate) < new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)).length
        }
      });
    } catch (err) {
      console.error("Dashboard comprehensive error:", err);
      res.status(500).json({ error: "Failed to fetch comprehensive stats" });
    }
  },
};

export default DashboardController;