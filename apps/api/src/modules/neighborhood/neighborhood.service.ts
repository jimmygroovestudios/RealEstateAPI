import prisma from '../../config/database';

class NeighborhoodService {
  async getNeighborhoodByZip(zipCode: string) {
    const neighborhood = await prisma.neighborhood.findUnique({
      where: { zipCode },
      include: {
        marketTrends: {
          orderBy: { month: 'desc' },
          take: 12,
        },
      },
    });

    if (!neighborhood) {
      // Return mock data for demo purposes
      return this.generateMockNeighborhood(zipCode);
    }

    return neighborhood;
  }

  async getSchools(zipCode: string) {
    // Mock school data
    return {
      zipCode,
      schools: [
        {
          name: 'Lincoln Elementary School',
          type: 'Elementary',
          rating: 8,
          distance: 0.5,
          students: 450,
          grades: 'K-5',
        },
        {
          name: 'Washington Middle School',
          type: 'Middle',
          rating: 7,
          distance: 1.2,
          students: 680,
          grades: '6-8',
        },
        {
          name: 'Jefferson High School',
          type: 'High',
          rating: 9,
          distance: 2.1,
          students: 1200,
          grades: '9-12',
        },
      ],
      averageRating: 8.0,
    };
  }

  async getCrimeStats(zipCode: string) {
    // Mock crime data
    const crimeScore = Math.floor(Math.random() * 30) + 60; // 60-90 safety score
    return {
      zipCode,
      safetyScore: crimeScore,
      crimeIndex: 100 - crimeScore,
      comparison: crimeScore > 75 ? 'Safer than average' : 'Average safety',
      breakdown: {
        violent: Math.floor(Math.random() * 20) + 5,
        property: Math.floor(Math.random() * 40) + 20,
        other: Math.floor(Math.random() * 15) + 5,
      },
      trend: 'Decreasing',
    };
  }

  async getCommuteTime(zipCode: string, destination: string) {
    // Mock commute data
    const baseTime = Math.floor(Math.random() * 30) + 15;
    return {
      from: zipCode,
      to: destination,
      driving: {
        average: baseTime,
        peakHours: baseTime + 15,
        distance: Math.round(baseTime * 0.8 * 10) / 10,
      },
      transit: {
        average: baseTime + 20,
        transfers: Math.floor(Math.random() * 2) + 1,
      },
      walking: baseTime > 20 ? null : baseTime * 4,
      biking: baseTime > 30 ? null : baseTime * 2,
    };
  }

  async getDemographics(zipCode: string) {
    // Mock demographics
    return {
      zipCode,
      population: Math.floor(Math.random() * 50000) + 20000,
      medianAge: Math.floor(Math.random() * 15) + 30,
      medianIncome: Math.floor(Math.random() * 50000) + 60000,
      householdSize: Math.round((Math.random() * 1.5 + 2) * 10) / 10,
      education: {
        highSchool: 92,
        bachelors: 45,
        graduate: 18,
      },
      employment: {
        employed: 65,
        unemployed: 4,
        notInLaborForce: 31,
      },
      housing: {
        ownerOccupied: 58,
        renterOccupied: 42,
        medianHomeValue: Math.floor(Math.random() * 300000) + 300000,
        medianRent: Math.floor(Math.random() * 1000) + 1500,
      },
    };
  }

  async getMarketTrends(zipCode: string) {
    const neighborhood = await prisma.neighborhood.findUnique({
      where: { zipCode },
      include: {
        marketTrends: {
          orderBy: { month: 'desc' },
          take: 24,
        },
      },
    });

    if (!neighborhood || neighborhood.marketTrends.length === 0) {
      return this.generateMockMarketTrends(zipCode);
    }

    const trends = neighborhood.marketTrends;
    const current = trends[0];
    const yearAgo = trends[11] || trends[trends.length - 1];

    return {
      zipCode,
      current: {
        medianPrice: current.medianPrice,
        avgPricePerSqft: current.avgPricePerSqft,
        inventory: current.inventory,
        daysOnMarket: current.daysOnMarket,
      },
      yearOverYear: {
        priceChange: yearAgo ? 
          ((Number(current.medianPrice) - Number(yearAgo.medianPrice)) / Number(yearAgo.medianPrice) * 100).toFixed(1) : 
          null,
        inventoryChange: yearAgo ? current.inventory - yearAgo.inventory : null,
      },
      history: trends,
      forecast: {
        nextMonth: Number(current.medianPrice) * 1.005,
        next3Months: Number(current.medianPrice) * 1.015,
        next12Months: Number(current.medianPrice) * 1.04,
        confidence: 0.75,
      },
    };
  }

  async getHotMarkets(limit = 10) {
    // Mock hot markets data
    const markets = [
      { city: 'Austin', state: 'TX', priceGrowth: 12.5, daysOnMarket: 18 },
      { city: 'Phoenix', state: 'AZ', priceGrowth: 10.2, daysOnMarket: 22 },
      { city: 'Tampa', state: 'FL', priceGrowth: 9.8, daysOnMarket: 25 },
      { city: 'Nashville', state: 'TN', priceGrowth: 9.5, daysOnMarket: 20 },
      { city: 'Raleigh', state: 'NC', priceGrowth: 8.9, daysOnMarket: 28 },
      { city: 'Denver', state: 'CO', priceGrowth: 8.5, daysOnMarket: 24 },
      { city: 'Charlotte', state: 'NC', priceGrowth: 8.2, daysOnMarket: 26 },
      { city: 'Dallas', state: 'TX', priceGrowth: 7.8, daysOnMarket: 30 },
      { city: 'Seattle', state: 'WA', priceGrowth: 7.5, daysOnMarket: 32 },
      { city: 'Atlanta', state: 'GA', priceGrowth: 7.2, daysOnMarket: 28 },
    ];

    return markets.slice(0, limit).map((m, i) => ({
      rank: i + 1,
      ...m,
      hotnessScore: Math.round((m.priceGrowth * 5 + (50 - m.daysOnMarket)) * 10) / 10,
    }));
  }

  async getMarketForecast(zipCode: string) {
    const basePrice = Math.floor(Math.random() * 200000) + 400000;
    
    return {
      zipCode,
      currentMedianPrice: basePrice,
      forecasts: [
        { period: '1 month', price: basePrice * 1.005, change: 0.5 },
        { period: '3 months', price: basePrice * 1.015, change: 1.5 },
        { period: '6 months', price: basePrice * 1.025, change: 2.5 },
        { period: '12 months', price: basePrice * 1.04, change: 4.0 },
      ],
      marketCondition: 'Seller\'s Market',
      buyerDemand: 'High',
      inventoryLevel: 'Low',
      confidence: 0.78,
    };
  }

  async getInventoryStats() {
    return {
      national: {
        totalListings: 1250000,
        newListingsThisWeek: 85000,
        medianDaysOnMarket: 32,
        medianPrice: 425000,
      },
      trends: {
        listingsVsLastMonth: -2.5,
        listingsVsLastYear: -8.2,
        priceVsLastMonth: 0.8,
        priceVsLastYear: 5.2,
      },
      byPropertyType: {
        HOUSE: { count: 750000, medianPrice: 450000 },
        CONDO: { count: 280000, medianPrice: 350000 },
        TOWNHOUSE: { count: 150000, medianPrice: 380000 },
        APARTMENT: { count: 50000, medianPrice: 280000 },
        LAND: { count: 20000, medianPrice: 150000 },
      },
    };
  }

  private generateMockNeighborhood(zipCode: string) {
    return {
      id: `mock-${zipCode}`,
      zipCode,
      name: `${zipCode} Area`,
      city: 'Sample City',
      state: 'CA',
      county: 'Sample County',
      medianPrice: Math.floor(Math.random() * 300000) + 400000,
      medianRent: Math.floor(Math.random() * 1000) + 2000,
      walkScore: Math.floor(Math.random() * 30) + 60,
      transitScore: Math.floor(Math.random() * 40) + 40,
      bikeScore: Math.floor(Math.random() * 35) + 50,
      crimeScore: Math.floor(Math.random() * 20) + 70,
      schoolRating: Math.round((Math.random() * 3 + 6) * 10) / 10,
      population: Math.floor(Math.random() * 30000) + 20000,
      medianIncome: Math.floor(Math.random() * 40000) + 70000,
      medianAge: Math.floor(Math.random() * 10) + 32,
      description: 'A vibrant neighborhood with excellent amenities and strong community.',
      marketTrends: [],
    };
  }

  private generateMockMarketTrends(zipCode: string) {
    const basePrice = Math.floor(Math.random() * 200000) + 400000;
    const history = [];

    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      history.push({
        month: date.toISOString(),
        medianPrice: basePrice * (1 - i * 0.005),
        avgPricePerSqft: Math.round(basePrice / 2000 * (1 - i * 0.003)),
        inventory: Math.floor(Math.random() * 200) + 300,
        daysOnMarket: Math.floor(Math.random() * 15) + 25,
      });
    }

    return {
      zipCode,
      current: history[0],
      yearOverYear: {
        priceChange: '5.2',
        inventoryChange: -15,
      },
      history,
      forecast: {
        nextMonth: basePrice * 1.005,
        next3Months: basePrice * 1.015,
        next12Months: basePrice * 1.04,
        confidence: 0.75,
      },
    };
  }
}

export default new NeighborhoodService();
