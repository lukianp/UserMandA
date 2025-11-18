import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Cost analysis data interfaces
 */
interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
  trend: number; // Percentage change from previous period
}

interface CostProjection {
  month: string;
  currentSpend: number;
  projectedSpend: number;
  savings: number;
}

interface CostOptimization {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

interface CostAnalysisData {
  totalMonthlyCost: number;
  totalAnnualCost: number;
  costBreakdown: CostBreakdown[];
  costProjections: CostProjection[];
  optimizations: CostOptimization[];
  lastUpdated: Date;
}

/**
 * Generate mock cost analysis data
 * In real implementation, this would aggregate from various data sources
 */
function getMockCostAnalysisData(): CostAnalysisData {
  const costBreakdown: CostBreakdown[] = [
    { category: 'Licensing', amount: 45000, percentage: 35, trend: 5.2 },
    { category: 'Infrastructure', amount: 32000, percentage: 25, trend: -2.1 },
    { category: 'Cloud Services', amount: 28000, percentage: 22, trend: 12.8 },
    { category: 'Security', amount: 12000, percentage: 9, trend: 3.7 },
    { category: 'Other', amount: 9000, percentage: 7, trend: -1.5 },
    { category: 'Professional Services', amount: 2000, percentage: 2, trend: 8.3 },
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const costProjections: CostProjection[] = months.map((month, index) => {
    const baseCost = 120000;
    const growthFactor = 0.02 + (index * 0.005); // Gradual cost increase
    const savingsFactor = index * 2000; // Increasing savings from optimizations

    return {
      month,
      currentSpend: Math.floor(baseCost * (1 + growthFactor)),
      projectedSpend: Math.floor(baseCost * (1 + growthFactor) * 0.95), // 5% reduction
      savings: savingsFactor,
    };
  });

  const optimizations: CostOptimization[] = [
    {
      id: '1',
      title: 'License Optimization',
      description: 'Reclaim unused Microsoft 365 licenses',
      potentialSavings: 8500,
      effort: 'low',
      impact: 'high',
    },
    {
      id: '2',
      title: 'Cloud Resource Rightsizing',
      description: 'Downsize over-provisioned cloud instances',
      potentialSavings: 6200,
      effort: 'medium',
      impact: 'high',
    },
    {
      id: '3',
      title: 'Software Rationalization',
      description: 'Consolidate overlapping application licenses',
      potentialSavings: 4200,
      effort: 'high',
      impact: 'medium',
    },
    {
      id: '4',
      title: 'Network Optimization',
      description: 'Implement WAN acceleration and bandwidth optimization',
      potentialSavings: 3100,
      effort: 'medium',
      impact: 'medium',
    },
  ];

  return {
    totalMonthlyCost: 127000,
    totalAnnualCost: 1524000,
    costBreakdown,
    costProjections,
    optimizations,
    lastUpdated: new Date(),
  };
}

/**
 * Custom hook for Cost Analysis logic
 * Provides comprehensive cost analysis and optimization recommendations
 */
export const useCostAnalysisLogic = () => {
  const [costData, setCostData] = useState<CostAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'3months' | '6months' | '1year'>('6months');

  const fetchCostAnalysis = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In real implementation, this would fetch from multiple data sources:
      // - Licensing systems
      // - Cloud provider APIs
      // - Infrastructure monitoring
      // - Procurement systems

      const data = getMockCostAnalysisData();
      setCostData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cost data';
      setError(errorMessage);
      console.error('Cost analysis fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCostAnalysis();
  }, [fetchCostAnalysis]);

  // Filtered projections based on time range
  const filteredProjections = useMemo(() => {
    if (!costData) return [];

    const rangeMap = {
      '3months': 3,
      '6months': 6,
      '1year': 12,
    };

    return costData.costProjections.slice(0, rangeMap[selectedTimeRange]);
  }, [costData, selectedTimeRange]);

  // Calculate potential total savings
  const potentialSavings = useMemo(() => {
    if (!costData) return 0;
    return costData.optimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0);
  }, [costData]);

  return {
    costData,
    isLoading,
    error,
    selectedTimeRange,
    setSelectedTimeRange,
    filteredProjections,
    potentialSavings,
    refreshData: fetchCostAnalysis,
  };
};