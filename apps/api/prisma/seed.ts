import { PrismaClient, Role, PropertyStatus, PropertyType, PriceEventType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to generate random number in range
const randomInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Sample data arrays
const cities = [
  { city: 'Austin', state: 'TX', zip: '78701', lat: 30.2672, lng: -97.7431 },
  { city: 'Phoenix', state: 'AZ', zip: '85001', lat: 33.4484, lng: -112.0740 },
  { city: 'Tampa', state: 'FL', zip: '33601', lat: 27.9506, lng: -82.4572 },
  { city: 'Nashville', state: 'TN', zip: '37201', lat: 36.1627, lng: -86.7816 },
  { city: 'Denver', state: 'CO', zip: '80201', lat: 39.7392, lng: -104.9903 },
  { city: 'Seattle', state: 'WA', zip: '98101', lat: 47.6062, lng: -122.3321 },
  { city: 'Atlanta', state: 'GA', zip: '30301', lat: 33.7490, lng: -84.3880 },
  { city: 'Charlotte', state: 'NC', zip: '28201', lat: 35.2271, lng: -80.8431 },
];

const streetNames = ['Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Birch', 'Willow', 'Magnolia', 'Cypress', 'Aspen'];
const streetTypes = ['Street', 'Avenue', 'Drive', 'Lane', 'Court', 'Way', 'Place', 'Boulevard'];
const features = ['Hardwood Floors', 'Granite Counters', 'Stainless Appliances', 'Smart Home', 'Solar Panels', 'EV Charger', 'Wine Cellar', 'Home Theater', 'Pool', 'Hot Tub', 'Outdoor Kitchen', 'Fire Pit'];

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.agentReview.deleteMany();
  await prisma.showing.deleteMany();
  await prisma.leadNote.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.viewHistory.deleteMany();
  await prisma.favoriteProperty.deleteMany();
  await prisma.savedSearch.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.marketTrend.deleteMany();
  await prisma.neighborhood.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const agent1 = await prisma.user.create({
    data: {
      email: 'agent1@example.com',
      passwordHash,
      role: Role.AGENT,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '555-0101',
      licenseNumber: 'RE-123456',
      agencyName: 'Premium Realty',
      isVerified: true,
      isActive: true,
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      email: 'agent2@example.com',
      passwordHash,
      role: Role.AGENT,
      firstName: 'Michael',
      lastName: 'Chen',
      phone: '555-0102',
      licenseNumber: 'RE-789012',
      agencyName: 'Elite Properties',
      isVerified: true,
      isActive: true,
    },
  });

  const buyer1 = await prisma.user.create({
    data: {
      email: 'buyer1@example.com',
      passwordHash,
      role: Role.BUYER,
      firstName: 'Emma',
      lastName: 'Davis',
      phone: '555-0201',
      isVerified: true,
      isActive: true,
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      email: 'buyer2@example.com',
      passwordHash,
      role: Role.BUYER,
      firstName: 'James',
      lastName: 'Wilson',
      phone: '555-0202',
      isVerified: true,
      isActive: true,
    },
  });

  const property1 = await prisma.property.create({
    data: {
      title: 'Beautiful Family Home in Suburbs',
      description: 'Spacious 4-bedroom home with modern amenities, large backyard, and excellent school district.',
      price: 450000,
      bedrooms: 4,
      bathrooms: 2.5,
      sqft: 2500,
      lotSize: 8000,
      yearBuilt: 2015,
      propertyType: PropertyType.HOUSE,
      address: '123 Oak Street',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      latitude: 39.7817,
      longitude: -89.6501,
      status: PropertyStatus.ACTIVE,
      agentId: agent1.id,
      images: {
        create: [
          { url: 'https://example.com/images/property1-1.jpg', isPrimary: true, order: 0 },
          { url: 'https://example.com/images/property1-2.jpg', isPrimary: false, order: 1 },
        ],
      },
    },
  });

  const property2 = await prisma.property.create({
    data: {
      title: 'Modern Downtown Condo',
      description: 'Luxury 2-bedroom condo with city views, gym, and rooftop terrace.',
      price: 325000,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      yearBuilt: 2020,
      propertyType: PropertyType.CONDO,
      address: '456 Main Avenue',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62702',
      latitude: 39.7990,
      longitude: -89.6440,
      status: PropertyStatus.ACTIVE,
      agentId: agent2.id,
      images: {
        create: [
          { url: 'https://example.com/images/property2-1.jpg', isPrimary: true, order: 0 },
        ],
      },
    },
  });

  await prisma.favoriteProperty.create({
    data: {
      userId: buyer1.id,
      propertyId: property1.id,
    },
  });

  await prisma.savedSearch.create({
    data: {
      userId: buyer1.id,
      name: 'Family Homes Under 500k',
      criteria: {
        priceMax: 500000,
        bedrooms: 3,
        propertyType: 'HOUSE',
      },
    },
  });

  console.log('Database seeded successfully!');
  console.log('\nTest Accounts:');
  console.log('Agent 1: agent1@example.com / Password123!');
  console.log('Agent 2: agent2@example.com / Password123!');
  console.log('Buyer 1: buyer1@example.com / Password123!');
  console.log('Buyer 2: buyer2@example.com / Password123!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
