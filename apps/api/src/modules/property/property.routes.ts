import { Router } from 'express';
import propertyController from './property.controller';
import { validate } from '../../middleware/validation.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import {
  createPropertySchema,
  updatePropertySchema,
  searchPropertiesSchema,
  propertyIdSchema,
  addImageSchema,
  nearbyPropertiesSchema,
} from './property.validation';

const router = Router();

/**
 * @swagger
 * /api/v1/properties:
 *   get:
 *     summary: Search properties with filters
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: minBeds
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxBeds
 *         schema:
 *           type: integer
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *           enum: [HOUSE, CONDO, TOWNHOUSE, APARTMENT, LAND, MULTI_FAMILY]
 *     responses:
 *       200:
 *         description: List of properties
 */
router.get('/', validate(searchPropertiesSchema), propertyController.searchProperties);

/**
 * @swagger
 * /api/v1/properties/featured:
 *   get:
 *     summary: Get featured properties
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Featured properties
 */
router.get('/featured', propertyController.getFeaturedProperties);

/**
 * @swagger
 * /api/v1/properties/nearby:
 *   get:
 *     summary: Get nearby properties by location
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *         description: Radius in miles
 *     responses:
 *       200:
 *         description: Nearby properties
 */
router.get('/nearby', validate(nearbyPropertiesSchema), propertyController.getNearbyProperties);

/**
 * @swagger
 * /api/v1/properties/favorites:
 *   get:
 *     summary: Get user's favorite properties
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's favorite properties
 */
router.get('/favorites', authenticate, propertyController.getUserFavorites);

/**
 * @swagger
 * /api/v1/properties/{id}:
 *   get:
 *     summary: Get property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property details
 *       404:
 *         description: Property not found
 */
router.get('/:id', validate(propertyIdSchema), propertyController.getProperty);

/**
 * @swagger
 * /api/v1/properties/{id}/price-history:
 *   get:
 *     summary: Get property price history
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Price history
 */
router.get('/:id/price-history', validate(propertyIdSchema), propertyController.getPriceHistory);

/**
 * @swagger
 * /api/v1/properties/{id}/comparables:
 *   get:
 *     summary: Get comparable properties
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Comparable properties
 */
router.get('/:id/comparables', validate(propertyIdSchema), propertyController.getComparables);

/**
 * @swagger
 * /api/v1/properties/{id}/estimate:
 *   get:
 *     summary: Get property value estimate (Zestimate-style)
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property estimate
 */
router.get('/:id/estimate', validate(propertyIdSchema), propertyController.getEstimate);

/**
 * @swagger
 * /api/v1/properties/{id}/views:
 *   get:
 *     summary: Get property view statistics
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: View statistics
 */
router.get('/:id/views', validate(propertyIdSchema), propertyController.getPropertyViews);

/**
 * @swagger
 * /api/v1/properties:
 *   post:
 *     summary: Create a new property listing
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - bedrooms
 *               - bathrooms
 *               - sqft
 *               - address
 *               - city
 *               - state
 *               - zipCode
 *               - latitude
 *               - longitude
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: number
 *               sqft:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Property created
 */
router.post(
  '/',
  authenticate,
  authorize('AGENT', 'ADMIN'),
  validate(createPropertySchema),
  propertyController.createProperty
);

/**
 * @swagger
 * /api/v1/properties/{id}:
 *   put:
 *     summary: Update a property
 *     tags: [Properties]
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
 *         description: Property updated
 */
router.put(
  '/:id',
  authenticate,
  authorize('AGENT', 'ADMIN'),
  validate(updatePropertySchema),
  propertyController.updateProperty
);

/**
 * @swagger
 * /api/v1/properties/{id}:
 *   delete:
 *     summary: Delete a property
 *     tags: [Properties]
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
 *         description: Property deleted
 */
router.delete(
  '/:id',
  authenticate,
  authorize('AGENT', 'ADMIN'),
  validate(propertyIdSchema),
  propertyController.deleteProperty
);

/**
 * @swagger
 * /api/v1/properties/{id}/images:
 *   post:
 *     summary: Add image to property
 *     tags: [Properties]
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
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Image added
 */
router.post(
  '/:id/images',
  authenticate,
  authorize('AGENT', 'ADMIN'),
  validate(addImageSchema),
  propertyController.addImage
);

/**
 * @swagger
 * /api/v1/properties/{id}/images/{imageId}:
 *   delete:
 *     summary: Delete property image
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted
 */
router.delete(
  '/:id/images/:imageId',
  authenticate,
  authorize('AGENT', 'ADMIN'),
  propertyController.deleteImage
);

/**
 * @swagger
 * /api/v1/properties/{id}/favorite:
 *   post:
 *     summary: Toggle property favorite
 *     tags: [Properties]
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
 *         description: Favorite toggled
 */
router.post('/:id/favorite', authenticate, propertyController.toggleFavorite);

export default router;
