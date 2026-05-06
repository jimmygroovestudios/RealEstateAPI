import { Request, Response, NextFunction } from 'express';
import agentService from './agent.service';

class AgentController {
  async searchAgents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await agentService.searchAgents(req.query as Record<string, unknown>);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const agent = await agentService.getAgentById(id);
      res.json({ success: true, data: agent });
    } catch (error) {
      next(error);
    }
  }

  async getAgentReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await agentService.getAgentReviews(id, page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { id } = req.params;
      const review = await agentService.createReview(
        id,
        (req.user as { id: string }).id,
        req.body
      );
      res.status(201).json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  }

  async getAgentStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await agentService.getAgentStats(id);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const overview = await agentService.getDashboardOverview((req.user as { id: string }).id);
      res.json({ success: true, data: overview });
    } catch (error) {
      next(error);
    }
  }

  async getMyListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const status = req.query.status as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await agentService.getAgentListings(
        (req.user as { id: string }).id,
        status,
        page,
        limit
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getMyPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const period = (req.query.period as 'week' | 'month' | 'year') || 'month';
      const performance = await agentService.getAgentPerformance(
        (req.user as { id: string }).id,
        period
      );
      res.json({ success: true, data: performance });
    } catch (error) {
      next(error);
    }
  }
}

export default new AgentController();
