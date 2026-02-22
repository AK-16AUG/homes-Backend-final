import Tenant from "../entities/tenant.entity.js";
import { logger } from "../utils/logger.js";
import { Types } from "mongoose";

export default class TenantDao {
  private tenant = Tenant;

  async createTenant(data: any) {
    logger.info("TenantDao -> createTenant called", { data });
    try {
      const result = await this.tenant.create(data);
      logger.info("TenantDao -> createTenant success", { id: result._id });
      return result;
    } catch (error: any) {
      logger.error("TenantDao -> createTenant error", { error: error.message });
      throw error;
    }
  }

  async addPayment(tenantId: string, userId: string, payment: { dateOfPayment: Date; modeOfPayment: "cash" | "online" }) {
    logger.info("TenantDao -> addPayment called", { tenantId, userId, payment });
    try {
      const paymentWithUser = { ...payment, user_id: userId };
      const result = await this.tenant.findByIdAndUpdate(
        tenantId,
        { $push: { Payments: paymentWithUser } },
        { new: true }
      )
        .populate("users", "-password")
        .populate("property_id");

      if (result) {
        logger.info("TenantDao -> addPayment success", { tenantId });
      } else {
        logger.warn("TenantDao -> addPayment not found", { tenantId });
      }

      return result;
    } catch (error: any) {
      logger.error("TenantDao -> addPayment error", {
        tenantId,
        error: error.message,
      });
      throw error;
    }
  }

  async getTenantById(id: string) {
    logger.info("TenantDao -> getTenantById called", { id });
    try {
      const result = await this.tenant
        .findById(id)
        .populate("users", "-password")
        .populate("property_id").populate("Payments.user_id", "-password");

      if (result) {
        logger.info("TenantDao -> getTenantById success", { id });
      } else {
        logger.warn("TenantDao -> getTenantById not found", { id });
      }
      return result;
    } catch (error: any) {
      logger.error("TenantDao -> getTenantById error", { id, error: error.message });
      throw error;
    }
  }

  async getTenantsByUserId(userId: string) {
    logger.info("TenantDao -> getTenantsByUserId called", { userId });
    try {
      const result = await this.tenant
        .find({ users: userId })
        .populate("users", "-password")
        .populate("property_id");

      if (result.length) {
        logger.info("TenantDao -> getTenantsByUserId success", { userId });
      } else {
        logger.warn("TenantDao -> getTenantsByUserId not found", { userId });
      }

      return result;
    } catch (error: any) {
      logger.error("TenantDao -> getTenantsByUserId error", { userId, error: error.message });
      throw error;
    }
  }

  async getTenantsByPropertyId(propertyId: string) {
    logger.info("TenantDao -> getTenantsByPropertyId called", { propertyId });
    try {
      const result = await this.tenant
        .find({ property_id: propertyId })
        .populate("users", "-password")
        .populate("property_id");

      if (result.length) {
        logger.info("TenantDao -> getTenantsByPropertyId success", { propertyId });
      } else {
        logger.warn("TenantDao -> getTenantsByPropertyId not found", { propertyId });
      }

      return result;
    } catch (error: any) {
      logger.error("TenantDao -> getTenantsByPropertyId error", { propertyId, error: error.message });
      throw error;
    }
  }

  async getAllTenants({ page = 1, limit = 10, search = "" }) {
    logger.info("TenantDao -> getAllTenants called", { page, limit, search });

    try {
      const skip = (page - 1) * limit;

      const filter: any = {};

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { flatNo: { $regex: search, $options: "i" } },
          { society: { $regex: search, $options: "i" } }
        ];
      }

      const [result, total] = await Promise.all([
        this.tenant
          .find(filter)
          .populate("users", "-password")
          .populate("property_id")
          .skip(skip)
          .limit(limit)
          .lean(),
        this.tenant.countDocuments(filter),
      ]);

      logger.info("TenantDao -> getAllTenants success", { count: result.length });

      return {
        data: result,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      };
    } catch (error: any) {
      logger.error("TenantDao -> getAllTenants error", { error: error.message });
      throw error;
    }
  }

  async updateTenant(id: string, data: any) {
    logger.info("TenantDao -> updateTenant called", { id, data });
    try {
      const result = await this.tenant
        .findByIdAndUpdate(id, data, { new: true })
        .populate("users", "-password")
        .populate("property_id");

      if (result) {
        logger.info("TenantDao -> updateTenant success", { id });
      } else {
        logger.warn("TenantDao -> updateTenant not found", { id });
      }

      return result;
    } catch (error: any) {
      logger.error("TenantDao -> updateTenant error", { id, error: error.message });
      throw error;
    }
  }

  async deleteTenant(id: string) {
    logger.info("TenantDao -> deleteTenant called", { id });
    try {
      const result = await this.tenant.findByIdAndDelete(id);
      if (result) {
        logger.info("TenantDao -> deleteTenant success", { id });
      } else {
        logger.warn("TenantDao -> deleteTenant not found", { id });
      }

      return result;
    } catch (error: any) {
      logger.error("TenantDao -> deleteTenant error", { id, error: error.message });
      throw error;
    }
  }

  // New DAO methods for additional functionality
  async addUserToTenant(tenantId: string, userId: string) {
    logger.info("TenantDao -> addUserToTenant called", { tenantId, userId });
    try {
      const result = await this.tenant.findByIdAndUpdate(
        tenantId,
        { $addToSet: { users: userId } },
        { new: true }
      )
        .populate("users", "-password")
        .populate("property_id");

      if (result) {
        logger.info("TenantDao -> addUserToTenant success", { tenantId });
      } else {
        logger.warn("TenantDao -> addUserToTenant not found", { tenantId });
      }

      return result;
    } catch (error: any) {
      logger.error("TenantDao -> addUserToTenant error", { tenantId, error: error.message });
      throw error;
    }
  }

  async removeUserFromTenant(tenantId: string, userId: string) {
    logger.info("TenantDao -> removeUserFromTenant called", { tenantId, userId });
    console.log(userId);
    const tenant: any = await this.tenant.findById(tenantId);
    const currentMembers = parseInt(tenant.members) || 0;
    try {
      const result = await this.tenant.findByIdAndUpdate(
        tenantId,
        {
          $set: { members: (currentMembers - 1).toString() },
          $pull: { users: userId }
        },
        { new: true }
      ).populate("users", "-password")
        .populate("property_id");

      if (result) {
        logger.info("TenantDao -> removeUserFromTenant success", { tenantId });
      } else {
        logger.warn("TenantDao -> removeUserFromTenant not found", { tenantId });
      }

      return result;
    } catch (error: any) {
      logger.error("TenantDao -> removeUserFromTenant error", { tenantId, error: error.message });
      throw error;
    }
  }

  async getPaymentsByTenantId(tenantId: string) {
    logger.info("TenantDao -> getPaymentsByTenantId called", { tenantId });
    try {
      const result = await this.tenant
        .findById(tenantId)
        .select("Payments")
        .populate("Payments.user_id", "-password");

      if (result) {
        logger.info("TenantDao -> getPaymentsByTenantId success", { tenantId });
        return result.Payments;
      } else {
        logger.warn("TenantDao -> getPaymentsByTenantId not found", { tenantId });
        return null;
      }
    } catch (error: any) {
      logger.error("TenantDao -> getPaymentsByTenantId error", { tenantId, error: error.message });
      throw error;
    }
  }

  async getTenantsByFilters(filters: {
    propertyType?: "Pg" | "Normal";
    minRent?: number;
    maxRent?: number;
    society?: string;
  }) {
    logger.info("TenantDao -> getTenantsByFilters called", { filters });
    try {
      const query: any = {};

      if (filters.propertyType) {
        query.property_type = filters.propertyType;
      }

      if (filters.minRent !== undefined || filters.maxRent !== undefined) {
        query.rent = {};
        if (filters.minRent !== undefined) {
          query.rent.$gte = filters.minRent;
        }
        if (filters.maxRent !== undefined) {
          query.rent.$lte = filters.maxRent;
        }
      }

      if (filters.society) {
        query.society = { $regex: filters.society, $options: "i" };
      }

      const result = await this.tenant
        .find(query)
        .populate("users", "-password")
        .populate("property_id");

      logger.info("TenantDao -> getTenantsByFilters success", { count: result.length });
      return result;
    } catch (error: any) {
      logger.error("TenantDao -> getTenantsByFilters error", { error: error.message });
      throw error;
    }
  }

  async deleteAllTenantsByPropertyId(propertyId: string) {
    logger.info("TenantDao -> deleteAllTenantsByPropertyId called", { propertyId });
    try {
      const result = await this.tenant.deleteMany({ property_id: propertyId });
      logger.info("TenantDao -> deleteAllTenantsByPropertyId success", { propertyId, deletedCount: result.deletedCount });
      return result;
    } catch (error: any) {
      logger.error("TenantDao -> deleteAllTenantsByPropertyId error", { propertyId, error: error.message });
      throw error;
    }
  }
}