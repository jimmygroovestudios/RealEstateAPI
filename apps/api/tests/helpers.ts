import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Role } from '@prisma/client';
import { prisma } from './setup';

export const createTestUser = async (
  overrides?: Partial<User>
): Promise<User> => {
  const passwordHash = await bcrypt.hash('TestPassword123!', 10);

  return prisma.user.create({
    data: {
      email: overrides?.email || faker.internet.email(),
      passwordHash,
      role: overrides?.role || Role.BUYER,
      firstName: overrides?.firstName || faker.person.firstName(),
      lastName: overrides?.lastName || faker.person.lastName(),
      phone: overrides?.phone || faker.phone.number(),
      isVerified: overrides?.isVerified ?? false,
      isActive: overrides?.isActive ?? true,
      ...overrides,
    },
  });
};

export const generateAuthToken = (user: User): string => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
};

export const createTestProperty = async (agentId: string, overrides?: any) => {
  return prisma.property.create({
    data: {
      title: overrides?.title || faker.lorem.words(3),
      description: overrides?.description || faker.lorem.paragraph(),
      price: overrides?.price || faker.number.int({ min: 100000, max: 1000000 }),
      bedrooms: overrides?.bedrooms || faker.number.int({ min: 1, max: 5 }),
      bathrooms: overrides?.bathrooms || faker.number.int({ min: 1, max: 3 }),
      sqft: overrides?.sqft || faker.number.int({ min: 500, max: 5000 }),
      address: overrides?.address || faker.location.streetAddress(),
      city: overrides?.city || faker.location.city(),
      state: overrides?.state || faker.location.state({ abbreviated: true }),
      zipCode: overrides?.zipCode || faker.location.zipCode(),
      latitude: overrides?.latitude || faker.location.latitude(),
      longitude: overrides?.longitude || faker.location.longitude(),
      agentId,
      ...overrides,
    },
  });
};
