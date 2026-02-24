import { LeadsDao } from "../dao/Leads.dao.js";
import UserDao from "../dao/User.dao.js";
import TenantDao from "../dao/Tenant.dao.js";
import { logger } from "../utils/logger.js";
import { Types } from "mongoose";

export default class LeadsService {
  private leadsDao: LeadsDao;
  private userDao: UserDao;
  private tenantDao: TenantDao;
  constructor() {
    this.leadsDao = new LeadsDao();
    this.userDao = new UserDao();
    this.tenantDao = new TenantDao();
  }

  async createLead(data: {
    user_id: any;
    searchQuery: string;
    matchedProperties?: Types.ObjectId[];
    contactInfo?: {
      name?: string;
      phone?: string;
      email?: string;
    };
    status?: 'new' | 'contacted' | 'converted' | 'archived';
    notes?: string;
    source?: string;
    priority?: 'low' | 'medium' | 'high';
  }) {
    try {
      logger.info("src->services->leads.service->createLead");

      // Set default status if not provided
      if (!data.status) {
        data.status = 'new';
      }

      const createdLead = await this.leadsDao.createLead(data);
      return createdLead;
    } catch (error: any) {
      logger.error("Error creating lead in leads.service->createLead");
      logger.debug(error);
      throw new Error(error.message || "Lead creation failed");
    }
  }

  async updateLeadById(id: string, data: any) {
    try {
      logger.info("src->services->leads.service->updateLeadById");

      const updatedLead = await this.leadsDao.updateLead(id, data);
      if (!updatedLead) {
        throw new Error("Lead not found");
      }

      // Check if status changed to Converted and create User if needed
      if (data.status && (data.status.toLowerCase() === 'converted')) {
        const lead = await this.leadsDao.getLeadById(id);
        // lead has contactInfo with email, name, phone
        // We need to check if user exists, if not create.
        // The User.dao.createUser now throws error if exists, which is good.
        // But we want to handle that gracefully here (not fail the lead update).
        // Actually, we should try to create and catch error.

        if (lead && lead.contactInfo && lead.contactInfo.email) {
          try {
            let userId: Types.ObjectId | string | undefined;
            // We need a password for the new user. We can generate a random one or set a default?
            // Or we can just check if user exists.
            const existingUser = await this.userDao.findByEmail(lead.contactInfo.email);
            if (!existingUser) {
              // Create user
              const newUser = await this.userDao.createUser({
                User_Name: lead.contactInfo.name || "New User",
                email: lead.contactInfo.email,
                phone_no: lead.contactInfo.phone ? Number(lead.contactInfo.phone) : 0, // Ensure number
                password: "password123", // Default password or generated
                role: "user",
                isVerified: true // Assuming converted leads are verified?
              });
              userId = (newUser as any)._id as Types.ObjectId | string;
            } else {
              userId = (existingUser as any)._id as Types.ObjectId | string;
            }

            // Auto-create a Tenant if matched properties exist
            if (userId && lead.matchedProperties && lead.matchedProperties.length > 0) {
              const matchedPropertyId = lead.matchedProperties[0];
              await this.tenantDao.createTenant({
                name: lead.contactInfo.name || existingUser?.User_Name || "New Tenant",
                users: [userId],
                property_id: matchedPropertyId,
                startDate: new Date(),
                property_type: "Normal", // Default assumption, edit later if PG
                rent: "0",
                Payments: [],
                tenantDetails: []
              });
            }
          } catch (e) {
            logger.error("Failed to auto-create user/tenant from lead conversion", e);
            // Swallow error so lead update succeeds
          }
        }
      }

      return updatedLead;
    } catch (error: any) {
      logger.error("Error updating lead in leads.service->updateLeadById");
      logger.debug(error);
      throw new Error(error.message || "Lead update failed");
    }
  }

  async getLeadById(id: string) {
    try {
      logger.info("src->services->leads.service->getLeadById");

      const lead = await this.leadsDao.getLeadById(id);
      if (!lead) {
        throw new Error("Lead not found with the given ID");
      }

      return lead;
    } catch (error: any) {
      logger.error("Error fetching lead by ID in leads.service->getLeadById");
      logger.debug(error);
      throw new Error(error.message || "Failed to fetch lead by ID");
    }
  }

  async getAllLeads(filter = {}, page = 1, limit = 10) {
    try {
      logger.info("src->services->leads.service->getAllLeads");

      const leads = await this.leadsDao.getAllLeads(filter, page, limit);
      return leads;
    } catch (error: any) {
      logger.error("Error fetching all leads in leads.service->getAllLeads");
      logger.debug(error);
      throw new Error(error.message || "Failed to fetch leads");
    }
  }

  async deleteLeadById(id: string) {
    try {
      logger.info("src->services->leads.service->deleteLeadById");

      const deletedLead = await this.leadsDao.deleteLead(id);
      if (!deletedLead) {
        throw new Error("Lead not found");
      }

      return deletedLead;
    } catch (error: any) {
      logger.error("Error deleting lead in leads.service->deleteLeadById");
      logger.debug(error);
      throw new Error(error.message || "Lead deletion failed");
    }
  }

  async getLeadsByStatus(status: string) {
    try {
      logger.info("src->services->leads.service->getLeadsByStatus");

      const leads = await this.leadsDao.getLeadsByStatus(status);
      return leads;
    } catch (error: any) {
      logger.error("Error fetching leads by status in leads.service->getLeadsByStatus");
      logger.debug(error);
      throw new Error(error.message || "Failed to fetch leads by status");
    }
  }

  async getLeadsByUser(userId: string) {
    try {
      logger.info("src->services->leads.service->getLeadsByUser");

      const leads = await this.leadsDao.getLeadsByUser(userId);
      return leads;
    } catch (error: any) {
      logger.error("Error fetching leads by user in leads.service->getLeadsByUser");
      logger.debug(error);
      throw new Error(error.message || "Failed to fetch leads by user");
    }
  }

  async getTotalLeads() {
    try {
      logger.info("src->services->leads.service->getTotalLeads");
      const count = await this.leadsDao.countAllLeads();
      return count;
    } catch (error: any) {
      logger.error("Error counting leads in leads.service->getTotalLeads");
      logger.debug(error);
      throw new Error(error.message || "Failed to count leads");
    }
  }
}