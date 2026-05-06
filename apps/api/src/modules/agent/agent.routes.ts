import { Router } from 'express';
import agentController from './agent.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/v1/agents:
 *   get:
 *     summary: Search agents
 *     tags: [Agents]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of agents
 */
router.get('/', agentController.searchAgents);

/**
 * @swagger
 * /api/v1/agents/{id}:
 *   get:
 *     summary: Get agent profile
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent profile
 */
router.get('/:id', agentController.getAgent);

/**
 * @swagger
 * /api/v1/agents/{id}/reviews:
 *   get:
 *     summary: Get agent reviews
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent reviews
 */
router.get('/:id/reviews', agentController.getAgentReviews);

/**
 * @swagger
 * /api/v1/agents/{id}/reviews:
 *   post:
 *     summary: Submit agent review
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - rating
 *               - content
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               wouldRecommend:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Review submitted
 */
router.post('/:id/reviews', authenticate, agentController.createReview);

/**
 * @swagger
 * /api/v1/agents/{id}/stats:
 *   get:
 *     summary: Get agent statistics
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent statistics
 */
router.get('/:id/stats', agentController.getAgentStats);

// Dashboard routes (for authenticated agents)

/**
 * @swagger
 * /api/v1/dashboard/overview:
 *   get:
 *     summary: Get agent dashboard overview
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview
 */
router.get('/dashboard/overview', authenticate, authorize('AGENT', 'ADMIN'), agentController.getDashboardOverview);

/**
 * @swagger
 * /api/v1/dashboard/listings:
 *   get:
 *     summary: Get my listings
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, PENDING, SOLD, OFF_MARKET]
 *     responses:
 *       200:
 *         description: Agent's listings
 */
router.get('/dashboard/listings', authenticate, authorize('AGENT', 'ADMIN'), agentController.getMyListings);

/**
 * @swagger
 * /api/v1/dashboard/performance:
 *   get:
 *     summary: Get performance metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *     responses:
 *       200:
 *         description: Performance metrics
 */
router.get('/dashboard/performance', authenticate, authorize('AGENT', 'ADMIN'), agentController.getMyPerformance);

export default router;
