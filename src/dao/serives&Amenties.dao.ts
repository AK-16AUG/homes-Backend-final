import {
  ServiceModel,
  AmenityModel,
  ServiceType,
  
} from "../entities/serives&Amenties.entity.js";
import { logger } from "../utils/logger.js";

export class ServiceDao {
  async createService(data: Partial<ServiceType>) {
    logger.info("ServiceDao -> createService called", { data });
    try {
      const result = await ServiceModel.create(data);
      logger.info("ServiceDao -> createService success", { id: result._id });
      return result;
    } catch (error: any) {
      logger.error("ServiceDao -> createService error", {
        error: error.message,
      });
      throw error;
    }
  }

  async getServiceById(id: string) {
    logger.info("ServiceDao -> getServiceById called", { id });
    try {
      const result = await ServiceModel.findById(id);
      if (result) {
        logger.info("ServiceDao -> getServiceById success", { id });
      } else {
        logger.warn("ServiceDao -> getServiceById not found", { id });
      }
      return result;
    } catch (error: any) {
      logger.error("ServiceDao -> getServiceById error", {
        id,
        error: error.message,
      });
      throw error;
    }
  }

  async getAllServices(filter = {}) {
    logger.info("ServiceDao -> getAllServices called", { filter });
    try {
      const result = await ServiceModel.find(filter);
      logger.info("ServiceDao -> getAllServices success", {
        count: result.length,
      });
      return result;
    } catch (error: any) {
      logger.error("ServiceDao -> getAllServices error", {
        error: error.message,
      });
      throw error;
    }
  }

  async updateService(id: string, data: Partial<ServiceType>) {
    logger.info("ServiceDao -> updateService called", { id, data });
    try {
      const result = await ServiceModel.findByIdAndUpdate(id, data, {
        new: true,
      });
      if (result) {
        logger.info("ServiceDao -> updateService success", { id });
      } else {
        logger.warn("ServiceDao -> updateService not found", { id });
      }
      return result;
    } catch (error: any) {
      logger.error("ServiceDao -> updateService error", {
        id,
        error: error.message,
      });
      throw error;
    }
  }

  async deleteService(id: string) {
    logger.info("ServiceDao -> deleteService called", { id });
    try {
      const result = await ServiceModel.findByIdAndDelete(id);
      if (result) {
        logger.info("ServiceDao -> deleteService success", { id });
      } else {
        logger.warn("ServiceDao -> deleteService not found", { id });
      }
      return result;
    } catch (error: any) {
      logger.error("ServiceDao -> deleteService error", {
        id,
        error: error.message,
      });
      throw error;
    }
  }
}

export class AmentiesDao {
  async createAmenties(data: any) {
    logger.info("AmentiesDao -> createAmenties called", { data });
    try {
      const result = await AmenityModel.create(data);
      logger.info("AmentiesDao -> createAmenties success", { id: result._id });
      return result;
    } catch (error: any) {
      logger.error("AmentiesDao -> createAmenties error", {
        error: error.message,
      });
      throw error;
    }
  }

  async getAmentiesById(id: string) {
    logger.info("AmentiesDao -> getAmentiesById called", { id });
    try {
      const result = await AmenityModel.findById(id);
      if (result) {
        logger.info("AmentiesDao -> getAmentiesById success", { id });
      } else {
        logger.warn("AmentiesDao -> getAmentiesById not found", { id });
      }
      return result;
    } catch (error: any) {
      logger.error("AmentiesDao -> getAmentiesById error", {
        id,
        error: error.message,
      });
      throw error;
    }
  }

  async getAllAmenties(filter = {}) {
    logger.info("AmentiesDao -> getAllAmenties called", { filter });
    try {
      const result = await AmenityModel.find(filter);
      logger.info("AmentiesDao -> getAllAmenties success", {
        count: result.length,
      });
      return result;
    } catch (error: any) {
      logger.error("AmentiesDao -> getAllAmenties error", {
        error: error.message,
      });
      throw error;
    }
  }

  async updateAmenties(id: string, data: any) {
    logger.info("AmentiesDao -> updateAmenties called", { id, data });
    try {
      const result = await AmenityModel.findByIdAndUpdate(id, data, {
        new: true,
      });
      if (result) {
        logger.info("AmentiesDao -> updateAmenties success", { id });
      } else {
        logger.warn("AmentiesDao -> updateAmenties not found", { id });
      }
      return result;
    } catch (error: any) {
      logger.error("AmentiesDao -> updateAmenties error", {
        id,
        error: error.message,
      });
      throw error;
    }
  }

  async deleteAmenties(id: string) {
    logger.info("AmentiesDao -> deleteAmenties called", { id });
    try {
      const result = await AmenityModel.findByIdAndDelete(id);
      if (result) {
        logger.info("AmentiesDao -> deleteAmenties success", { id });
      } else {
        logger.warn("AmentiesDao -> deleteAmenties not found", { id });
      }
      return result;
    } catch (error: any) {
      logger.error("AmentiesDao -> deleteAmenties error", { id });
    }
  }
}
