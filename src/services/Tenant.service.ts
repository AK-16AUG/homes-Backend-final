import PropertyDao from "../dao/Property.dao.js";
import TenantDao from "../dao/Tenant.dao.js";
import UserDao from "../dao/User.dao.js";
import { logger } from "../utils/logger.js";
import { Types } from "mongoose";

export default class TenantServices {
  private tenantDao: TenantDao;
  private userDao: UserDao;
  private propertyDao: PropertyDao;

  constructor() {
    this.tenantDao = new TenantDao();
    this.userDao = new UserDao();
    this.propertyDao = new PropertyDao();
  }

  async createTenant(data: {
    name: string;
    users: string[]; // Array of user emails or IDs
    property_id: string;
    flatNo: string;
    society: string;
    members: string;
    startDate: Date;
    rent: string;
    property_type: "Pg" | "Normal";
    Payments?: {
      dateOfPayment: Date;
      modeOfPayment: "cash" | "online";
      user_id: string;
    }[];
  }) {
    try {
      logger.info("TenantServices -> createTenant called", { data });

      const requiredFields = ["name", "property_id", "startDate", "rent", "property_type"];
      for (const field of requiredFields) {
        if (!data[field as keyof typeof data]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Convert user emails to ObjectIds
      const userIds: Types.ObjectId[] = [];
      for (const userIdentifier of data.users) {
        let user:any;
        if (userIdentifier.includes("@")) {
          user = await this.userDao.findByEmail(userIdentifier);
        } else {
          user = await this.userDao.findByUserId(userIdentifier);
        }
        
        if (!user) {
          throw new Error(`User not found: ${userIdentifier}`);
        }
        userIds.push(user._id);
      }

      // Create tenant data
      const tenantData = {
        ...data,
        users: userIds,
        property_id: new Types.ObjectId(data.property_id),
        Payments: data.Payments?.map(payment => ({
          ...payment,
          user_id: new Types.ObjectId(payment.user_id)
        }))
      };

      const tenant = await this.tenantDao.createTenant(tenantData);
      if (!tenant) {
        throw new Error("Failed to create tenant");
      }

      // Update property availability
      await this.propertyDao.updateProperty(data.property_id, { availability: false });

      return tenant;
    } catch (error: any) {
      logger.error("TenantServices -> createTenant error", {
        error: error.message,
      });
      throw new Error(error.message || "Failed to create tenant");
    }
  }

  async getTenantById(id: string) {
    try {
      logger.info("TenantServices -> getTenantById called", { id });
      const tenant = await this.tenantDao.getTenantById(id);
      if (!tenant) {
        throw new Error("Tenant not found");
      }
      return tenant;
    } catch (error: any) {
      logger.error("TenantServices -> getTenantById error", {
        id,
        error: error.message,
      });
      throw new Error(error.message || "Failed to get tenant");
    }
  }

  async getTenantsByUserId(userId: string) {
    try {
      logger.info("TenantServices -> getTenantsByUserId called", { userId });
      const tenants = await this.tenantDao.getTenantsByUserId(userId);
      if (!tenants.length) {
        throw new Error("No tenants found for this user");
      }
      return tenants;
    } catch (error: any) {
      logger.error("TenantServices -> getTenantsByUserId error", {
        userId,
        error: error.message,
      });
      throw new Error(error.message || "Failed to get tenants");
    }
  }

  async getTenantsByPropertyId(propertyId: string) {
    try {
      logger.info("TenantServices -> getTenantsByPropertyId called", {
        propertyId,
      });
      const tenants = await this.tenantDao.getTenantsByPropertyId(propertyId);
      if (!tenants.length) {
        throw new Error("No tenants found for this property");
      }
      return tenants;
    } catch (error: any) {
      logger.error("TenantServices -> getTenantsByPropertyId error", {
        propertyId,
        error: error.message,
      });
      throw new Error(error.message || "Failed to get tenants");
    }
  }

  async getAllTenants(filter: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    try {
      logger.info("TenantServices -> getAllTenants called", { filter });
      const tenants = await this.tenantDao.getAllTenants(filter);
      return tenants;
    } catch (error: any) {
      logger.error("TenantServices -> getAllTenants error", {
        error: error.message,
      });
      throw new Error(error.message || "Failed to get tenants");
    }
  }

  async updateTenant(
    id: string,
    data: Partial<{
      name: string;
      users: string[];
      property_id: string;
      flatNo: string;
      society: string;
      members: string;
      startDate: Date;
      rent: string;
      property_type: "Pg" | "Normal";
    }>
  ) {
    try {
      logger.info("TenantServices -> updateTenant called", { id, data });

      // If users are being updated, convert emails to ObjectIds
      if (data.users) {
        const userIds: Types.ObjectId[] = [];
        for (const userIdentifier of data.users) {
          let user:any;
          if (userIdentifier.includes("@")) {
            user = await this.userDao.findByEmail(userIdentifier);
          } else {
            user = await this.userDao.findByUserId(userIdentifier);
          }
          
          if (!user) {
            throw new Error(`User not found: ${userIdentifier}`);
          }
          userIds.push(user._id);
        }
        data.users = userIds as any;
      }

      const tenant = await this.tenantDao.updateTenant(id, data);
      if (!tenant) {
        throw new Error("Tenant not found");
      }
      return tenant;
    } catch (error: any) {
      logger.error("TenantServices -> updateTenant error", {
        id,
        error: error.message,
      });
      throw new Error(error.message || "Failed to update tenant");
    }
  }

  async deleteTenant(id: string) {
    try {
      logger.info("TenantServices -> deleteTenant called", { id });
      const tenant = await this.tenantDao.deleteTenant(id);
      if (!tenant) {
        throw new Error("Tenant not found");
      }
      
      // Update property availability when tenant is deleted
      await this.propertyDao.updateProperty(tenant.property_id.toString(), { 
        availability: true 
      });
      
      return tenant;
    } catch (error: any) {
      logger.error("TenantServices -> deleteTenant error", {
        id,
        error: error.message,
      });
      throw new Error(error.message || "Failed to delete tenant");
    }
  }

  async addPayment(
    tenantId: string, 
    userId: string, 
    payment: { 
      dateOfPayment: Date; 
      modeOfPayment: "cash" | "online" 
    }
  ) {
    try {
      logger.info("TenantServices -> addPayment called", { tenantId, userId, payment });

      // Validate payment data
      if (!payment.dateOfPayment || !payment.modeOfPayment) {
        throw new Error("Missing payment details (dateOfPayment or modeOfPayment)");
      }

      if (!["cash", "online"].includes(payment.modeOfPayment)) {
        throw new Error("Invalid modeOfPayment. Must be either 'cash' or 'online'");
      }

      // Verify user exists
      const user:any = await this.userDao.findByUserId(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const updatedTenant = await this.tenantDao.addPayment(tenantId, user._id, payment);
      if (!updatedTenant) {
        throw new Error("Tenant not found or payment not added");
      }

      return updatedTenant;
    } catch (error: any) {
      logger.error("TenantServices -> addPayment error", {
        tenantId,
        error: error.message,
      });
      throw new Error(error.message || "Failed to add payment");
    }
  }

  async addUserToTenant(tenantId: string, userIdentifier: string) {
    try {
      logger.info("TenantServices -> addUserToTenant called", { tenantId, userIdentifier });

      // Find user by email or ID
      let user:any;
      if (userIdentifier.includes("@")) {
        user = await this.userDao.findByEmail(userIdentifier);
      } else {
        user = await this.userDao.findByUserId(userIdentifier);
      }
      
      if (!user) {
        throw new Error("User not found");
      }

      const updatedTenant = await this.tenantDao.addUserToTenant(tenantId, user._id.toString());
      if (!updatedTenant) {
        throw new Error("Tenant not found or user not added");
      }

      return updatedTenant;
    } catch (error: any) {
      logger.error("TenantServices -> addUserToTenant error", {
        tenantId,
        error: error.message,
      });
      throw new Error(error.message || "Failed to add user to tenant");
    }
  }

  async removeUserFromTenant(tenantId: string, userIdentifier: string) {
    try {
      logger.info("TenantServices -> removeUserFromTenant called", { tenantId, userIdentifier });

      // Find user by email or ID
      let user:any;
      if (userIdentifier.includes("@")) {
        user = await this.userDao.findByEmail(userIdentifier);
      } else {
        user = await this.userDao.findByUserId(userIdentifier);
      }
      
      if (!user) {
        throw new Error("User not found");
      }

      const updatedTenant = await this.tenantDao.removeUserFromTenant(
        tenantId, 
        user._id.toString()
      );
      
      if (!updatedTenant) {
        throw new Error("Tenant not found or user not removed");
      }

      return updatedTenant;
    } catch (error: any) {
      logger.error("TenantServices -> removeUserFromTenant error", {
        tenantId,
        error: error.message,
      });
      throw new Error(error.message || "Failed to remove user from tenant");
    }
  }

  async getPaymentsByTenantId(tenantId: string) {
    try {
      logger.info("TenantServices -> getPaymentsByTenantId called", { tenantId });
      const payments = await this.tenantDao.getPaymentsByTenantId(tenantId);
      if (!payments) {
        throw new Error("Tenant not found or no payments available");
      }
      return payments;
    } catch (error: any) {
      logger.error("TenantServices -> getPaymentsByTenantId error", {
        tenantId,
        error: error.message,
      });
      throw new Error(error.message || "Failed to get payments");
    }
  }

  async getTenantsByFilters(filters: {
    propertyType?: "Pg" | "Normal";
    minRent?: number;
    maxRent?: number;
    society?: string;
  }) {
    try {
      logger.info("TenantServices -> getTenantsByFilters called", { filters });
      const tenants = await this.tenantDao.getTenantsByFilters(filters);
      return tenants;
    } catch (error: any) {
      logger.error("TenantServices -> getTenantsByFilters error", {
        error: error.message,
      });
      throw new Error(error.message || "Failed to get filtered tenants");
    }
  }
}