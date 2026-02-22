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
      const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const startOfLast7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startOfPrevious7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const parseSafe = (val: any) => parseFloat(String(val || "0").replace(/[^0-9.]/g, "")) || 0;

      // 1. Batch all core counts and data fetches
      const [
        allTenants,
        allConvertedLeads,
        totalProperties,
        occupiedProperties,
        previousOccupiedProperties,
        totalLeads,
        newLeads7Days,
        previousLeads7Days,
        confirmedBookingsCount,
        previousConfirmedBookings,
        recentLeads,
        revenueByType,
        monthlyTrends,
        recentProperties,
        revenueData
      ] = await Promise.all([
        Tenant.find().lean(),
        Leads.find({ status: 'converted' }).lean(),
        Property.countDocuments(),
        Property.countDocuments({ availability: false }),
        Property.countDocuments({ availability: false, updatedAt: { $lt: startOfLast7Days } }),
        Leads.countDocuments(),
        Leads.countDocuments({ createdAt: { $gte: startOfLast7Days } }),
        Leads.countDocuments({ createdAt: { $gte: startOfPrevious7Days, $lt: startOfLast7Days } }),
        Appointment.countDocuments({ status: 'Confirmed', createdAt: { $gte: startOfLast7Days } }),
        Appointment.countDocuments({ status: 'Confirmed', createdAt: { $gte: startOfPrevious7Days, $lt: startOfLast7Days } }),
        Leads.find().sort({ createdAt: -1 }).limit(4).lean(),
        Property.aggregate([
          { $match: { availability: false } },
          {
            $group: {
              _id: "$category",
              total: { $sum: { $toDouble: "$rate" } },
              count: { $sum: 1 }
            }
          },
          { $project: { _id: { $ifNull: ["$_id", "other"] }, total: 1, count: 1 } }
        ]),
        Tenant.aggregate([
          { $unwind: "$Payments" },
          { $match: { "Payments.dateOfPayment": { $gte: sixMonthsAgo } } },
          {
            $group: {
              _id: {
                year: { $year: "$Payments.dateOfPayment" },
                month: { $month: "$Payments.dateOfPayment" }
              },
              total: { $sum: { $toDouble: "$Payments.amount" } }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]),
        Property.find().sort({ updatedAt: -1 }).limit(10).lean(),
        Tenant.aggregate([
          {
            $facet: {
              currentMonth: [
                { $unwind: "$Payments" },
                { $match: { "Payments.dateOfPayment": { $gte: startOfCurrentMonth } } },
                { $group: { _id: null, total: { $sum: { $toDouble: "$Payments.amount" } } } }
              ],
              lastMonth: [
                { $unwind: "$Payments" },
                { $match: { "Payments.dateOfPayment": { $gte: startOfLastMonth, $lt: startOfCurrentMonth } } },
                { $group: { _id: null, total: { $sum: { $toDouble: "$Payments.amount" } } } }
              ]
            }
          }
        ])
      ]);

      // 2. Process KPIs and Growth
      const currentOccupancyRate = totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0;
      const previousOccupancyRate = totalProperties > 0 ? (previousOccupiedProperties / totalProperties) * 100 : 0;
      const occupancyGrowth = previousOccupancyRate > 0 ? ((currentOccupancyRate - previousOccupancyRate) / previousOccupancyRate) * 100 : 0;

      const leadGrowth = previousLeads7Days > 0 ? ((newLeads7Days - previousLeads7Days) / previousLeads7Days) * 100 : 0;
      const bookingGrowth = previousConfirmedBookings > 0 ? ((confirmedBookingsCount - previousConfirmedBookings) / previousConfirmedBookings) * 100 : 0;

      const revenueThisMonth = revenueData[0].currentMonth[0]?.total || 0;
      const revenueLastMonth = revenueData[0].lastMonth[0]?.total || 0;
      const revenueGrowth = revenueLastMonth > 0 ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 : 0;

      // Projected Revenue
      const projectedRevenue = allTenants.reduce((sum, t: any) => {
        const rent = parseSafe(t.rent);
        const members = parseSafe(t.members) || 1;
        return sum + (rent * members);
      }, 0);

      const outstandingRent = allTenants.reduce((sum, t: any) => {
        const hasPaidThisMonth = (t.Payments || []).some((p: any) => p.dateOfPayment && new Date(p.dateOfPayment) >= startOfCurrentMonth);
        if (!hasPaidThisMonth && t.startDate && new Date(t.startDate) < startOfCurrentMonth) {
          return sum + parseSafe(t.rent);
        }
        return sum;
      }, 0);

      // 3. Occupancy Map Grid (limited to 60 for performance)
      const roomStatusGrid = recentProperties.slice(0, 60).map(p => ({
        id: p._id,
        name: p.property_name || "Unknown Unit",
        flatNo: (p as any).flat_no || "N/A",
        status: !p.availability ? 'occupied' : 'vacant',
        rent: parseSafe(p.rate),
        type: p.category || "pg"
      }));

      // Recent Flats
      const recentFlats = recentProperties.slice(0, 6).map(p => ({
        id: p._id,
        name: p.property_name,
        flatNo: (p as any).flat_no,
        status: !p.availability ? 'Occupied' : 'Vacant',
        price: p.rate
      }));

      // Recent Tenants
      const recentTenantsData = allTenants
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6)
        .map(t => ({
          id: t._id,
          name: t.name || (t.tenantDetails && t.tenantDetails[0]?.name) || "N/A",
          flatNo: t.flatNo,
          rent: t.rent,
          propertyId: t.property_id
        }));

      // 4. Funnel and Trends
      const funnel = {
        visits: await Leads.countDocuments({ status: 'inquiry' }), // Inquiry count can be batched too if needed
        booked: await Leads.countDocuments({ status: 'contacted' }),
        converted: allConvertedLeads.length
      };

      // Fill in months for trends (handle missing months in db)
      const trends = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthNum = d.getMonth() + 1;
        const yearNum = d.getFullYear();
        const found = monthlyTrends.find(t => t._id.month === monthNum && t._id.year === yearNum);
        trends.push({
          month: d.toLocaleString('default', { month: 'short' }),
          amount: found?.total || 0
        });
      }

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
      const pgProp = (revenueByType as any[]).find(r => r._id === 'pg');
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

      // Trends for AnalyticalCharts (Last 6 Months)
      const monthsToFetch = 6;
      const trendMonths = [];
      for (let i = monthsToFetch - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        trendMonths.push({
          month: d.toLocaleString('default', { month: 'short' }),
          date: new Date(d.getFullYear(), d.getMonth(), 1)
        });
      }

      const getMonthlyCounts = (data: any[], dateField: string) => {
        return trendMonths.map(m => ({
          month: m.month,
          count: data.filter(item => {
            const itemDate = new Date(item[dateField]);
            return itemDate.getMonth() === m.date.getMonth() && itemDate.getFullYear() === m.date.getFullYear();
          }).length
        }));
      };

      const trends = {
        users: getMonthlyCounts(allTenants, 'createdAt'), // Assuming tenants as "users" for dashboard
        leads: getMonthlyCounts(recentLeads, 'createdAt'), // Using recentLeads for trend if total matches
        properties: getMonthlyCounts(recentProperties, 'updatedAt')
      };

      const stats = {
        kpis: {
          totalUsers: (allTenants as any).reduce((acc: any, curr: any) => acc + (parseInt(curr.members) || 1), 0),
          activeUsers: allTenants.length,
          totalProperties,
          occupiedProperties,
          totalLeads,
          totalAppointments: confirmedBookingsCount,
          totalRevenue: projectedRevenue,
          projectedRevenue,
          occupancyRate: totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0,
          vacantBeds: totalProperties - occupiedProperties, // Placeholder
          outstandingRent: outstandingRent // Placeholder
        },
        revenueIntelligence: {
          trend: monthlyTrends,
          byType: revenueByType
        },
        trends,
        recentFlats,
        recentTenants: recentTenantsData,
        smartQueue,
        insights,
        tenantHealth: {
          atRisk: allTenants.filter((t: any) => (t.Payments || []).length < 2 && t.startDate && new Date(t.startDate) < new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)).length,
          retention: `${avgRetention.toFixed(1)} Months`,
          resolutionVelocity: `${avgVelocity.toFixed(1)} Hours`
        }
      };

      res.status(200).json(stats);
    } catch (err) {
      console.error("Dashboard comprehensive error:", err);
      res.status(500).json({ error: "Failed to fetch comprehensive stats" });
    }
  },
};

export default DashboardController;