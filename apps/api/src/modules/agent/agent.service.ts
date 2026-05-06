import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

class AgentService {
  async searchAgents(params: {
    city?: string;
    state?: string;
    page?: number;
    limit?: number;
  }) {
    const { city, state, page = 1, limit = 20 } = params;

    const where: Prisma.UserWhereInput = {
      role: 'AGENT',
      isActive: true,
    };

    // Filter by location based on their listings
    if (city || state) {
      where.properties = {
        some: {
          ...(city && { city: { contains: city, mode: 'insensitive' } }),
          ...(state && { state: state.toUpperCase() }),
        },
      };
    }

    const skip = (page - 1) * limit;

    const [agents, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatar: true,
          bio: true,
          agencyName: true,
          licenseNumber: true,
          createdAt: true,
          _count: {
            select: {
              properties: true,
              reviewsReceived: true,
              leadsReceived: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Calculate average ratings
    const agentsWithRatings = await Promise.all(
      agents.map(async (agent) => {
        const avgRating = await prisma.agentReview.aggregate({
          where: { agentId: agent.id },
          _avg: { rating: true },
        });

        return {
          ...agent,
          averageRating: avgRating._avg.rating || 0,
        };
      })
    );

    return {
      agents: agentsWithRatings,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAgentById(id: string) {
    const agent = await prisma.user.findUnique({
      where: { id, role: 'AGENT' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        bio: true,
        agencyName: true,
        licenseNumber: true,
        createdAt: true,
        properties: {
          where: { status: 'ACTIVE' },
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
          take: 6,
        },
        _count: {
          select: {
            properties: true,
            reviewsReceived: true,
            leadsReceived: true,
          },
        },
      },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    const [avgRating, recentReviews] = await Promise.all([
      prisma.agentReview.aggregate({
        where: { agentId: id },
        _avg: { rating: true },
        _count: true,
      }),
      prisma.agentReview.findMany({
        where: { agentId: id },
        include: {
          reviewer: {
            select: { firstName: true, lastName: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      ...agent,
      averageRating: avgRating._avg.rating || 0,
      totalReviews: avgRating._count,
      recentReviews,
    };
  }

  async getAgentReviews(agentId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total, stats] = await Promise.all([
      prisma.agentReview.findMany({
        where: { agentId },
        include: {
          reviewer: {
            select: { firstName: true, lastName: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.agentReview.count({ where: { agentId } }),
      prisma.agentReview.aggregate({
        where: { agentId },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    // Rating distribution
    const distribution = await prisma.agentReview.groupBy({
      by: ['rating'],
      where: { agentId },
      _count: true,
    });

    const ratingDistribution: Record<number, number> = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0,
    };
    distribution.forEach((d: { rating: number; _count: number }) => {
      ratingDistribution[d.rating] = d._count;
    });

    return {
      reviews,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count,
        ratingDistribution,
      },
    };
  }

  async createReview(agentId: string, reviewerId: string, data: {
    rating: number;
    title?: string;
    content: string;
    wouldRecommend?: boolean;
  }) {
    // Check if agent exists
    const agent = await prisma.user.findUnique({
      where: { id: agentId, role: 'AGENT' },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    // Check if reviewer already reviewed this agent
    const existingReview = await prisma.agentReview.findFirst({
      where: { agentId, reviewerId },
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this agent', 400);
    }

    return prisma.agentReview.create({
      data: {
        agentId,
        reviewerId,
        rating: data.rating,
        title: data.title,
        content: data.content,
        wouldRecommend: data.wouldRecommend ?? true,
      },
      include: {
        reviewer: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  async getAgentStats(agentId: string) {
    const [
      totalListings,
      activeListings,
      soldListings,
      totalLeads,
      closedLeads,
      avgRating,
      totalReviews,
    ] = await Promise.all([
      prisma.property.count({ where: { agentId } }),
      prisma.property.count({ where: { agentId, status: 'ACTIVE' } }),
      prisma.property.count({ where: { agentId, status: 'SOLD' } }),
      prisma.lead.count({ where: { agentId } }),
      prisma.lead.count({ where: { agentId, status: 'CLOSED_WON' } }),
      prisma.agentReview.aggregate({
        where: { agentId },
        _avg: { rating: true },
      }),
      prisma.agentReview.count({ where: { agentId } }),
    ]);

    const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

    return {
      listings: {
        total: totalListings,
        active: activeListings,
        sold: soldListings,
        pending: totalListings - activeListings - soldListings,
      },
      leads: {
        total: totalLeads,
        closed: closedLeads,
        conversionRate: Math.round(conversionRate * 10) / 10,
      },
      reviews: {
        averageRating: avgRating._avg.rating || 0,
        totalReviews,
      },
    };
  }

  async getDashboardOverview(agentId: string) {
    const [stats, recentLeads, upcomingShowings, recentActivity] = await Promise.all([
      this.getAgentStats(agentId),
      prisma.lead.findMany({
        where: { agentId },
        include: {
          property: { select: { title: true, address: true } },
          buyer: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.showing.findMany({
        where: {
          agentId,
          scheduledAt: { gte: new Date() },
          status: { in: ['CONFIRMED', 'REQUESTED'] },
        },
        include: {
          property: { select: { title: true, address: true } },
          buyer: { select: { firstName: true, lastName: true, phone: true } },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      }),
      prisma.viewHistory.findMany({
        where: {
          property: { agentId },
        },
        include: {
          property: { select: { title: true } },
          user: { select: { firstName: true, lastName: true } },
        },
        orderBy: { viewedAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      stats,
      recentLeads,
      upcomingShowings,
      recentActivity,
    };
  }

  async getAgentListings(agentId: string, status?: string, page = 1, limit = 20) {
    const where: Prisma.PropertyWhereInput = { agentId };
    if (status) {
      where.status = status as Prisma.EnumPropertyStatusFilter;
    }

    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          _count: { select: { favorites: true, viewHistory: true, leads: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return {
      listings,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAgentPerformance(agentId: string, period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [newLeads, closedDeals, propertyViews, showingsCompleted] = await Promise.all([
      prisma.lead.count({
        where: { agentId, createdAt: { gte: startDate } },
      }),
      prisma.lead.count({
        where: { agentId, status: 'CLOSED_WON', updatedAt: { gte: startDate } },
      }),
      prisma.viewHistory.count({
        where: { property: { agentId }, viewedAt: { gte: startDate } },
      }),
      prisma.showing.count({
        where: { agentId, status: 'COMPLETED', updatedAt: { gte: startDate } },
      }),
    ]);

    return {
      period,
      startDate,
      endDate: now,
      metrics: {
        newLeads,
        closedDeals,
        propertyViews,
        showingsCompleted,
        leadToShowingRate: newLeads > 0 ? Math.round((showingsCompleted / newLeads) * 100) : 0,
        showingToCloseRate: showingsCompleted > 0 ? Math.round((closedDeals / showingsCompleted) * 100) : 0,
      },
    };
  }
}

export default new AgentService();
