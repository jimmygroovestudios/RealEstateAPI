import { Router } from 'express';
import neighborhoodController from '../neighborhood/neighborhood.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/market/trends:
 *   get:
 *     summary: Get market trends by ZIP code
 *     tags: [Market]
 *     parameters:
 *       - in: query
 *         name: zipCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Market trends data
 */
router.get('/trends', (req, res, next) => {
  (req.params as Record<string, string>).zipCode = req.query.zipCode as string;
  neighborhoodController.getMarketTrends(req, res, next);
});

/**
 * @swagger
 * /api/v1/market/hotness:
 *   get:
 *     summary: Get hot markets ranking
 *     tags: [Market]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Hot markets list
 */
router.get('/hotness', neighborhoodController.getHotMarkets);

/**
 * @swagger
 * /api/v1/market/forecast:
 *   get:
 *     summary: Get market forecast
 *     tags: [Market]
 *     parameters:
 *       - in: query
 *         name: zipCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Market forecast
 */
router.get('/forecast', (req, res, next) => {
  (req.params as Record<string, string>).zipCode = req.query.zipCode as string;
  neighborhoodController.getMarketForecast(req, res, next);
});

/**
 * @swagger
 * /api/v1/market/inventory:
 *   get:
 *     summary: Get inventory statistics
 *     tags: [Market]
 *     responses:
 *       200:
 *         description: Inventory statistics
 */
router.get('/inventory', neighborhoodController.getInventoryStats);

export default router;
