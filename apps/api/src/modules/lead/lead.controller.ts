import { Request, Response, NextFunction } from 'express';
import leadService from './lead.service';

class LeadController {
  async createLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const lead = await leadService.createLead({
        ...req.body,
        buyerId: (req.user as { id: string }).id,
      });

      res.status(201).json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  }

  async getLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { id } = req.params;
      const lead = await leadService.getLeadById(id, (req.user as { id: string }).id);

      res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  }

  async listLeads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const result = await leadService.listLeads({
        agentId: (req.user as { id: string }).id,
        ...req.query as Record<string, unknown>,
      });

      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async updateLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { id } = req.params;
      const lead = await leadService.updateLead(
        id,
        (req.user as { id: string }).id,
        req.body
      );

      res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  }

  async addNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { id } = req.params;
      const note = await leadService.addNote(
        id,
        (req.user as { id: string }).id,
        req.body.content
      );

      res.status(201).json({ success: true, data: note });
    } catch (error) {
      next(error);
    }
  }

  async getLeadStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const stats = await leadService.getLeadStats((req.user as { id: string }).id);

      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}

export default new LeadController();
