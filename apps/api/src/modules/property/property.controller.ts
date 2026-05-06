import { Request, Response, NextFunction } from 'express';
import propertyService from './property.service';

class PropertyController {
  async createProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const property = await propertyService.createProperty({
        ...req.body,
        agentId: (req.user as { id: string }).id,
      });

      res.status(201).json({ success: true, data: property });
    } catch (error) {
      next(error);
    }
  }

  async getProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const property = await propertyService.getPropertyById(id);

      if (!property) {
        res.status(404).json({ success: false, error: { message: 'Property not found' } });
        return;
      }

      // Record view
      const userId = req.user ? (req.user as { id: string }).id : undefined;
      const sessionId = req.headers['x-session-id'] as string | undefined;
      await propertyService.recordView(id, userId, sessionId);

      res.json({ success: true, data: property });
    } catch (error) {
      next(error);
    }
  }

  async searchProperties(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await propertyService.searchProperties(req.query as Record<string, unknown>);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async updateProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { id } = req.params;
      const property = await propertyService.updateProperty(
        id,
        (req.user as { id: string }).id,
        req.body
      );

      res.json({ success: true, data: property });
    } catch (error) {
      next(error);
    }
  }

  async deleteProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { id } = req.params;
      await propertyService.deleteProperty(id, (req.user as { id: string }).id);

      res.json({ success: true, message: 'Property deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async addImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { id } = req.params;
      const image = await propertyService.addImage(
        id,
        (req.user as { id: string }).id,
        req.body
      );

      res.status(201).json({ success: true, data: image });
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { id, imageId } = req.params;
      await propertyService.deleteImage(id, imageId, (req.user as { id: string }).id);

      res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async toggleFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { id } = req.params;
      const result = await propertyService.toggleFavorite(id, (req.user as { id: string }).id);

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getUserFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await propertyService.getUserFavorites(
        (req.user as { id: string }).id,
        page,
        limit
      );

      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getPriceHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const history = await propertyService.getPriceHistory(id);

      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  async getComparables(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 5;
      const comparables = await propertyService.getComparables(id, limit);

      res.json({ success: true, data: comparables });
    } catch (error) {
      next(error);
    }
  }

  async getEstimate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const estimate = await propertyService.getEstimate(id);

      res.json({ success: true, data: estimate });
    } catch (error) {
      next(error);
    }
  }

  async getNearbyProperties(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = parseFloat(req.query.radius as string) || 5;
      const limit = parseInt(req.query.limit as string) || 10;

      const properties = await propertyService.getNearbyProperties(lat, lng, radius, limit);

      res.json({ success: true, data: properties });
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedProperties(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const properties = await propertyService.getFeaturedProperties(limit);

      res.json({ success: true, data: properties });
    } catch (error) {
      next(error);
    }
  }

  async getPropertyViews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const views = await propertyService.getPropertyViews(id);

      res.json({ success: true, data: views });
    } catch (error) {
      next(error);
    }
  }
}

export default new PropertyController();
