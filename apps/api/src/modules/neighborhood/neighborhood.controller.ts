import { Request, Response, NextFunction } from 'express';
import neighborhoodService from './neighborhood.service';

class NeighborhoodController {
  async getNeighborhood(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { zipCode } = req.params;
      const neighborhood = await neighborhoodService.getNeighborhoodByZip(zipCode);

      res.json({ success: true, data: neighborhood });
    } catch (error) {
      next(error);
    }
  }

  async getSchools(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { zipCode } = req.params;
      const schools = await neighborhoodService.getSchools(zipCode);

      res.json({ success: true, data: schools });
    } catch (error) {
      next(error);
    }
  }

  async getCrimeStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { zipCode } = req.params;
      const crime = await neighborhoodService.getCrimeStats(zipCode);

      res.json({ success: true, data: crime });
    } catch (error) {
      next(error);
    }
  }

  async getCommuteTime(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { zipCode } = req.params;
      const { destination } = req.body;
      const commute = await neighborhoodService.getCommuteTime(zipCode, destination);

      res.json({ success: true, data: commute });
    } catch (error) {
      next(error);
    }
  }

  async getDemographics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { zipCode } = req.params;
      const demographics = await neighborhoodService.getDemographics(zipCode);

      res.json({ success: true, data: demographics });
    } catch (error) {
      next(error);
    }
  }

  async getMarketTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { zipCode } = req.params;
      const trends = await neighborhoodService.getMarketTrends(zipCode);

      res.json({ success: true, data: trends });
    } catch (error) {
      next(error);
    }
  }

  async getHotMarkets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const markets = await neighborhoodService.getHotMarkets(limit);

      res.json({ success: true, data: markets });
    } catch (error) {
      next(error);
    }
  }

  async getMarketForecast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { zipCode } = req.params;
      const forecast = await neighborhoodService.getMarketForecast(zipCode);

      res.json({ success: true, data: forecast });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await neighborhoodService.getInventoryStats();

      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}

export default new NeighborhoodController();
