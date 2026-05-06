import { Router } from 'express';
import leadController from './lead.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import {
  createLeadSchema,
  updateLeadSchema,
  addLeadNoteSchema,
  leadIdSchema,
  listLeadsSchema,
} from './lead.validation';

const router = Router();

/**
 * @swagger
 * /api/v1/leads:
 *   get:
 *     summary: List leads for agent
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NEW, CONTACTED, QUALIFIED, SHOWING_SCHEDULED, OFFER_MADE, CLOSED_WON, CLOSED_LOST, UNRESPONSIVE]
 *     responses:
 *       200:
 *         description: List of leads
 */
router.get(
  '/',
  authenticate,
  authorize('AGENT', 'ADMIN'),
  validate(listLeadsSchema),
  leadController.listLeads
);

/**
 * @swagger
 * /api/v1/leads/stats:
 *   get:
 *     summary: Get lead statistics
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lead statistics
 */
router.get('/stats', authenticate, authorize('AGENT', 'ADMIN'), leadController.getLeadStats);

/**
 * @swagger
 * /api/v1/leads/{id}:
 *   get:
 *     summary: Get lead by ID
 *     tags: [Leads]
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
 *         description: Lead details
 */
router.get('/:id', authenticate, validate(leadIdSchema), leadController.getLead);

/**
 * @swagger
 * /api/v1/leads:
 *   post:
 *     summary: Create a new lead (inquiry)
 *     tags: [Leads]
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
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lead created
 */
router.post('/', authenticate, validate(createLeadSchema), leadController.createLead);

/**
 * @swagger
 * /api/v1/leads/{id}:
 *   patch:
 *     summary: Update lead status
 *     tags: [Leads]
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
 *                 enum: [NEW, CONTACTED, QUALIFIED, SHOWING_SCHEDULED, OFFER_MADE, CLOSED_WON, CLOSED_LOST, UNRESPONSIVE]
 *               qualityScore:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Lead updated
 */
router.patch(
  '/:id',
  authenticate,
  authorize('AGENT', 'ADMIN'),
  validate(updateLeadSchema),
  leadController.updateLead
);

/**
 * @swagger
 * /api/v1/leads/{id}/notes:
 *   post:
 *     summary: Add note to lead
 *     tags: [Leads]
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Note added
 */
router.post('/:id/notes', authenticate, validate(addLeadNoteSchema), leadController.addNote);

export default router;
