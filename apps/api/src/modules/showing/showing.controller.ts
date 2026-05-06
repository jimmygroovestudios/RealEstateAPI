import { Request, Response, NextFunction } from 'express';
import showingService from './showing.service';
import { Role } from '@prisma/client';

class ShowingController {
  async createShowing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const showing = await showingService.createShowing({
        ...req.body,
        buyerId: (req.user as { id: string }).id,
      });

      res.status(201).json({ success: true, data: showing });
    } catch (error) {
      next(error);
    }
  }

  async getShowing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { id } = req.params;
      const showing = await showingService.getShowingById(id, (req.user as { id: string }).id);

      res.json({ success: true, data: showing });
    } catch (error) {
      next(error);
    }
  }

  async listShowings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user) || !('role' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const user = req.user as { id: string; role: Role };
      const result = await showingService.listShowings({
        userId: user.id,
        role: user.role === 'AGENT' || user.role === 'ADMIN' ? 'AGENT' : 'BUYER',
        ...req.query as Record<string, unknown>,
      });

      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async updateShowing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { id } = req.params;
      const showing = await showingService.updateShowing(
        id,
        (req.user as { id: string }).id,
        req.body
      );

      res.json({ success: true, data: showing });
    } catch (error) {
      next(error);
    }
  }

  async cancelShowing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { id } = req.params;
      const showing = await showingService.cancelShowing(id, (req.user as { id: string }).id);

      res.json({ success: true, data: showing });
    } catch (error) {
      next(error);
    }
  }

  async addFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { id } = req.params;
      const { feedback, rating } = req.body;
      const showing = await showingService.addFeedback(
        id,
        (req.user as { id: string }).id,
        feedback,
        rating
      );

      res.json({ success: true, data: showing });
    } catch (error) {
      next(error);
    }
  }

  async getCalendar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const startDate = new Date(req.query.startDate as string || Date.now());
      const endDate = new Date(req.query.endDate as string || Date.now() + 30 * 24 * 60 * 60 * 1000);

      const showings = await showingService.getAgentCalendar(
        (req.user as { id: string }).id,
        startDate,
        endDate
      );

      res.json({ success: true, data: showings });
    } catch (error) {
      next(error);
    }
  }
}

export default new ShowingController();
