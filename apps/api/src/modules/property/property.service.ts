import { Prisma, Property, PropertyStatus, PropertyType } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

interface CreatePropertyData {
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize?: number;
  yearBuilt?: number;
  propertyType?: PropertyType;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  agentId: string;
  mlsNumber?: string;
  virtualTourUrl?: string;
  openHouseDate?: string;
  hoaFee?: number;
  parkingSpaces?: number;
  garage?: boolean;
  pool?: boolean;
  features?: string[];
}

interface SearchParams {
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  minSqft?: number;
  maxSqft?: number;
  propertyType?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  features?: string;
  hasPool?: boolean;
  hasGarage?: boolean;
  minYearBuilt?: number;
  maxYearBuilt?: number;
}

class PropertyService {
  async createProperty(data: CreatePropertyData): Promise<Property> {
    const pricePerSqft = data.price / data.sqft;
    
    const property = await prisma.property.create({
      data: {
        ...data,
        price: new Prisma.Decimal(data.price),
        bathrooms: new Prisma.Decimal(data.bathrooms),
        latitude: new Prisma.Decimal(data.latitude),
        longitude: new Prisma.Decimal(data.longitude),
        pricePerSqft: new Prisma.Decimal(pricePerSqft),
        hoaFee: data.hoaFee ? new Prisma.Decimal(data.hoaFee) : null,
        openHouseDate: data.openHouseDate ? new Date(data.openHouseDate) : null,
        estimatedValue: new Prisma.Decimal(data.price * 1.02), // Mock estimate
      },
      include: {
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            agencyName: true,
          },
        },
        images: true,
      },
    });

    // Create initial price history entry
    await prisma.priceHistory.create({
      data: {
        propertyId: property.id,
        price: new Prisma.Decimal(data.price),
        date: new Date(),
        eventType: 'LISTED',
      },
    });

    return property;
  }

  async getPropertyById(id: string): Promise<Property | null> {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            agencyName: true,
            licenseNumber: true,
            bio: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        priceHistory: {
          orderBy: { date: 'desc' },
        },
        _count: {
          select: {
            favorites: true,
            viewHistory: true,
          },
        },
      },
    });

    return property;
  }

  async searchProperties(params: SearchParams) {
    const {
      page = 1,
      limit = 20,
      minPrice,
      maxPrice,
      minBeds,
      maxBeds,
      minBaths,
      maxBaths,
      minSqft,
      maxSqft,
      propertyType,
      city,
      state,
      zipCode,
      status = 'ACTIVE',
      lat,
      lng,
      radius,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      hasPool,
      hasGarage,
      minYearBuilt,
      maxYearBuilt,
    } = params;

    const where: Prisma.PropertyWhereInput = {
      status: status as PropertyStatus,
    };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = new Prisma.Decimal(minPrice);
      if (maxPrice !== undefined) where.price.lte = new Prisma.Decimal(maxPrice);
    }

    if (minBeds !== undefined || maxBeds !== undefined) {
      where.bedrooms = {};
      if (minBeds !== undefined) where.bedrooms.gte = minBeds;
      if (maxBeds !== undefined) where.bedrooms.lte = maxBeds;
    }

    if (minBaths !== undefined || maxBaths !== undefined) {
      where.bathrooms = {};
      if (minBaths !== undefined) where.bathrooms.gte = new Prisma.Decimal(minBaths);
      if (maxBaths !== undefined) where.bathrooms.lte = new Prisma.Decimal(maxBaths);
    }

    if (minSqft !== undefined || maxSqft !== undefined) {
      where.sqft = {};
      if (minSqft !== undefined) where.sqft.gte = minSqft;
      if (maxSqft !== undefined) where.sqft.lte = maxSqft;
    }

    if (propertyType) {
      where.propertyType = propertyType as PropertyType;
    }

    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = state.toUpperCase();
    if (zipCode) where.zipCode = zipCode;

    if (hasPool) where.pool = true;
    if (hasGarage) where.garage = true;

    if (minYearBuilt !== undefined || maxYearBuilt !== undefined) {
      where.yearBuilt = {};
      if (minYearBuilt !== undefined) where.yearBuilt.gte = minYearBuilt;
      if (maxYearBuilt !== undefined) where.yearBuilt.lte = maxYearBuilt;
    }

    // Geolocation search
    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      const radiusInDegrees = radius / 69; // Approximate miles to degrees
      where.latitude = {
        gte: new Prisma.Decimal(lat - radiusInDegrees),
        lte: new Prisma.Decimal(lat + radiusInDegrees),
      };
      where.longitude = {
        gte: new Prisma.Decimal(lng - radiusInDegrees),
        lte: new Prisma.Decimal(lng + radiusInDegrees),
      };
    }

    const orderBy: Prisma.PropertyOrderByWithRelationInput = {};
    const validSortFields = ['price', 'createdAt', 'bedrooms', 'bathrooms', 'sqft', 'daysOnMarket'];
    if (validSortFields.includes(sortBy)) {
      (orderBy as Record<string, string>)[sortBy] = sortOrder;
    }

    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          agent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: { favorites: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return {
      properties,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateProperty(id: string, agentId: string, data: Partial<CreatePropertyData>): Promise<Property> {
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    if (property.agentId !== agentId) {
      throw new AppError('Not authorized to update this property', 403);
    }

    const oldPrice = property.price;

    const updateData: Prisma.PropertyUpdateInput = {};
    
    if (data.price !== undefined) {
      updateData.price = new Prisma.Decimal(data.price);
      if (data.sqft || property.sqft) {
        updateData.pricePerSqft = new Prisma.Decimal(data.price / (data.sqft || property.sqft));
      }
    }
    if (data.bathrooms !== undefined) updateData.bathrooms = new Prisma.Decimal(data.bathrooms);
    if (data.latitude !== undefined) updateData.latitude = new Prisma.Decimal(data.latitude);
    if (data.longitude !== undefined) updateData.longitude = new Prisma.Decimal(data.longitude);
    if (data.hoaFee !== undefined) updateData.hoaFee = new Prisma.Decimal(data.hoaFee);
    if (data.openHouseDate !== undefined) updateData.openHouseDate = new Date(data.openHouseDate);

    // Copy other fields
    const simpleFields = ['title', 'description', 'bedrooms', 'sqft', 'lotSize', 'yearBuilt', 
      'propertyType', 'address', 'city', 'state', 'zipCode', 'status', 'mlsNumber', 
      'virtualTourUrl', 'parkingSpaces', 'garage', 'pool', 'features'];
    
    const dataRecord = data as Record<string, unknown>;
    for (const field of simpleFields) {
      if (dataRecord[field] !== undefined) {
        (updateData as Record<string, unknown>)[field] = dataRecord[field];
      }
    }

    const updated = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        images: true,
      },
    });

    // Track price changes
    if (data.price !== undefined && data.price !== Number(oldPrice)) {
      const eventType = data.price > Number(oldPrice) ? 'PRICE_INCREASE' : 'PRICE_DECREASE';
      await prisma.priceHistory.create({
        data: {
          propertyId: id,
          price: new Prisma.Decimal(data.price),
          date: new Date(),
          eventType,
        },
      });
    }

    return updated;
  }

  async deleteProperty(id: string, agentId: string): Promise<void> {
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    if (property.agentId !== agentId) {
      throw new AppError('Not authorized to delete this property', 403);
    }

    await prisma.property.delete({ where: { id } });
  }

  async addImage(propertyId: string, agentId: string, imageData: { url: string; isPrimary?: boolean; order?: number }) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    if (property.agentId !== agentId) {
      throw new AppError('Not authorized', 403);
    }

    if (imageData.isPrimary) {
      await prisma.propertyImage.updateMany({
        where: { propertyId },
        data: { isPrimary: false },
      });
    }

    return prisma.propertyImage.create({
      data: {
        propertyId,
        url: imageData.url,
        isPrimary: imageData.isPrimary || false,
        order: imageData.order || 0,
      },
    });
  }

  async deleteImage(propertyId: string, imageId: string, agentId: string): Promise<void> {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    if (property.agentId !== agentId) {
      throw new AppError('Not authorized', 403);
    }

    await prisma.propertyImage.delete({ where: { id: imageId } });
  }

  async toggleFavorite(propertyId: string, userId: string): Promise<{ isFavorited: boolean }> {
    const existing = await prisma.favoriteProperty.findUnique({
      where: {
        userId_propertyId: { userId, propertyId },
      },
    });

    if (existing) {
      await prisma.favoriteProperty.delete({
        where: { id: existing.id },
      });
      return { isFavorited: false };
    }

    await prisma.favoriteProperty.create({
      data: { userId, propertyId },
    });
    return { isFavorited: true };
  }

  async getUserFavorites(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      prisma.favoriteProperty.findMany({
        where: { userId },
        include: {
          property: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              agent: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.favoriteProperty.count({ where: { userId } }),
    ]);

    return {
      favorites: favorites.map(f => f.property),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getPriceHistory(propertyId: string) {
    return prisma.priceHistory.findMany({
      where: { propertyId },
      orderBy: { date: 'desc' },
    });
  }

  async getComparables(propertyId: string, limit = 5) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    const radiusInDegrees = 2 / 69; // 2 miles
    const priceRange = Number(property.price) * 0.2; // 20% price range

    return prisma.property.findMany({
      where: {
        id: { not: propertyId },
        status: 'ACTIVE',
        propertyType: property.propertyType,
        latitude: {
          gte: new Prisma.Decimal(Number(property.latitude) - radiusInDegrees),
          lte: new Prisma.Decimal(Number(property.latitude) + radiusInDegrees),
        },
        longitude: {
          gte: new Prisma.Decimal(Number(property.longitude) - radiusInDegrees),
          lte: new Prisma.Decimal(Number(property.longitude) + radiusInDegrees),
        },
        price: {
          gte: new Prisma.Decimal(Number(property.price) - priceRange),
          lte: new Prisma.Decimal(Number(property.price) + priceRange),
        },
        bedrooms: {
          gte: property.bedrooms - 1,
          lte: property.bedrooms + 1,
        },
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
      },
      take: limit,
    });
  }

  async getEstimate(propertyId: string) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { priceHistory: { orderBy: { date: 'desc' }, take: 1 } },
    });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    // Mock Zestimate algorithm
    const baseValue = Number(property.price);
    const sqftFactor = property.sqft > 2000 ? 1.05 : 1.0;
    const ageFactor = property.yearBuilt ? (property.yearBuilt > 2010 ? 1.08 : 1.0) : 1.0;
    const poolFactor = property.pool ? 1.03 : 1.0;
    const garageFactor = property.garage ? 1.02 : 1.0;

    const estimatedValue = baseValue * sqftFactor * ageFactor * poolFactor * garageFactor;
    const lowEstimate = estimatedValue * 0.95;
    const highEstimate = estimatedValue * 1.05;

    return {
      propertyId,
      estimatedValue: Math.round(estimatedValue),
      lowEstimate: Math.round(lowEstimate),
      highEstimate: Math.round(highEstimate),
      confidence: 0.85,
      lastUpdated: new Date(),
      factors: {
        sqftFactor,
        ageFactor,
        poolFactor,
        garageFactor,
      },
    };
  }

  async getNearbyProperties(lat: number, lng: number, radius: number, limit: number) {
    const radiusInDegrees = radius / 69;

    return prisma.property.findMany({
      where: {
        status: 'ACTIVE',
        latitude: {
          gte: new Prisma.Decimal(lat - radiusInDegrees),
          lte: new Prisma.Decimal(lat + radiusInDegrees),
        },
        longitude: {
          gte: new Prisma.Decimal(lng - radiusInDegrees),
          lte: new Prisma.Decimal(lng + radiusInDegrees),
        },
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        agent: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      take: limit,
    });
  }

  async getFeaturedProperties(limit = 10) {
    return prisma.property.findMany({
      where: { status: 'ACTIVE' },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        agent: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        _count: { select: { favorites: true, viewHistory: true } },
      },
      orderBy: [
        { viewHistory: { _count: 'desc' } },
        { createdAt: 'desc' },
      ],
      take: limit,
    });
  }

  async recordView(propertyId: string, userId?: string, sessionId?: string) {
    if (!userId && !sessionId) return;

    await prisma.viewHistory.create({
      data: {
        propertyId,
        userId: userId || '',
        sessionId,
      },
    });

    // Update days on market
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (property) {
      const daysOnMarket = Math.floor(
        (Date.now() - property.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      await prisma.property.update({
        where: { id: propertyId },
        data: { daysOnMarket },
      });
    }
  }

  async getPropertyViews(propertyId: string) {
    const [total, last7Days, last30Days] = await Promise.all([
      prisma.viewHistory.count({ where: { propertyId } }),
      prisma.viewHistory.count({
        where: {
          propertyId,
          viewedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.viewHistory.count({
        where: {
          propertyId,
          viewedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return { total, last7Days, last30Days };
  }
}

export default new PropertyService();
