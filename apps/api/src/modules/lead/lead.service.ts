import { Prisma, LeadStatus } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

interface CreateLeadData {
  propertyId: string;
  buyerId: string;
  message?: string;
}

interface ListLeadsParams {
  agentId: string;
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class LeadService {
  async createLead(data: CreateLeadData) {
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
      select: { agentId: true },
    });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    // Check if lead already exists
    const existingLead = await prisma.lead.findFirst({
      where: {
        propertyId: data.propertyId,
        buyerId: data.buyerId,
      },
    });

    if (existingLead) {
      throw new AppError('You have already inquired about this property', 400);
    }

    return prisma.lead.create({
      data: {
        propertyId: data.propertyId,
        buyerId: data.buyerId,
        agentId: property.agentId,
        message: data.message,
        qualityScore: this.calculateQualityScore(data),
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            price: true,
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
      },
    });
  }

  async getLeadById(id: string, userId: string) {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            state: true,
            price: true,
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
        notes: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Only agent or buyer can view the lead
    if (lead.agentId !== userId && lead.buyerId !== userId) {
      throw new AppError('Not authorized to view this lead', 403);
    }

    return lead;
  }

  async listLeads(params: ListLeadsParams) {
    const {
      agentId,
      page = 1,
      limit = 20,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const where: Prisma.LeadWhereInput = { agentId };

    if (status) {
      where.status = status as LeadStatus;
    }

    const orderBy: Prisma.LeadOrderByWithRelationInput = {};
    const validSortFields = ['createdAt', 'status', 'qualityScore'];
    if (validSortFields.includes(sortBy)) {
      (orderBy as Record<string, string>)[sortBy] = sortOrder;
    }

    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              price: true,
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
          _count: { select: { notes: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return {
      leads,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateLead(id: string, agentId: string, data: { status?: LeadStatus; qualityScore?: number }) {
    const lead = await prisma.lead.findUnique({ where: { id } });

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    if (lead.agentId !== agentId) {
      throw new AppError('Not authorized to update this lead', 403);
    }

    const updateData: Prisma.LeadUpdateInput = {};

    if (data.status) {
      updateData.status = data.status;
      
      if (data.status === 'CONTACTED' && !lead.contactedAt) {
        updateData.contactedAt = new Date();
      }
      if (data.status !== 'NEW' && !lead.respondedAt) {
        updateData.respondedAt = new Date();
      }
    }

    if (data.qualityScore !== undefined) {
      updateData.qualityScore = data.qualityScore;
    }

    return prisma.lead.update({
      where: { id },
      data: updateData,
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

  async addNote(leadId: string, userId: string, content: string) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    if (lead.agentId !== userId && lead.buyerId !== userId) {
      throw new AppError('Not authorized to add notes to this lead', 403);
    }

    return prisma.leadNote.create({
      data: {
        leadId,
        userId,
        content,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async getLeadStats(agentId: string) {
    const [total, byStatus, recentLeads, avgResponseTime] = await Promise.all([
      prisma.lead.count({ where: { agentId } }),
      prisma.lead.groupBy({
        by: ['status'],
        where: { agentId },
        _count: true,
      }),
      prisma.lead.count({
        where: {
          agentId,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      this.calculateAvgResponseTime(agentId),
    ]);

    const statusCounts = byStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    const conversionRate = total > 0
      ? ((statusCounts['CLOSED_WON'] || 0) / total) * 100
      : 0;

    return {
      total,
      thisWeek: recentLeads,
      byStatus: statusCounts,
      conversionRate: Math.round(conversionRate * 100) / 100,
      avgResponseTimeHours: avgResponseTime,
    };
  }

  private calculateQualityScore(data: CreateLeadData): number {
    let score = 50; // Base score

    if (data.message && data.message.length > 50) {
      score += 20;
    }
    if (data.message && data.message.length > 100) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  private async calculateAvgResponseTime(agentId: string): Promise<number> {
    const leads = await prisma.lead.findMany({
      where: {
        agentId,
        respondedAt: { not: null },
      },
      select: {
        createdAt: true,
        respondedAt: true,
      },
    });

    if (leads.length === 0) return 0;

    const totalHours = leads.reduce((sum, lead) => {
      if (lead.respondedAt) {
        const diff = lead.respondedAt.getTime() - lead.createdAt.getTime();
        return sum + diff / (1000 * 60 * 60);
      }
      return sum;
    }, 0);

    return Math.round((totalHours / leads.length) * 10) / 10;
  }
}

export default new LeadService();
