import { Router } from 'express';
import toolsController from './tools.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/tools/mortgage/calculate:
 *   post:
 *     summary: Calculate mortgage payment
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - principal
 *               - annualRate
 *               - termYears
 *             properties:
 *               principal:
 *                 type: number
 *                 description: Home price
 *               annualRate:
 *                 type: number
 *                 description: Annual interest rate (e.g., 6.5)
 *               termYears:
 *                 type: integer
 *                 description: Loan term in years
 *               downPayment:
 *                 type: number
 *               propertyTax:
 *                 type: number
 *                 description: Annual property tax
 *               insurance:
 *                 type: number
 *                 description: Annual insurance
 *               hoa:
 *                 type: number
 *                 description: Monthly HOA fee
 *     responses:
 *       200:
 *         description: Mortgage calculation result
 */
router.post('/mortgage/calculate', toolsController.calculateMortgage);

/**
 * @swagger
 * /api/v1/tools/mortgage/affordability:
 *   post:
 *     summary: Calculate how much home you can afford
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - annualIncome
 *               - monthlyDebts
 *               - downPayment
 *               - annualRate
 *               - termYears
 *             properties:
 *               annualIncome:
 *                 type: number
 *               monthlyDebts:
 *                 type: number
 *               downPayment:
 *                 type: number
 *               annualRate:
 *                 type: number
 *               termYears:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Affordability calculation
 */
router.post('/mortgage/affordability', toolsController.calculateAffordability);

/**
 * @swagger
 * /api/v1/tools/mortgage/rates:
 *   get:
 *     summary: Get current mortgage rates
 *     tags: [Tools]
 *     responses:
 *       200:
 *         description: Current mortgage rates
 */
router.get('/mortgage/rates', toolsController.getCurrentRates);

/**
 * @swagger
 * /api/v1/tools/mortgage/prequalify:
 *   post:
 *     summary: Basic pre-qualification check
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - annualIncome
 *               - monthlyDebts
 *               - creditScore
 *               - downPayment
 *               - employmentYears
 *             properties:
 *               annualIncome:
 *                 type: number
 *               monthlyDebts:
 *                 type: number
 *               creditScore:
 *                 type: integer
 *               downPayment:
 *                 type: number
 *               employmentYears:
 *                 type: number
 *     responses:
 *       200:
 *         description: Pre-qualification result
 */
router.post('/mortgage/prequalify', toolsController.prequalify);

export default router;
