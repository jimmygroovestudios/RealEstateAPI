import { Request, Response, NextFunction } from 'express';
import toolsService from './tools.service';

class ToolsController {
  async calculateMortgage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = toolsService.calculateMortgage(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async calculateAffordability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = toolsService.calculateAffordability(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentRates(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rates = toolsService.getCurrentRates();
      res.json({ success: true, data: rates });
    } catch (error) {
      next(error);
    }
  }

  async prequalify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = toolsService.prequalify(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export default new ToolsController();
