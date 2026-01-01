/**
 * Mock Statistics Helper Functions for Testing
 */

export interface UniversalStats {
  totalItems: number;
  processedItems: number;
  successRate: number;
  averageProcessingTime: number;
  lastUpdated: Date;
  categories: Record<string, number>;
  trends: Array<{
    date: Date;
    value: number;
    category: string;
  }>;
}

export const createUniversalStats = (overrides: Partial<UniversalStats> = {}): UniversalStats => {
  return {
    totalItems: 1000,
    processedItems: 850,
    successRate: 85.0,
    averageProcessingTime: 2500, // milliseconds
    lastUpdated: new Date(),
    categories: {
      users: 450,
      groups: 120,
      devices: 280,
      ...overrides.categories
    },
    trends: [
      { date: new Date(Date.now() - 86400000), value: 82, category: 'success' },
      { date: new Date(Date.now() - 43200000), value: 85, category: 'success' },
      { date: new Date(), value: 87, category: 'success' }
    ],
    ...overrides
  };
};

export default createUniversalStats;

