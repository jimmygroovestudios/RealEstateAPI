import { z } from 'zod';

export const createPropertySchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(20),
    price: z.number().positive(),
    bedrooms: z.number().int().min(0).max(20),
    bathrooms: z.number().min(0).max(20),
    sqft: z.number().int().positive(),
    lotSize: z.number().int().positive().optional(),
    yearBuilt: z.number().int().min(1800).max(new Date().getFullYear() + 2).optional(),
    propertyType: z.enum(['HOUSE', 'CONDO', 'TOWNHOUSE', 'APARTMENT', 'LAND', 'MULTI_FAMILY']).optional(),
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().length(2),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    mlsNumber: z.string().optional(),
    virtualTourUrl: z.string().url().optional(),
    openHouseDate: z.string().datetime().optional(),
    hoaFee: z.number().min(0).optional(),
    parkingSpaces: z.number().int().min(0).optional(),
    garage: z.boolean().optional(),
    pool: z.boolean().optional(),
    features: z.array(z.string()).optional(),
  }),
});

export const updatePropertySchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string().min(5).max(200).optional(),
    description: z.string().min(20).optional(),
    price: z.number().positive().optional(),
    bedrooms: z.number().int().min(0).max(20).optional(),
    bathrooms: z.number().min(0).max(20).optional(),
    sqft: z.number().int().positive().optional(),
    lotSize: z.number().int().positive().optional(),
    yearBuilt: z.number().int().min(1800).max(new Date().getFullYear() + 2).optional(),
    propertyType: z.enum(['HOUSE', 'CONDO', 'TOWNHOUSE', 'APARTMENT', 'LAND', 'MULTI_FAMILY']).optional(),
    address: z.string().min(5).optional(),
    city: z.string().min(2).optional(),
    state: z.string().length(2).optional(),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    status: z.enum(['ACTIVE', 'PENDING', 'SOLD', 'OFF_MARKET']).optional(),
    mlsNumber: z.string().optional(),
    virtualTourUrl: z.string().url().optional(),
    openHouseDate: z.string().datetime().optional(),
    hoaFee: z.number().min(0).optional(),
    parkingSpaces: z.number().int().min(0).optional(),
    garage: z.boolean().optional(),
    pool: z.boolean().optional(),
    features: z.array(z.string()).optional(),
  }),
});

export const searchPropertiesSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
    minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    minBeds: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    maxBeds: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    minBaths: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    maxBaths: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    minSqft: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    maxSqft: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    propertyType: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    status: z.string().optional(),
    lat: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    lng: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    radius: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    features: z.string().optional(),
    hasPool: z.string().optional().transform(val => val === 'true'),
    hasGarage: z.string().optional().transform(val => val === 'true'),
    minYearBuilt: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    maxYearBuilt: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  }),
});

export const propertyIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const addImageSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    url: z.string().url(),
    isPrimary: z.boolean().optional(),
    order: z.number().int().min(0).optional(),
  }),
});

export const nearbyPropertiesSchema = z.object({
  query: z.object({
    lat: z.string().transform(val => parseFloat(val)),
    lng: z.string().transform(val => parseFloat(val)),
    radius: z.string().optional().transform(val => val ? parseFloat(val) : 5),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  }),
});
