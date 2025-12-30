/**
 * Commercial Planning Logic Hook
 *
 * Provides cost analysis, license overlap detection, and migration cost projections
 * for M&A planning and due diligence.
 *
 * Phase 10: Commercial Planning for M&A Integration
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { LICENSE_PRICING, LicensePriceInfo } from '../data/licensePricing';

// ===== TYPE DEFINITIONS =====

export interface LicenseInventoryItem {
  skuPartNumber: string;
  skuId: string;
  displayName: string;
  prepaidUnits: number;
  consumedUnits: number;
  availableUnits: number;
  pricePerMonth: number;
  monthlyTotal: number;
  annualTotal: number;
  category: string;
}

export interface LicenseOverlap {
  sourceSkuPartNumber: string;
  targetSkuPartNumber: string;
  displayName: string;
  sourceCount: number;
  targetCount: number;
  overlapCount: number;
  savingsOpportunity: number;
  recommendation: string;
}

export interface CostProjection {
  category: string;
  currentMonthly: number;
  currentAnnual: number;
  projectedMonthly: number;
  projectedAnnual: number;
  savings: number;
  percentChange: number;
}

export interface MigrationCost {
  category: string;
  description: string;
  oneTimeCost: number;
  recurringMonthlyCost: number;
  estimatedDuration: string;
  notes?: string;
}

export interface CommercialSummary {
  totalCurrentMonthlyCost: number;
  totalCurrentAnnualCost: number;
  totalProjectedMonthlyCost: number;
  totalProjectedAnnualCost: number;
  totalSavingsOpportunity: number;
  totalMigrationCost: number;
  breakEvenMonths: number;
  roiPercent: number;
}

// ===== MAIN HOOK =====

export const useCommercialPlanningLogic = () => {
  const { selectedSourceProfile, selectedTargetProfile } = useProfileStore();
  const { results, getResultsByModuleName } = useDiscoveryStore();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceLicenses, setSourceLicenses] = useState<LicenseInventoryItem[]>([]);
  const [targetLicenses, setTargetLicenses] = useState<LicenseInventoryItem[]>([]);
  const [overlaps, setOverlaps] = useState<LicenseOverlap[]>([]);
  const [migrationCosts, setMigrationCosts] = useState<MigrationCost[]>([]);

  // Helper: Get price info for SKU
  const getPriceInfo = useCallback((skuPartNumber: string): LicensePriceInfo => {
    const priceInfo = LICENSE_PRICING[skuPartNumber];
    if (priceInfo) return priceInfo;

    // Default pricing for unknown SKUs
    return {
      pricePerMonth: 10.00,
      displayName: skuPartNumber,
      category: 'Other',
    };
  }, []);

  // Process license data from discovery results
  const processLicenseData = useCallback((discoveryResults: any[]): LicenseInventoryItem[] => {
    if (!discoveryResults || discoveryResults.length === 0) return [];

    const licenses: LicenseInventoryItem[] = [];

    for (const result of discoveryResults) {
      if (!result.data) continue;

      // Handle both array and object data structures
      const dataArray = Array.isArray(result.data) ? result.data : [result.data];

      for (const item of dataArray) {
        const skuPartNumber = item.SkuPartNumber || item.skuPartNumber || '';
        const skuId = item.SkuId || item.skuId || '';
        const prepaidUnits = parseInt(item.PrepaidUnits || item.prepaidUnits || item.TotalUnits || '0', 10);
        const consumedUnits = parseInt(item.ConsumedUnits || item.consumedUnits || item.AssignedUnits || '0', 10);

        if (!skuPartNumber && !skuId) continue;

        const priceInfo = getPriceInfo(skuPartNumber);
        const availableUnits = Math.max(0, prepaidUnits - consumedUnits);
        const monthlyTotal = prepaidUnits * priceInfo.pricePerMonth;

        licenses.push({
          skuPartNumber,
          skuId,
          displayName: item.DisplayName || priceInfo.displayName || skuPartNumber,
          prepaidUnits,
          consumedUnits,
          availableUnits,
          pricePerMonth: priceInfo.pricePerMonth,
          monthlyTotal,
          annualTotal: monthlyTotal * 12,
          category: priceInfo.category,
        });
      }
    }

    // Consolidate duplicates
    const consolidated = new Map<string, LicenseInventoryItem>();
    for (const lic of licenses) {
      const key = lic.skuPartNumber || lic.skuId;
      if (consolidated.has(key)) {
        const existing = consolidated.get(key)!;
        existing.prepaidUnits += lic.prepaidUnits;
        existing.consumedUnits += lic.consumedUnits;
        existing.availableUnits = Math.max(0, existing.prepaidUnits - existing.consumedUnits);
        existing.monthlyTotal = existing.prepaidUnits * existing.pricePerMonth;
        existing.annualTotal = existing.monthlyTotal * 12;
      } else {
        consolidated.set(key, { ...lic });
      }
    }

    return Array.from(consolidated.values()).sort((a, b) => b.monthlyTotal - a.monthlyTotal);
  }, [getPriceInfo]);

  // Calculate license overlaps
  const calculateOverlaps = useCallback((
    source: LicenseInventoryItem[],
    target: LicenseInventoryItem[]
  ): LicenseOverlap[] => {
    const overlaps: LicenseOverlap[] = [];

    for (const sourceLic of source) {
      const targetLic = target.find(
        (t) => t.skuPartNumber === sourceLic.skuPartNumber || t.skuId === sourceLic.skuId
      );

      if (targetLic) {
        // Calculate overlap (users who could share licenses)
        const overlapCount = Math.min(sourceLic.consumedUnits, targetLic.availableUnits);
        const savingsOpportunity = overlapCount * sourceLic.pricePerMonth * 12;

        let recommendation = 'Review for consolidation';
        if (overlapCount > 0) {
          recommendation = `Consolidate ${overlapCount} licenses to save $${savingsOpportunity.toLocaleString()}/year`;
        } else if (targetLic.availableUnits > sourceLic.consumedUnits) {
          recommendation = 'Target has sufficient capacity - migrate users to existing licenses';
        }

        overlaps.push({
          sourceSkuPartNumber: sourceLic.skuPartNumber,
          targetSkuPartNumber: targetLic.skuPartNumber,
          displayName: sourceLic.displayName,
          sourceCount: sourceLic.consumedUnits,
          targetCount: targetLic.consumedUnits,
          overlapCount,
          savingsOpportunity,
          recommendation,
        });
      }
    }

    return overlaps.sort((a, b) => b.savingsOpportunity - a.savingsOpportunity);
  }, []);

  // Generate migration cost estimates
  const generateMigrationCosts = useCallback((
    source: LicenseInventoryItem[],
    userCount: number
  ): MigrationCost[] => {
    const costs: MigrationCost[] = [];

    // Identity Migration
    costs.push({
      category: 'Identity Migration',
      description: 'User and group migration, directory sync setup, authentication reconfiguration',
      oneTimeCost: userCount * 25, // $25 per user one-time
      recurringMonthlyCost: 0,
      estimatedDuration: '2-4 weeks',
      notes: 'Includes SSO configuration and MFA enrollment',
    });

    // Email Migration
    const hasExchange = source.some((l) => l.category === 'Exchange' || l.displayName.includes('Exchange'));
    if (hasExchange) {
      costs.push({
        category: 'Email Migration',
        description: 'Mailbox migration, calendar/contacts sync, email routing reconfiguration',
        oneTimeCost: userCount * 15,
        recurringMonthlyCost: 0,
        estimatedDuration: '3-6 weeks',
        notes: 'Hybrid coexistence recommended for large migrations',
      });
    }

    // SharePoint/OneDrive Migration
    const hasSharePoint = source.some((l) =>
      l.category === 'SharePoint' || l.displayName.includes('SharePoint') || l.displayName.includes('OneDrive')
    );
    if (hasSharePoint) {
      costs.push({
        category: 'File Storage Migration',
        description: 'SharePoint site migration, OneDrive content transfer, permission mapping',
        oneTimeCost: userCount * 20,
        recurringMonthlyCost: 0,
        estimatedDuration: '4-8 weeks',
        notes: 'Consider third-party migration tools for large datasets',
      });
    }

    // Application Integration
    costs.push({
      category: 'Application Integration',
      description: 'App reconfiguration, OAuth app migration, service principal updates',
      oneTimeCost: 15000, // Fixed estimate
      recurringMonthlyCost: 0,
      estimatedDuration: '2-4 weeks',
      notes: 'Varies based on number of integrated applications',
    });

    // Security Configuration
    costs.push({
      category: 'Security Configuration',
      description: 'Conditional Access policies, DLP rules, compliance settings migration',
      oneTimeCost: 10000,
      recurringMonthlyCost: 0,
      estimatedDuration: '1-2 weeks',
    });

    // Training & Change Management
    costs.push({
      category: 'Training & Change Management',
      description: 'User training, documentation, helpdesk support during transition',
      oneTimeCost: userCount * 10,
      recurringMonthlyCost: 500, // Ongoing helpdesk for 6 months
      estimatedDuration: '6 months',
    });

    // Professional Services
    costs.push({
      category: 'Professional Services',
      description: 'Project management, technical consulting, architecture review',
      oneTimeCost: Math.max(25000, userCount * 5),
      recurringMonthlyCost: 0,
      estimatedDuration: 'Throughout project',
    });

    return costs;
  }, []);

  // Load data on mount and when profiles change
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get licensing discovery results
        const licensingResults = getResultsByModuleName('LicensingDiscovery');
        const subscriptionData = licensingResults?.filter(
          (r) => (r as any).dataType === 'Subscriptions' || (r as any).dataType === 'LicensingSubscriptions' ||
                 r.displayName?.includes('Subscription') || r.moduleName?.includes('Subscription')
        );

        if (subscriptionData && subscriptionData.length > 0) {
          const processed = processLicenseData(subscriptionData);
          setSourceLicenses(processed);

          // For now, use source as proxy for target (would need separate discovery)
          // In real implementation, would load target profile's discovery data
          setTargetLicenses([]);

          // Calculate overlaps if we have both
          if (processed.length > 0) {
            const calculatedOverlaps = calculateOverlaps(processed, []);
            setOverlaps(calculatedOverlaps);
          }

          // Generate migration cost estimates
          const totalUsers = processed.reduce((sum, l) => sum + l.consumedUnits, 0);
          const costs = generateMigrationCosts(processed, totalUsers);
          setMigrationCosts(costs);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load commercial data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [results, getResultsByModuleName, processLicenseData, calculateOverlaps, generateMigrationCosts]);

  // Cost projections by category
  const costProjections = useMemo((): CostProjection[] => {
    const categoryTotals = new Map<string, { current: number; projected: number }>();

    for (const lic of sourceLicenses) {
      const current = categoryTotals.get(lic.category) || { current: 0, projected: 0 };
      current.current += lic.monthlyTotal;
      // Projected assumes 10% savings from consolidation
      current.projected += lic.monthlyTotal * 0.9;
      categoryTotals.set(lic.category, current);
    }

    return Array.from(categoryTotals.entries()).map(([category, totals]) => ({
      category,
      currentMonthly: totals.current,
      currentAnnual: totals.current * 12,
      projectedMonthly: totals.projected,
      projectedAnnual: totals.projected * 12,
      savings: (totals.current - totals.projected) * 12,
      percentChange: -10, // 10% savings
    }));
  }, [sourceLicenses]);

  // Commercial summary
  const commercialSummary = useMemo((): CommercialSummary => {
    const totalCurrentMonthly = sourceLicenses.reduce((sum, l) => sum + l.monthlyTotal, 0);
    const totalCurrentAnnual = totalCurrentMonthly * 12;

    const totalSavings = overlaps.reduce((sum, o) => sum + o.savingsOpportunity, 0);
    const totalProjectedMonthly = totalCurrentMonthly - (totalSavings / 12);
    const totalProjectedAnnual = totalProjectedMonthly * 12;

    const totalMigration = migrationCosts.reduce((sum, c) => sum + c.oneTimeCost, 0);
    const breakEven = totalSavings > 0 ? Math.ceil(totalMigration / (totalSavings / 12)) : 0;
    const roi = totalMigration > 0 ? ((totalSavings - totalMigration) / totalMigration) * 100 : 0;

    return {
      totalCurrentMonthlyCost: totalCurrentMonthly,
      totalCurrentAnnualCost: totalCurrentAnnual,
      totalProjectedMonthlyCost: totalProjectedMonthly,
      totalProjectedAnnualCost: totalProjectedAnnual,
      totalSavingsOpportunity: totalSavings,
      totalMigrationCost: totalMigration,
      breakEvenMonths: breakEven,
      roiPercent: roi,
    };
  }, [sourceLicenses, overlaps, migrationCosts]);

  // License distribution by category
  const licensesByCategory = useMemo(() => {
    const categories = new Map<string, { count: number; cost: number }>();

    for (const lic of sourceLicenses) {
      const existing = categories.get(lic.category) || { count: 0, cost: 0 };
      existing.count += lic.consumedUnits;
      existing.cost += lic.monthlyTotal;
      categories.set(lic.category, existing);
    }

    return Array.from(categories.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.cost - a.cost);
  }, [sourceLicenses]);

  // Export to CSV
  const exportToCSV = useCallback(async () => {
    try {
      const data = sourceLicenses.map((l) => ({
        'SKU Part Number': l.skuPartNumber,
        'Display Name': l.displayName,
        'Category': l.category,
        'Prepaid Units': l.prepaidUnits,
        'Consumed Units': l.consumedUnits,
        'Available Units': l.availableUnits,
        'Price Per Month': l.pricePerMonth.toFixed(2),
        'Monthly Total': l.monthlyTotal.toFixed(2),
        'Annual Total': l.annualTotal.toFixed(2),
      }));

      await window.electronAPI.invoke('export-to-csv', {
        data,
        filename: 'CommercialPlanning_LicenseInventory.csv',
        companyName: selectedSourceProfile?.companyName,
      });

      return true;
    } catch (err) {
      console.error('Failed to export:', err);
      return false;
    }
  }, [sourceLicenses, selectedSourceProfile]);

  return {
    // State
    isLoading,
    error,

    // Data
    sourceLicenses,
    targetLicenses,
    overlaps,
    migrationCosts,
    costProjections,
    commercialSummary,
    licensesByCategory,

    // Actions
    exportToCSV,

    // Context
    selectedSourceProfile,
    selectedTargetProfile,
  };
};

export default useCommercialPlanningLogic;
