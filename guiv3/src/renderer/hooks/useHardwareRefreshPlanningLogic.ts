import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hardware asset data model
 */
export interface HardwareAsset {
  id: string;
  name: string;
  type: 'server' | 'workstation' | 'laptop' | 'network_device' | 'storage' | 'other';
  model: string;
  manufacturer: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyEndDate: string;
  location: string;
  status: 'active' | 'maintenance' | 'retired' | 'planned_replacement';
  lifecycleStage: 'new' | 'active' | 'end_of_life' | 'obsolete';
  estimatedLifespan: number; // in months
  currentAge: number; // in months
  lastAssessment: string;
  nextAssessment?: string;
  notes: string;
}

/**
 * Hardware refresh plan data model
 */
export interface HardwareRefreshPlan {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  budget: number;
  currency: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assets: HardwareAsset[];
  milestones: PlanMilestone[];
  risks: PlanRisk[];
}

/**
 * Plan milestone data model
 */
export interface PlanMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dependencies?: string[]; // milestone IDs
  assignedTo?: string;
  progress: number; // 0-100
}

/**
 * Plan risk data model
 */
export interface PlanRisk {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigationStrategy: string;
  status: 'identified' | 'mitigated' | 'occurred';
  owner?: string;
}

/**
 * Hardware assessment data model
 */
export interface HardwareAssessment {
  id: string;
  assetId: string;
  assessmentDate: string;
  assessor: string;
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  performanceScore: number; // 0-100
  reliabilityScore: number; // 0-100
  efficiencyScore: number; // 0-100
  recommendations: AssessmentRecommendation[];
  estimatedReplacementCost: number;
  priorityLevel: 'low' | 'medium' | 'high' | 'immediate';
}

/**
 * Assessment recommendation data model
 */
export interface AssessmentRecommendation {
  id: string;
  type: 'replace' | 'upgrade' | 'maintain' | 'monitor' | 'retire';
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedCost: number;
  timeline: string; // e.g., "3 months", "6 months"
  rationale: string;
}

/**
 * Hardware lifecycle analytics
 */
export interface HardwareLifecycleAnalytics {
  totalAssets: number;
  activeAssets: number;
  assetsNearEndOfLife: number;
  assetsOverdueAssessment: number;
  averageAssetAge: number;
  totalBudgetUtilized: number;
  plannedReplacementsThisYear: number;
  lifecycleStageDistribution: { [key: string]: number };
  costByCategory: { [key: string]: number };
}

/**
 * Custom hook for hardware refresh planning logic
 */
export const useHardwareRefreshPlanningLogic = () => {
  const [assets, setAssets] = useState<HardwareAsset[]>([]);
  const [plans, setPlans] = useState<HardwareRefreshPlan[]>([]);
  const [assessments, setAssessments] = useState<HardwareAssessment[]>([]);
  const [analytics, setAnalytics] = useState<HardwareLifecycleAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Calculate current age of asset in months
   */
  const calculateAssetAge = useCallback((purchaseDate: string): number => {
    const purchase = new Date(purchaseDate);
    const now = new Date();
    return Math.floor((now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24 * 30));
  }, []);

  /**
   * Determine lifecycle stage based on age and lifespan
   */
  const determineLifecycleStage = useCallback((currentAge: number, estimatedLifespan: number): HardwareAsset['lifecycleStage'] => {
    const ageRatio = currentAge / estimatedLifespan;
    if (ageRatio < 0.3) return 'new';
    if (ageRatio < 0.8) return 'active';
    if (ageRatio < 1.0) return 'end_of_life';
    return 'obsolete';
  }, []);

  /**
   * Create new hardware asset
   */
  const createAsset = useCallback(async (assetData: Omit<HardwareAsset, 'id' | 'currentAge' | 'lifecycleStage' | 'lastAssessment'>) => {
    try {
      const currentAge = calculateAssetAge(assetData.purchaseDate);
      const lifecycleStage = determineLifecycleStage(currentAge, assetData.estimatedLifespan);

      const newAsset: HardwareAsset = {
        ...assetData,
        id: `asset-${Date.now()}`,
        currentAge,
        lifecycleStage,
        lastAssessment: new Date().toISOString(),
      };

      setAssets(prev => [...prev, newAsset]);
      console.info('[HardwareRefreshPlanning] Created hardware asset:', newAsset.id);
      return newAsset;
    } catch (err: any) {
      console.error('[HardwareRefreshPlanning] Failed to create asset:', err);
      setError(`Failed to create asset: ${err.message}`);
      return null;
    }
  }, [calculateAssetAge, determineLifecycleStage]);

  /**
   * Update existing hardware asset
   */
  const updateAsset = useCallback(async (id: string, updates: Partial<HardwareAsset>) => {
    try {
      setAssets(prev => prev.map(asset => {
        if (asset.id !== id) return asset;

        const updated = { ...asset, ...updates };
        if (updates.purchaseDate || updates.estimatedLifespan) {
          const purchaseDate = updates.purchaseDate || asset.purchaseDate;
          const lifespan = updates.estimatedLifespan || asset.estimatedLifespan;
          updated.currentAge = calculateAssetAge(purchaseDate);
          updated.lifecycleStage = determineLifecycleStage(updated.currentAge, lifespan);
        }

        return updated;
      }));

      console.info('[HardwareRefreshPlanning] Updated hardware asset:', id);
    } catch (err: any) {
      console.error('[HardwareRefreshPlanning] Failed to update asset:', err);
      setError(`Failed to update asset: ${err.message}`);
    }
  }, [calculateAssetAge, determineLifecycleStage]);

  /**
   * Create hardware refresh plan
   */
  const createPlan = useCallback(async (planData: Omit<HardwareRefreshPlan, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    try {
      const newPlan: HardwareRefreshPlan = {
        ...planData,
        id: `plan-${Date.now()}`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setPlans(prev => [...prev, newPlan]);
      console.info('[HardwareRefreshPlanning] Created refresh plan:', newPlan.id);
      return newPlan;
    } catch (err: any) {
      console.error('[HardwareRefreshPlanning] Failed to create plan:', err);
      setError(`Failed to create plan: ${err.message}`);
      return null;
    }
  }, []);

  /**
   * Update refresh plan
   */
  const updatePlan = useCallback(async (id: string, updates: Partial<HardwareRefreshPlan>) => {
    try {
      setPlans(prev => prev.map(plan =>
        plan.id === id ? { ...plan, ...updates, updatedAt: new Date().toISOString() } : plan
      ));

      console.info('[HardwareRefreshPlanning] Updated refresh plan:', id);
    } catch (err: any) {
      console.error('[HardwareRefreshPlanning] Failed to update plan:', err);
      setError(`Failed to update plan: ${err.message}`);
    }
  }, []);

  /**
   * Create hardware assessment
   */
  const createAssessment = useCallback(async (assessmentData: Omit<HardwareAssessment, 'id'>) => {
    try {
      const newAssessment: HardwareAssessment = {
        ...assessmentData,
        id: `assessment-${Date.now()}`,
      };

      setAssessments(prev => [...prev, newAssessment]);
      console.info('[HardwareRefreshPlanning] Created hardware assessment:', newAssessment.id);
      return newAssessment;
    } catch (err: any) {
      console.error('[HardwareRefreshPlanning] Failed to create assessment:', err);
      setError(`Failed to create assessment: ${err.message}`);
      return null;
    }
  }, []);

  /**
   * Add milestone to plan
   */
  const addPlanMilestone = useCallback(async (planId: string, milestone: Omit<PlanMilestone, 'id'>) => {
    try {
      setPlans(prev => prev.map(plan => {
        if (plan.id !== planId) return plan;
        const newMilestone: PlanMilestone = {
          ...milestone,
          id: `milestone-${Date.now()}`,
        };
        return {
          ...plan,
          milestones: [...plan.milestones, newMilestone],
          updatedAt: new Date().toISOString(),
        };
      }));

      console.info('[HardwareRefreshPlanning] Added milestone to plan:', planId);
    } catch (err: any) {
      console.error('[HardwareRefreshPlanning] Failed to add milestone:', err);
      setError(`Failed to add milestone: ${err.message}`);
    }
  }, []);

  /**
   * Calculate lifecycle analytics
   */
  const calculateAnalytics = useCallback((assets: HardwareAsset[], plans: HardwareRefreshPlan[]): HardwareLifecycleAnalytics => {
    const activeAssets = assets.filter(a => a.status === 'active').length;
    const assetsNearEndOfLife = assets.filter(a => a.lifecycleStage === 'end_of_life').length;
    const assetsOverdueAssessment = assets.filter(a => {
      if (!a.nextAssessment) return false;
      return new Date(a.nextAssessment) < new Date();
    }).length;

    const totalAge = assets.reduce((sum, asset) => sum + asset.currentAge, 0);
    const averageAssetAge = assets.length > 0 ? totalAge / assets.length : 0;

    const plannedReplacementsThisYear = plans
      .filter(p => p.status === 'in_progress' || p.status === 'approved')
      .reduce((sum, plan) => sum + plan.assets.length, 0);

    const lifecycleStageDistribution = assets.reduce((dist, asset) => {
      dist[asset.lifecycleStage] = (dist[asset.lifecycleStage] || 0) + 1;
      return dist;
    }, {} as { [key: string]: number });

    const costByCategory = assets.reduce((costs, asset) => {
      costs[asset.type] = (costs[asset.type] || 0) + (asset.status === 'planned_replacement' ? 1000 : 0); // Mock cost
      return costs;
    }, {} as { [key: string]: number });

    return {
      totalAssets: assets.length,
      activeAssets,
      assetsNearEndOfLife,
      assetsOverdueAssessment,
      averageAssetAge: Math.round(averageAssetAge * 10) / 10,
      totalBudgetUtilized: plans.reduce((sum, plan) => sum + plan.budget, 0),
      plannedReplacementsThisYear,
      lifecycleStageDistribution,
      costByCategory,
    };
  }, [assets, plans]);

  /**
   * Load hardware refresh planning data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock data loading - replace with actual API calls
      const mockAssets = generateMockHardwareAssets();
      const mockPlans = generateMockRefreshPlans();
      const mockAssessments = generateMockAssessments();

      const calculatedAnalytics = calculateAnalytics(mockAssets, mockPlans);

      setAssets(mockAssets);
      setPlans(mockPlans);
      setAssessments(mockAssessments);
      setAnalytics(calculatedAnalytics);

      console.info('[HardwareRefreshPlanning] Loaded hardware refresh planning data');
    } catch (err: any) {
      const errorMsg = `Failed to load hardware refresh planning data: ${err.message}`;
      console.error('[HardwareRefreshPlanning] Error:', err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [calculateAnalytics]);

  /**
   * Load data on mount
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Set up real-time refresh
   */
  const startRealTimeUpdates = useCallback((intervalMs: number = 60000) => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(() => {
      loadData();
    }, intervalMs);

    console.info('[HardwareRefreshPlanning] Started real-time updates');
  }, [loadData]);

  /**
   * Stop real-time updates
   */
  const stopRealTimeUpdates = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
      console.info('[HardwareRefreshPlanning] Stopped real-time updates');
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopRealTimeUpdates();
    };
  }, [stopRealTimeUpdates]);

  /**
   * Get assets by lifecycle stage
   */
  const getAssetsByLifecycleStage = useCallback((stage: HardwareAsset['lifecycleStage']) => {
    return assets.filter(asset => asset.lifecycleStage === stage);
  }, [assets]);

  /**
   * Get overdue assessments
   */
  const getOverdueAssessments = useCallback(() => {
    return assets.filter(asset => {
      if (!asset.nextAssessment) return false;
      return new Date(asset.nextAssessment) < new Date();
    });
  }, [assets]);

  /**
   * Get plans by status
   */
  const getPlansByStatus = useCallback((status: HardwareRefreshPlan['status']) => {
    return plans.filter(plan => plan.status === status);
  }, [plans]);

  return {
    assets,
    plans,
    assessments,
    analytics,
    isLoading,
    error,
    createAsset,
    updateAsset,
    createPlan,
    updatePlan,
    createAssessment,
    addPlanMilestone,
    getAssetsByLifecycleStage,
    getOverdueAssessments,
    getPlansByStatus,
    refreshData: loadData,
    startRealTimeUpdates,
    stopRealTimeUpdates,
  };
};

/**
 * Generate mock hardware assets for development
 */
function generateMockHardwareAssets(): HardwareAsset[] {
  const types: HardwareAsset['type'][] = ['server', 'workstation', 'laptop', 'network_device', 'storage'];
  const manufacturers = ['Dell', 'HP', 'Lenovo', 'Cisco', 'NetApp'];
  const models = ['PowerEdge R750', 'ProLiant DL380', 'ThinkPad X1', 'Catalyst 9300', ' FAS2750'];

  return Array.from({ length: 20 }, (_, index) => {
    const purchaseDate = new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000);
    const estimatedLifespan = 36 + Math.floor(Math.random() * 24); // 3-5 years
    const currentAge = Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

    return {
      id: `asset-${index + 1}`,
      name: `${types[index % types.length].replace('_', ' ')} ${index + 1}`,
      type: types[index % types.length],
      model: models[index % models.length],
      manufacturer: manufacturers[index % manufacturers.length],
      serialNumber: `SN${String(index + 1000).padStart(6, '0')}`,
      purchaseDate: purchaseDate.toISOString().split('T')[0],
      warrantyEndDate: new Date(purchaseDate.getTime() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: ['Data Center A', 'Office Floor 3', 'Remote Office'][index % 3],
      status: ['active', 'maintenance', 'planned_replacement'][index % 3] as HardwareAsset['status'],
      lifecycleStage: currentAge / estimatedLifespan > 0.8 ? 'end_of_life' : 'active',
      estimatedLifespan,
      currentAge,
      lastAssessment: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      nextAssessment: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      notes: `Asset ${index + 1} assessment notes`,
    };
  });
}

/**
 * Generate mock refresh plans for development
 */
function generateMockRefreshPlans(): HardwareRefreshPlan[] {
  const statuses: HardwareRefreshPlan['status'][] = ['draft', 'approved', 'in_progress', 'completed'];

  return Array.from({ length: 3 }, (_, index) => ({
    id: `plan-${index + 1}`,
    title: `Q${(index % 4) + 1} Hardware Refresh Plan`,
    description: `Comprehensive hardware refresh plan for Q${(index % 4) + 1}`,
    startDate: new Date(Date.now() + index * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + (index + 1) * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: statuses[index % statuses.length],
    priority: ['medium', 'high', 'critical'][index % 3] as HardwareRefreshPlan['priority'],
    budget: 50000 + Math.floor(Math.random() * 100000),
    currency: 'USD',
    createdBy: 'admin@example.com',
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    assets: [], // Would be populated with actual asset IDs
    milestones: [
      {
        id: `milestone-${index + 1}-1`,
        title: 'Assessment Phase',
        description: 'Complete hardware assessments',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'completed',
        progress: 100,
      },
    ],
    risks: [
      {
        id: `risk-${index + 1}-1`,
        title: 'Budget overruns',
        description: 'Potential cost increases due to market conditions',
        probability: 'medium',
        impact: 'high',
        mitigationStrategy: 'Regular budget monitoring and contingency planning',
        status: 'identified',
      },
    ],
  }));
}

/**
 * Generate mock assessments for development
 */
function generateMockAssessments(): HardwareAssessment[] {
  return Array.from({ length: 5 }, (_, index) => ({
    id: `assessment-${index + 1}`,
    assetId: `asset-${index + 1}`,
    assessmentDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    assessor: 'John Doe',
    overallCondition: ['good', 'fair', 'poor'][index % 3] as HardwareAssessment['overallCondition'],
    performanceScore: 60 + Math.floor(Math.random() * 40),
    reliabilityScore: 70 + Math.floor(Math.random() * 30),
    efficiencyScore: 65 + Math.floor(Math.random() * 35),
    recommendations: [
      {
        id: `rec-${index + 1}-1`,
        type: 'upgrade',
        description: 'Upgrade memory and storage',
        priority: 'medium',
        estimatedCost: 2000 + Math.floor(Math.random() * 3000),
        timeline: '3 months',
        rationale: 'Current configuration limiting performance',
      },
    ],
    estimatedReplacementCost: 5000 + Math.floor(Math.random() * 10000),
    priorityLevel: ['low', 'medium', 'high'][index % 3] as HardwareAssessment['priorityLevel'],
  }));
}