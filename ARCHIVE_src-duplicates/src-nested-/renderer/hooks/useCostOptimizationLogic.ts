import { useState, useCallback } from 'react';

export interface CostAnalysis {
  id: string;
  resourceType: string;
  resourceName: string;
  currentCost: number;
  projectedSavings: number;
  confidence: number;
  recommendations: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  lastAnalyzed: Date;
}

export interface CostOptimizationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  triggerType: 'threshold' | 'schedule' | 'manual';
  conditions: Record<string, any>;
  actions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CostOptimizationLogicReturn {
  costAnalyses: CostAnalysis[];
  optimizationRules: CostOptimizationRule[];
  isLoading: boolean;
  error: string | null;
  totalCost: number;
  projectedSavings: number;
  runCostAnalysis: () => Promise<void>;
  applyOptimization: (analysisId: string) => Promise<void>;
  createRule: (rule: Omit<CostOptimizationRule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRule: (id: string, updates: Partial<CostOptimizationRule>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  exportReport: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useCostOptimizationLogic(): CostOptimizationLogicReturn {
  const [costAnalyses, setCostAnalyses] = useState<CostAnalysis[]>([
    {
      id: 'analysis-1',
      resourceType: 'Virtual Machine',
      resourceName: 'web-server-01',
      currentCost: 2450.50,
      projectedSavings: 1225.25,
      confidence: 0.85,
      recommendations: [
        'Resize to smaller instance type during off-hours',
        'Use reserved instances for predictable workloads',
        'Implement auto-scaling to reduce idle time',
      ],
      priority: 'high',
      tags: ['compute', 'web-tier', 'production'],
      lastAnalyzed: new Date('2025-01-15'),
    },
    {
      id: 'analysis-2',
      resourceType: 'Storage Account',
      resourceName: 'data-lake-01',
      currentCost: 890.75,
      projectedSavings: 267.23,
      confidence: 0.92,
      recommendations: [
        'Enable lifecycle management policies',
        'Move infrequently accessed data to archive tier',
        'Implement data deduplication',
      ],
      priority: 'medium',
      tags: ['storage', 'data-lake', 'analytics'],
      lastAnalyzed: new Date('2025-01-14'),
    },
  ]);

  const [optimizationRules, setOptimizationRules] = useState<CostOptimizationRule[]>([
    {
      id: 'rule-1',
      name: 'Auto-scale web servers',
      description: 'Automatically scale down web servers during low traffic hours',
      enabled: true,
      triggerType: 'schedule',
      conditions: {
        timeRange: '22:00-06:00',
        utilizationThreshold: 30,
      },
      actions: ['scale_down_instances', 'notify_team'],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-10'),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCost = costAnalyses.reduce((sum, analysis) => sum + analysis.currentCost, 0);
  const projectedSavings = costAnalyses.reduce((sum, analysis) => sum + analysis.projectedSavings, 0);

  const runCostAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate cost analysis
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock new analysis results
      const newAnalyses: CostAnalysis[] = [
        {
          id: `analysis-${Date.now()}`,
          resourceType: 'Database',
          resourceName: 'sql-server-01',
          currentCost: 1850.00,
          projectedSavings: 555.00,
          confidence: 0.78,
          recommendations: [
            'Optimize query performance',
            'Use read replicas for reporting workloads',
            'Implement database indexing strategy',
          ],
          priority: 'high',
          tags: ['database', 'sql-server', 'production'],
          lastAnalyzed: new Date(),
        },
      ];

      setCostAnalyses(prev => [...prev, ...newAnalyses]);
    } catch (err) {
      setError('Failed to run cost analysis');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyOptimization = useCallback(async (analysisId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate applying optimization
      await new Promise(resolve => setTimeout(resolve, 1500));

      setCostAnalyses(prev =>
        prev.map(analysis =>
          analysis.id === analysisId
            ? { ...analysis, currentCost: analysis.currentCost - analysis.projectedSavings }
            : analysis
        )
      );
    } catch (err) {
      setError('Failed to apply optimization');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRule = useCallback(async (ruleData: Omit<CostOptimizationRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);

    try {
      const newRule: CostOptimizationRule = {
        ...ruleData,
        id: `rule-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setOptimizationRules(prev => [...prev, newRule]);
    } catch (err) {
      setError('Failed to create optimization rule');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRule = useCallback(async (id: string, updates: Partial<CostOptimizationRule>) => {
    setIsLoading(true);
    setError(null);

    try {
      setOptimizationRules(prev =>
        prev.map(rule =>
          rule.id === id
            ? { ...rule, ...updates, updatedAt: new Date() }
            : rule
        )
      );
    } catch (err) {
      setError('Failed to update optimization rule');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteRule = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      setOptimizationRules(prev => prev.filter(rule => rule.id !== id));
    } catch (err) {
      setError('Failed to delete optimization rule');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportReport = useCallback(async () => {
    setError(null);

    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Cost optimization report exported');
    } catch (err) {
      setError('Failed to export cost optimization report');
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock updated costs
      setCostAnalyses(prev =>
        prev.map(analysis => ({
          ...analysis,
          currentCost: analysis.currentCost * (0.95 + Math.random() * 0.1), // Slight variation
          lastAnalyzed: new Date(),
        }))
      );
    } catch (err) {
      setError('Failed to refresh cost data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    costAnalyses,
    optimizationRules,
    isLoading,
    error,
    totalCost,
    projectedSavings,
    runCostAnalysis,
    applyOptimization,
    createRule,
    updateRule,
    deleteRule,
    exportReport,
    refreshData,
  };
}