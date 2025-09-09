import { Request, Response } from "express";
import TenantServices from "../services/Tenant.service.js";
import statusCode from "../common/constant/StatusCode.js";
import errorResponse from "../common/constant/Error.js";

const tenantService = new TenantServices();

export default class TenantController {
  async createTenant(req: Request, res: Response) {
    try {
      const tenant = await tenantService.createTenant(req.body);
      return res
        .status(statusCode.CREATED)
        .json({ message: "Tenant created successfully", data: tenant });
    } catch (error: any) {
      return res.status(statusCode.BAD_REQUEST).json({
        error: errorResponse.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async getTenantById(req: Request, res: Response) {
    try {
      const tenant = await tenantService.getTenantById(req.params.id);
      return res.status(statusCode.OK).json({ data: tenant });
    } catch (error: any) {
      return res.status(statusCode.NOT_FOUND).json({
        error: errorResponse.USER_NOT_FOUND,
        message: error.message,
      });
    }
  }

  async getTenantsByUserId(req: Request, res: Response) {
    try {
      const tenants = await tenantService.getTenantsByUserId(req.params.userId);
      return res.status(statusCode.OK).json({ data: tenants });
    } catch (error: any) {
      if (error.message.includes("No tenants found")) {
        return res.status(statusCode.NOT_FOUND).json({
          error: errorResponse.USER_NOT_FOUND,
          message: error.message,
        });
      }
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        error: errorResponse.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async getTenantsByPropertyId(req: Request, res: Response) {
    try {
      const tenants = await tenantService.getTenantsByPropertyId(req.params.propertyId);
      return res.status(statusCode.OK).json({ data: tenants });
    } catch (error: any) {
      if (error.message.includes("No tenants found")) {
        return res.status(statusCode.NOT_FOUND).json({
          error: errorResponse.PROPERTY_NOT_FOUND,
          message: error.message,
        });
      }
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        error: errorResponse.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async getAllTenants(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const tenants = await tenantService.getAllTenants({ 
        page: Number(page), 
        limit: Number(limit), 
        search: String(search) 
      });
      return res.status(statusCode.OK).json(tenants);
    } catch (error: any) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        error: errorResponse.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async updateTenant(req: Request, res: Response) {
    try {
      const tenant = await tenantService.updateTenant(req.params.id, req.body);
      return res.status(statusCode.OK).json({ 
        message: "Tenant updated successfully", 
        data: tenant 
      });
    } catch (error: any) {
      if (error.message.includes("Tenant not found")) {
        return res.status(statusCode.NOT_FOUND).json({
          error: errorResponse.USER_NOT_FOUND,
          message: error.message,
        });
      }
      return res.status(statusCode.BAD_REQUEST).json({
        error: errorResponse.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async deleteTenant(req: Request, res: Response) {
    try {
      await tenantService.deleteTenant(req.params.id);
      return res.status(statusCode.OK).json({ 
        message: "Tenant deleted successfully" 
      });
    } catch (error: any) {
      if (error.message.includes("Tenant not found")) {
        return res.status(statusCode.NOT_FOUND).json({
          error: errorResponse.USER_NOT_FOUND,
          message: error.message,
        });
      }
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        error: errorResponse.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async addPayment(req: Request, res: Response) {
    try {
      const { tenantId} = req.params;
      const{user_id }=req.body
      const updatedTenant = await tenantService.addPayment(
        tenantId,
        user_id,
        req.body
      );
      return res.status(statusCode.OK).json({ 
        message: "Payment added successfully", 
        data: updatedTenant 
      });
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return res.status(statusCode.NOT_FOUND).json({
          error: errorResponse.USER_NOT_FOUND,
          message: error.message,
        });
      }
      return res.status(statusCode.BAD_REQUEST).json({
        error: errorResponse.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async addUserToTenant(req: Request, res: Response) {
    try {
      const { tenantId } = req.params;
      const { userIdentifier } = req.body;
      
      const updatedTenant = await tenantService.addUserToTenant(
        tenantId, 
        userIdentifier
      );
      return res.status(statusCode.OK).json({ 
        message: "User added to tenant successfully", 
        data: updatedTenant 
      });
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return res.status(statusCode.NOT_FOUND).json({
          error: errorResponse.USER_NOT_FOUND,
          message: error.message,
        });
      }
      return res.status(statusCode.BAD_REQUEST).json({
        error: errorResponse.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async removeUserFromTenant(req: Request, res: Response) {
    try {
      const { tenantId, userIdentifier } = req.params;
      
      const updatedTenant = await tenantService.removeUserFromTenant(
        tenantId, 
        userIdentifier
      );
      return res.status(statusCode.OK).json({ 
        message: "User removed from tenant successfully", 
        data: updatedTenant 
      });
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return res.status(statusCode.NOT_FOUND).json({
          error: errorResponse.USER_NOT_FOUND,
          message: error.message,
        });
      }
      return res.status(statusCode.BAD_REQUEST).json({
        error: errorResponse.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async getPaymentsByTenantId(req: Request, res: Response) {
    try {
      const payments = await tenantService.getPaymentsByTenantId(req.params.tenantId);
      return res.status(statusCode.OK).json({ data: payments });
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return res.status(statusCode.NOT_FOUND).json({
          error: errorResponse.USER_NOT_FOUND,
          message: error.message,
        });
      }
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        error: errorResponse.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async getTenantsByFilters(req: Request, res: Response) {
    try {
      const { propertyType, minRent, maxRent, society } = req.query;
      
      const tenants = await tenantService.getTenantsByFilters({
        propertyType: propertyType as "Pg" | "Normal",
        minRent: minRent ? Number(minRent) : undefined,
        maxRent: maxRent ? Number(maxRent) : undefined,
        society: society as string
      });
      
      return res.status(statusCode.OK).json({ data: tenants });
    } catch (error: any) {
      return res.status(statusCode.BAD_REQUEST).json({
        error: errorResponse.BAD_REQUEST,
        message: error.message,
      });
    }
  }
}