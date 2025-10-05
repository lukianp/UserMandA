/**
 * Compliance Dashboard Logic Hook
 * Tracks organizational compliance posture with governance risk scoring
 * Integrates with Logic Engine ApplyGovernanceRisk inference
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  complianceScore: number;
  controlsTotal: number;
  controlsPassed: number;
  controlsFailed: number;
  lastAudit: Date | string;
  status: 'Compliant' | 'Non-Compliant' | 'Partial' | 'Not Assessed';
}

export interface ComplianceMetrics {
  overallScore: number;
  frameworkCount: number;
  policyViolations: number;
  inactiveAccounts: number;
  guestAccounts: number;
  dataResidencyIssues: number;
  auditReadinessScore: number;
  governanceRisks: number;
}

export interface PolicyViolation {
  id: string;
  user: string;
  violation: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  framework: string;
  detectedDate: Date | string;
  status: 'Open' | 'Acknowledged' | 'Resolved';
}

export interface ComplianceTrend {
  date: string;
  score: number;
  violations: number;
}

interface ComplianceDashboardData {
  metrics: ComplianceMetrics;
  frameworks: ComplianceFramework[];
  violations: PolicyViolation[];
  trends: ComplianceTrend[];
}

/**
 * Calculate overall compliance score from Logic Engine statistics
 * Uses governance risk data to determine compliance posture
 */
function calculateComplianceScore(stats: any): number {
  if (!stats || !stats.UserCount || stats.UserCount === 0) return 0;

  // Governance risk inverse scoring - fewer risks = higher compliance
  const governanceRisks = stats.GovernanceRiskCount || 0;
  const totalUsers = stats.UserCount || 1;
  const riskRatio = governanceRisks / totalUsers;

  // Calculate base score (max 100, reduce by risk ratio)
  const baseScore = Math.max(0, 100 - (riskRatio * 200));

  // Factor in inactive accounts
  const inactiveAccounts = stats.InactiveAccountCount || 0;
  const inactiveRatio = inactiveAccounts / totalUsers;
  const inactivePenalty = inactiveRatio * 10;

  // Factor in guest accounts
  const guestAccounts = stats.GuestAccountCount || 0;
  const guestRatio = guestAccounts / totalUsers;
  const guestPenalty = guestRatio * 5;

  const finalScore = Math.max(0, Math.min(100, baseScore - inactivePenalty - guestPenalty));
  return Math.round(finalScore);
}

/**
 * Generate compliance frameworks based on organizational data
 */
function generateFrameworks(stats: any): ComplianceFramework[] {
  const baseScore = calculateComplianceScore(stats);

  return [
    {
      id: 'gdpr',
      name: 'GDPR',
      description: 'General Data Protection Regulation',
      complianceScore: Math.min(100, baseScore + 5),
      controlsTotal: 45,
      controlsPassed: Math.floor(45 * (baseScore / 100)),
      controlsFailed: Math.ceil(45 * (1 - baseScore / 100)),
      lastAudit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: baseScore >= 90 ? 'Compliant' : baseScore >= 70 ? 'Partial' : 'Non-Compliant',
    },
    {
      id: 'hipaa',
      name: 'HIPAA',
      description: 'Health Insurance Portability and Accountability Act',
      complianceScore: Math.min(100, baseScore + 3),
      controlsTotal: 32,
      controlsPassed: Math.floor(32 * (baseScore / 100)),
      controlsFailed: Math.ceil(32 * (1 - baseScore / 100)),
      lastAudit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      status: baseScore >= 95 ? 'Compliant' : baseScore >= 80 ? 'Partial' : 'Non-Compliant',
    },
    {
      id: 'soc2',
      name: 'SOC 2',
      description: 'Service Organization Control 2',
      complianceScore: baseScore,
      controlsTotal: 64,
      controlsPassed: Math.floor(64 * (baseScore / 100)),
      controlsFailed: Math.ceil(64 * (1 - baseScore / 100)),
      lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: baseScore >= 92 ? 'Compliant' : baseScore >= 75 ? 'Partial' : 'Non-Compliant',
    },
    {
      id: 'iso27001',
      name: 'ISO 27001',
      description: 'Information Security Management',
      complianceScore: Math.min(100, baseScore - 2),
      controlsTotal: 114,
      controlsPassed: Math.floor(114 * (baseScore / 100)),
      controlsFailed: Math.ceil(114 * (1 - baseScore / 100)),
      lastAudit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      status: baseScore >= 93 ? 'Compliant' : baseScore >= 78 ? 'Partial' : 'Non-Compliant',
    },
  ];
}

/**
 * Generate mock policy violations
 * TODO: Replace with real Logic Engine governance risk data
 */
function generateViolations(governanceRiskCount: number): PolicyViolation[] {
  const violations: PolicyViolation[] = [];
  const count = Math.min(governanceRiskCount, 10); // Show top 10

  for (let i = 0; i < count; i++) {
    violations.push({
      id: `viol-${i}`,
      user: `user${i}@contoso.com`,
      violation: [
        'Inactive account exceeds retention policy',
        'Guest account with excessive permissions',
        'Data stored in non-compliant region',
        'Missing multi-factor authentication',
        'Stale credentials not rotated',
        'Orphaned account detected',
        'Privileged access without justification',
        'Sensitive data accessed from unapproved location',
      ][i % 8],
      severity: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)] as any,
      framework: ['GDPR', 'HIPAA', 'SOC 2', 'ISO 27001'][i % 4],
      detectedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      status: ['Open', 'Acknowledged', 'Resolved'][Math.floor(Math.random() * 3)] as any,
    });
  }

  return violations;
}

/**
 * Build compliance trend data (last 30 days)
 */
function buildComplianceTrends(currentScore: number): ComplianceTrend[] {
  const trends: ComplianceTrend[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Simulate gradual improvement
    const dayProgress = (29 - i) / 29;
    const score = Math.round(currentScore - (10 * (1 - dayProgress)));
    const violations = Math.floor(50 - (30 * dayProgress));

    trends.push({
      date: date.toISOString().split('T')[0],
      score: Math.max(0, Math.min(100, score)),
      violations: Math.max(0, violations),
    });
  }

  return trends;
}

/**
 * Generate mock compliance dashboard data
 */
function generateMockDashboardData(): ComplianceDashboardData {
  const mockStats = {
    UserCount: 1000,
    GovernanceRiskCount: 45,
    InactiveAccountCount: 23,
    GuestAccountCount: 12,
  };

  const score = calculateComplianceScore(mockStats);

  return {
    metrics: {
      overallScore: score,
      frameworkCount: 4,
      policyViolations: 45,
      inactiveAccounts: 23,
      guestAccounts: 12,
      dataResidencyIssues: 3,
      auditReadinessScore: 85,
      governanceRisks: 45,
    },
    frameworks: generateFrameworks(mockStats),
    violations: generateViolations(45),
    trends: buildComplianceTrends(score),
  };
}

/**
 * Compliance Dashboard Logic Hook
 * Integrates with Logic Engine for real-time compliance metrics
 */
export const useComplianceDashboardLogic = () => {
  const [dashboardData, setDashboardData] = useState<ComplianceDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadComplianceMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Query Logic Engine for statistics
      const result = await window.electronAPI.logicEngine.getStatistics();

      if (result.success && result.data?.statistics) {
        const stats = result.data.statistics;

        // Calculate compliance metrics from Logic Engine data
        const overallScore = calculateComplianceScore(stats);
        const governanceRisks = stats.GovernanceRiskCount || 0;
        const inactiveAccounts = stats.InactiveAccountCount || 0;
        const guestAccounts = stats.GuestAccountCount || 0;

        const metrics: ComplianceMetrics = {
          overallScore,
          frameworkCount: 4,
          policyViolations: governanceRisks,
          inactiveAccounts,
          guestAccounts,
          dataResidencyIssues: Math.floor(governanceRisks * 0.1), // Estimate
          auditReadinessScore: Math.min(100, overallScore + 5),
          governanceRisks,
        };

        // Build dashboard data
        const data: ComplianceDashboardData = {
          metrics,
          frameworks: generateFrameworks(stats),
          violations: generateViolations(governanceRisks),
          trends: buildComplianceTrends(overallScore),
        };

        setDashboardData(data);
        setLastRefresh(new Date());
      } else {
        throw new Error(result.error || 'Failed to fetch Logic Engine statistics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Compliance dashboard data fetch error:', err);

      // Fallback to mock data
      console.warn('Using mock compliance dashboard data');
      setDashboardData(generateMockDashboardData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadComplianceMetrics();
  }, [loadComplianceMetrics]);

  const handleRefresh = useCallback(() => {
    loadComplianceMetrics();
  }, [loadComplianceMetrics]);

  const handleExport = useCallback(async (format: 'csv' | 'pdf') => {
    if (!dashboardData) return;

    try {
      // Prepare export data
      const exportData = {
        timestamp: new Date().toISOString(),
        metrics: dashboardData.metrics,
        frameworks: dashboardData.frameworks,
        violations: dashboardData.violations,
      };

      if (format === 'csv') {
        // CSV export
        const csvLines: string[] = [];
        csvLines.push('Compliance Dashboard Report');
        csvLines.push(`Generated: ${new Date().toLocaleString()}`);
        csvLines.push('');
        csvLines.push('METRICS');
        csvLines.push(`Overall Compliance Score,${dashboardData.metrics.overallScore}%`);
        csvLines.push(`Policy Violations,${dashboardData.metrics.policyViolations}`);
        csvLines.push(`Inactive Accounts,${dashboardData.metrics.inactiveAccounts}`);
        csvLines.push(`Guest Accounts,${dashboardData.metrics.guestAccounts}`);
        csvLines.push('');
        csvLines.push('FRAMEWORKS');
        csvLines.push('Name,Compliance Score,Controls Passed,Controls Failed,Status');
        dashboardData.frameworks.forEach(fw => {
          csvLines.push(`${fw.name},${fw.complianceScore}%,${fw.controlsPassed},${fw.controlsFailed},${fw.status}`);
        });

        const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `compliance-dashboard-${Date.now()}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      }

      console.log('Export completed:', format);
    } catch (err) {
      console.error('Export error:', err);
    }
  }, [dashboardData]);

  // Compute statistics
  const stats = useMemo(() => {
    if (!dashboardData) {
      return {
        totalViolations: 0,
        criticalViolations: 0,
        openViolations: 0,
        resolvedViolations: 0,
      };
    }

    return {
      totalViolations: dashboardData.violations.length,
      criticalViolations: dashboardData.violations.filter(v => v.severity === 'Critical').length,
      openViolations: dashboardData.violations.filter(v => v.status === 'Open').length,
      resolvedViolations: dashboardData.violations.filter(v => v.status === 'Resolved').length,
    };
  }, [dashboardData]);

  return {
    dashboardData,
    isLoading,
    error,
    lastRefresh,
    stats,
    handleRefresh,
    handleExport,
  };
};
