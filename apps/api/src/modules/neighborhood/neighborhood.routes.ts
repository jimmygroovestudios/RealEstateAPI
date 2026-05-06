import { Router } from 'express';
import neighborhoodController from './neighborhood.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/neighborhoods/{zipCode}:
 *   get:
 *     summary: Get neighborhood overview
 *     tags: [Neighborhoods]
 *     parameters:
 *       - in: path
 *         name: zipCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Neighborhood data
 */
router.get('/:zipCode', neighborhoodController.getNeighborhood);

/**
 * @swagger
 * /api/v1/neighborhoods/{zipCode}/schools:
 *   get:
 *     summary: Get schools in neighborhood
 *     tags: [Neighborhoods]
 *     parameters:
 *       - in: path
 *         name: zipCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: School data
 */
router.get('/:zipCode/schools', neighborhoodController.getSchools);

/**
 * @swagger
 * /api/v1/neighborhoods/{zipCode}/crime:
 *   get:
 *     summary: Get crime statistics
 *     tags: [Neighborhoods]
 *     parameters:
 *       - in: path
 *         name: zipCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Crime statistics
 */
router.get('/:zipCode/crime', neighborhoodController.getCrimeStats);

/**
 * @swagger
 * /api/v1/neighborhoods/{zipCode}/commute:
 *   post:
 *     summary: Calculate commute time
 *     tags: [Neighborhoods]
 *     parameters:
 *       - in: path
 *         name: zipCode
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - destination
 *             properties:
 *               destination:
 *                 type: string
 *     responses:
 *       200:
 *         description: Commute time data
 */
router.post('/:zipCode/commute', neighborhoodController.getCommuteTime);

/**
 * @swagger
 * /api/v1/neighborhoods/{zipCode}/demographics:
 *   get:
 *     summary: Get demographics data
 *     tags: [Neighborhoods]
 *     parameters:
 *       - in: path
 *         name: zipCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Demographics data
 */
router.get('/:zipCode/demographics', neighborhoodController.getDemographics);

/**
 * @swagger
 * /api/v1/neighborhoods/{zipCode}/market:
 *   get:
 *     summary: Get market trends for neighborhood
 *     tags: [Neighborhoods]
 *     parameters:
 *       - in: path
 *         name: zipCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Market trends
 */
router.get('/:zipCode/market', neighborhoodController.getMarketTrends);

export default router;
