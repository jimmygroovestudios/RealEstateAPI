import { z } from 'zod';

export const createLeadSchema = z.object({
  body: z.object({
    propertyId: z.string(),
    message: z.string().min(10).max(1000).optional(),
  }),
});

export const updateLeadSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.enum([
      'NEW',
      'CONTACTED',
      'QUALIFIED',
      'SHOWING_SCHEDULED',
      'OFFER_MADE',
      'CLOSED_WON',
      'CLOSED_LOST',
      'UNRESPONSIVE',
    ]).optional(),
    qualityScore: z.number().int().min(0).max(100).optional(),
  }),
});

export const addLeadNoteSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    content: z.string().min(1).max(2000),
  }),
});

export const leadIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const listLeadsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
    status: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});
