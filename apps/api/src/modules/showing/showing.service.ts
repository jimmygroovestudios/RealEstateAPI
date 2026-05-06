import { Prisma, ShowingStatus } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

interface CreateShowingData {
  propertyId: string;
  buyerId: string;
  requestedAt?: Date;
  notes?: string;
}

interface ListShowingsParams {
  userId: string;
  role: 'AGENT' | 'BUYER';
  page?: number;
  limit?: number;
  status?: string;
}

class ShowingService {
  async createShowing(data: CreateShowingData) {
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
      select: { agentId: true, title: true },
    });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    // Check for existing pending showing
    const existingShowing = await prisma.showing.findFirst({
      where: {
        propertyId: data.propertyId,
        buyerId: data.buyerId,
        status: { in: ['REQUESTED', 'CONFIRMED'] },
      },
    });

    if (existingShowing) {
      throw new AppError('You already have a pending showing request for this property', 400);
    }

    return prisma.showing.create({
      data: {
        propertyId: data.propertyId,
        buyerId: data.buyerId,
        agentId: property.agentId,
        requestedAt: data.requestedAt || new Date(),
        notes: data.notes,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            state: true,
          },
        },
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async getShowingById(id: string, userId: string) {
    const showing = await prisma.showing.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!showing) {
      throw new AppError('Showing not found', 404);
    }

    if (showing.agentId !== userId && showing.buyerId !== userId) {
      throw new AppError('Not authorized to view this showing', 403);
    }

    return showing;
  }

  async listShowings(params: ListShowingsParams) {
    const { userId, role, page = 1, limit = 20, status } = params;

    const where: Prisma.ShowingWhereInput = role === 'AGENT'
      ? { agentId: userId }
      : { buyerId: userId };

    if (status) {
      where.status = status as ShowingStatus;
    }

    const skip = (page - 1) * limit;

    const [showings, total] = await Promise.all([
      prisma.showing.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          agent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { scheduledAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.showing.count({ where }),
    ]);

    return {
      showings,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateShowing(
    id: string,
    agentId: string,
    data: { status?: ShowingStatus; scheduledAt?: Date }
  ) {
    const showing = await prisma.showing.findUnique({ where: { id } });

    if (!showing) {
      throw new AppError('Showing not found', 404);
    }

    if (showing.agentId !== agentId) {
      throw new AppError('Not authorized to update this showing', 403);
    }

    return prisma.showing.update({
      where: { id },
      data: {
        status: data.status,
        scheduledAt: data.scheduledAt,
      },
      include: {
        property: {
          select: { id: true, title: true, address: true },
        },
        buyer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async cancelShowing(id: string, userId: string) {
    const showing = await prisma.showing.findUnique({ where: { id } });

    if (!showing) {
      throw new AppError('Showing not found', 404);
    }

    if (showing.agentId !== userId && showing.buyerId !== userId) {
      throw new AppError('Not authorized to cancel this showing', 403);
    }

    return prisma.showing.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async addFeedback(id: string, buyerId: string, feedback: string, rating?: number) {
    const showing = await prisma.showing.findUnique({ where: { id } });

    if (!showing) {
      throw new AppError('Showing not found', 404);
    }

    if (showing.buyerId !== buyerId) {
      throw new AppError('Not authorized to add feedback', 403);
    }

    if (showing.status !== 'COMPLETED') {
      throw new AppError('Can only add feedback to completed showings', 400);
    }

    return prisma.showing.update({
      where: { id },
      data: {
        feedback,
        rating,
      },
    });
  }

  async getAgentCalendar(agentId: string, startDate: Date, endDate: Date) {
    return prisma.showing.findMany({
      where: {
        agentId,
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ['CONFIRMED', 'REQUESTED'] },
      },
      include: {
        property: {
          select: { id: true, title: true, address: true, city: true },
        },
        buyer: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }
}

export default new ShowingService();
