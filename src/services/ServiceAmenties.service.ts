
import { logger } from "../utils/logger.js";
import { ServiceDao, AmentiesDao } from "../dao/serives&Amenties.dao.js";

export class ServiceService {
    private serviceDao: ServiceDao;

    constructor() {
        this.serviceDao = new ServiceDao();
    }

    async createService(data:any) {
        logger.info("ServiceService -> createService called", { data });
        if (!data.name) throw new Error("Service name is required");
        return this.serviceDao.createService(data);
    }

    async getAllServices(filter = {}) {
        logger.info("ServiceService -> getAllServices called");
        return this.serviceDao.getAllServices(filter);
    }

    async getServiceById(id: string) {
        logger.info("ServiceService -> getServiceById called", { id });
        const service = await this.serviceDao.getServiceById(id);
        if (!service) throw new Error("Service not found");
        return service;
    }

    async updateService(id: string, data: any) {
        logger.info("ServiceService -> updateService called", { id, data });
        const service = await this.serviceDao.updateService(id, data);
        if (!service) throw new Error("Service not found");
        return service;
    }

    async deleteService(id: string) {
        logger.info("ServiceService -> deleteService called", { id });
        const service = await this.serviceDao.deleteService(id);
        if (!service) throw new Error("Service not found");
        return service;
    }
}

export class AmentiesService {
    private amentiesDao: AmentiesDao;

    constructor() {
        this.amentiesDao = new AmentiesDao();
    }

    async createAmenties(data:any) {
        logger.info("AmentiesService -> createAmenties called", { data });
        if (!data.name) throw new Error("Amenity name is required");
        return this.amentiesDao.createAmenties(data);
    }

    async getAllAmenties(filter = {}) {
        logger.info("AmentiesService -> getAllAmenties called");
        return this.amentiesDao.getAllAmenties(filter);
    }

    async getAmentiesById(id: string) {
        logger.info("AmentiesService -> getAmentiesById called", { id });
        const amenity = await this.amentiesDao.getAmentiesById(id);
        if (!amenity) throw new Error("Amenity not found");
        return amenity;
    }

    async updateAmenties(id: string, data: any) {
        logger.info("AmentiesService -> updateAmenties called", { id, data });
        const amenity = await this.amentiesDao.updateAmenties(id, data);
        if (!amenity) throw new Error("Amenity not found");
        return amenity;
    }

    async deleteAmenties(id: string) {
        logger.info("AmentiesService -> deleteAmenties called", { id });
        const amenity = await this.amentiesDao.deleteAmenties(id);
        if (!amenity) throw new Error("Amenity not found");
        return amenity;
    }
}