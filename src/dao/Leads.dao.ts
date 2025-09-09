import { RealEstateLeadModel } from "../entities/Leads.js";
import { logger } from "../utils/logger.js";
import { Types } from "mongoose";

export class LeadsDao {
    async createLead(data: any) {
        logger.info("LeadsDao -> createLead called", { data });
        try {
            const result = await RealEstateLeadModel.create(data);
            logger.info("LeadsDao -> createLead success", { id: result._id });
            return result;
        } catch (error: any) {
            logger.error("LeadsDao -> createLead error", { error: error.message });
            throw error;
        }
    }

    async getLeadById(id: string) {
        logger.info("LeadsDao -> getLeadById called", { id });
        try {
            const result = await RealEstateLeadModel.findById(id)
                .populate('user_id', 'name email phone')
                .populate('matchedProperties', 'title price location');
            if (result) {
                logger.info("LeadsDao -> getLeadById success", { id });
            } else {
                logger.warn("LeadsDao -> getLeadById not found", { id });
            }
            return result;
        } catch (error: any) {
            logger.error("LeadsDao -> getLeadById error", { id, error: error.message });
            throw error;
        }
    }

    async getAllLeads(filter = {}, page = 1, limit = 10) {
        logger.info("LeadsDao -> getAllLeads called", { filter, page, limit });
        console.log("Get all leads", filter,limit );
        
        try {
            const skip = (page - 1) * limit;
            const [results, total] = await Promise.all([
                RealEstateLeadModel.find(filter)
                    .populate('matchedProperties')
                    .sort({ timestamp: -1 })
                    .skip(skip)
                    .limit(limit),
                RealEstateLeadModel.countDocuments(filter)
            ]);
            logger.info("LeadsDao -> getAllLeads success", { count: results.length, total });
            return { results, total, page, limit };
        } catch (error: any) {
            logger.error("LeadsDao -> getAllLeads error", { error: error.message });
            throw error;
        }
    }

    async updateLead(id: string, data: any) {
        logger.info("LeadsDao -> updateLead called", { id, data });
        try {
            const result = await RealEstateLeadModel.findByIdAndUpdate(
                id, 
                data, 
                { new: true }
            )
                .populate('matchedProperties', 'title price location');
            if (result) {
                logger.info("LeadsDao -> updateLead success", { id });
            } else {
                logger.warn("LeadsDao -> updateLead not found", { id });
            }
            return result;
        } catch (error: any) {
            logger.error("LeadsDao -> updateLead error", { id, error: error.message });
            throw error;
        }
    }

    async deleteLead(id: string) {
        logger.info("LeadsDao -> deleteLead called", { id });
        try {
            const result = await RealEstateLeadModel.findByIdAndDelete(id);
            if (result) {
                logger.info("LeadsDao -> deleteLead success", { id });
            } else {
                logger.warn("LeadsDao -> deleteLead not found", { id });
            }
            return result;
        } catch (error: any) {
            logger.error("LeadsDao -> deleteLead error", { id, error: error.message });
            throw error;
        }
    }

    async getLeadsByStatus(status: string) {
        logger.info("LeadsDao -> getLeadsByStatus called", { status });
        try {
            const result = await RealEstateLeadModel.findLeadsByStatus(status);
            logger.info("LeadsDao -> getLeadsByStatus success", { count: result.length });
            return result;
        } catch (error: any) {
            logger.error("LeadsDao -> getLeadsByStatus error", { error: error.message });
            throw error;
        }
    }

    async getLeadsByUser(userId: string) {
        logger.info("LeadsDao -> getLeadsByUser called", { userId });
        try {
            const result = await RealEstateLeadModel.findLeadsByUser(new Types.ObjectId(userId));
            logger.info("LeadsDao -> getLeadsByUser success", { count: result.length });
            return result;
        } catch (error: any) {
            logger.error("LeadsDao -> getLeadsByUser error", { error: error.message });
            throw error;
        }
    }
    async getLeadsByUserEmail(email: string) {
        logger.info("LeadsDao -> getLeadsByUserEmail called", { email });
        try {
          const result = await RealEstateLeadModel.findOne({ "contactInfo.email": email });

            logger.info("LeadsDao -> getLeadsByUserEmail success");
            return result;
        } catch (error: any) {
            logger.error("LeadsDao -> getLeadsByUser error", { error: error.message });
            throw error;
        }
    }

    async countAllLeads() {
        logger.info("LeadsDao -> countAllLeads called");
        try {
            const count = await RealEstateLeadModel.countDocuments();
            logger.info("LeadsDao -> countAllLeads success", { count });
            return count;
        } catch (error: any) {
            logger.error("LeadsDao -> countAllLeads error", { error: error.message });
            throw error;
        }
    }
}