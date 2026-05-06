import { Router } from 'express';
import showingController from './showing.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/v1/showings:
 *   get:
 *     summary: List showings
 *     tags: [Showings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of showings
 */
router.get('/', authenticate, showingController.listShowings);

/**
 * @swagger
 * /api/v1/showings/calendar:
 *   get:
 *     summary: Get agent's showing calendar
 *     tags: [Showings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Calendar showings
 */
router.get('/calendar', authenticate, authorize('AGENT', 'ADMIN'), showingController.getCalendar);

/**
 * @swagger
 * /api/v1/showings/{id}:
 *   get:
 *     summary: Get showing by ID
 *     tags: [Showings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Showing details
 */
router.get('/:id', authenticate, showingController.getShowing);

/**
 * @swagger
 * /api/v1/showings:
 *   post:
 *     summary: Request a showing
 *     tags: [Showings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *             properties:
 *               propertyId:
 *                 type: string
 *               requestedAt:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Showing requested
 */
router.post('/', authenticate, showingController.createShowing);

/**
 * @swagger
 * /api/v1/showings/{id}:
 *   patch:
 *     summary: Update showing (confirm/reschedule)
 *     tags: [Showings]
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [REQUESTED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW]
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Showing updated
 */
router.patch('/:id', authenticate, authorize('AGENT', 'ADMIN'), showingController.updateShowing);

/**
 * @swagger
 * /api/v1/showings/{id}/cancel:
 *   post:
 *     summary: Cancel a showing
 *     tags: [Showings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Showing cancelled
 */
router.post('/:id/cancel', authenticate, showingController.cancelShowing);

/**
 * @swagger
 * /api/v1/showings/{id}/feedback:
 *   post:
 *     summary: Add feedback after showing
 *     tags: [Showings]
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
 *               - feedback
 *             properties:
 *               feedback:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Feedback added
 */
router.post('/:id/feedback', authenticate, showingController.addFeedback);

export default router;
