import { Request, Response, NextFunction } from 'express';
import authService from './auth.service';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !('id' in req.user)) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const user = await authService.getCurrentUser((req.user as { id: string }).id);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
