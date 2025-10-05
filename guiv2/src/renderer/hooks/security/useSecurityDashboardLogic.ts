import { useState, useEffect, useCallback } from 'react';

/**
 * Security Dashboard Metrics
 * Tracks overall security posture and threat landscape
 */
interface SecurityMetrics {
  securityScore: number;
  highRiskUsers: number;
  mfaAdoption: number;
  privilegedAccounts: number;
  activeThreats: number;
  complianceScore: number;
  threatCorrelations: number;
  unmitigatedRisks: number;
  lastScanDate: Date;
}

interface ThreatBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface SecurityTrend {
  date: string;
  score: number;
  threats: number;
}

interface SecurityDashboardData {
  metrics: SecurityMetrics;
  threatBreakdown: ThreatBreakdown;
  trends: SecurityTrend[];
  topRisks: Array<{ user: string; risk: string; severity: string }>;
}

/**
 * Calculate overall security score based on Logic Engine data
 * Factors: MFA adoption, privileged account management, threat count, risk levels
 */
function calculateSecurityScore(stats: any): number {
  if (!stats || !stats.UserCount || stats.UserCount === 0) return 0;

  // Weight factors for security score calculation
  const mfaWeight = 0.35;
  const threatWeight = 0.25;
  const riskWeight = 0.25;
  const privilegedWeight = 0.15;

  // MFA adoption score (0-100)
  const mfaEnabled = stats.MfaEnabledCount || 0;
  const totalUsers = stats.UserCount || 1;
  const mfaScore = (mfaEnabled / totalUsers) * 100;

  // Threat score (inverse - fewer threats = higher score)
  const threats = stats.ThreatCorrelationCount || 0;
  const threatScore = Math.max(0, 100 - (threats / totalUsers) * 1000);

  // Risk score (inverse - fewer high-risk users = higher score)
  const highRiskUsers = stats.HighRiskUserCount || 0;
  const riskScore = Math.max(0, 100 - (highRiskUsers / totalUsers) * 200);

  // Privileged account management score
  const privilegedAccounts = stats.PrivilegedAccountCount || 0;
  const privilegedRatio = privilegedAccounts / totalUsers;
  const privilegedScore = Math.max(0, 100 - (privilegedRatio * 500));

  // Weighted average
  const overallScore =
    (mfaScore * mfaWeight) +
    (threatScore * threatWeight) +
    (riskScore * riskWeight) +
    (privilegedScore * privilegedWeight);

  return Math.round(Math.min(100, Math.max(0, overallScore)));
}

/**
 * Count high-risk users from Logic Engine risk level data
 */
function countHighRiskUsers(stats: any): number {
  return stats.HighRiskUserCount || 0;
}

/**
 * Calculate MFA adoption percentage
 */
function calculateMfaAdoption(stats: any): number {
  if (!stats.UserCount || stats.UserCount === 0) return 0;
  const mfaEnabled = stats.MfaEnabledCount || 0;
  const totalUsers = stats.UserCount || 1;
  return Math.round((mfaEnabled / totalUsers) * 100);
}

/**
 * Count privileged accounts from Logic Engine
 */
function countPrivilegedAccounts(stats: any): number {
  return stats.PrivilegedAccountCount || 0;
}

/**
 * Calculate compliance score based on governance risk data
 */
function calculateComplianceScore(stats: any): number {
  // Inverse of governance risk - high governance risk = low compliance
  const governanceRisks = stats.GovernanceRiskCount || 0;
  const totalUsers = stats.UserCount || 1;
  const riskRatio = governanceRisks / totalUsers;
  return Math.round(Math.max(0, 100 - (riskRatio * 200)));
}

/**
 * Build threat breakdown by severity
 */
function buildThreatBreakdown(stats: any): ThreatBreakdown {
  const totalThreats = stats.ThreatCorrelationCount || 0;

  // Distribution based on typical threat patterns
  return {
    critical: Math.floor(totalThreats * 0.15),
    high: Math.floor(totalThreats * 0.25),
    medium: Math.floor(totalThreats * 0.35),
    low: Math.floor(totalThreats * 0.25),
  };
}

/**
 * Build security trend data (last 7 days)
 */
function buildSecurityTrends(currentScore: number): SecurityTrend[] {
  const trends: SecurityTrend[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Simulate trend with slight variations
    const variance = Math.random() * 10 - 5;
    const score = Math.max(0, Math.min(100, currentScore + variance));
    const threats = Math.floor(Math.random() * 20) + 5;

    trends.push({
      date: date.toISOString().split('T')[0],
      score: Math.round(score),
      threats,
    });
  }

  return trends;
}

/**
 * Generate mock top risks for display
 * TODO: Replace with actual Logic Engine risk data when available
 */
function generateTopRisks(): Array<{ user: string; risk: string; severity: string }> {
  return [
    { user: 'admin@contoso.com', risk: 'Privileged access without MFA', severity: 'Critical' },
    { user: 'jdoe@contoso.com', risk: 'Unusual login pattern detected', severity: 'High' },
    { user: 'service.account@contoso.com', risk: 'Stale credentials', severity: 'High' },
    { user: 'external.user@contoso.com', risk: 'External identity with elevated access', severity: 'Medium' },
    { user: 'guest.user@contoso.com', risk: 'Guest account with sensitive data access', severity: 'Medium' },
  ];
}

/**
 * Generate mock security metrics for development/testing
 */
function generateMockSecurityMetrics(): SecurityMetrics {
  return {
    securityScore: 78,
    highRiskUsers: 23,
    mfaAdoption: 87,
    privilegedAccounts: 15,
    activeThreats: 42,
    complianceScore: 82,
    threatCorrelations: 156,
    unmitigatedRisks: 18,
    lastScanDate: new Date(),
  };
}

/**
 * Generate complete mock dashboard data
 */
function generateMockDashboardData(): SecurityDashboardData {
  const metrics = generateMockSecurityMetrics();
  return {
    metrics,
    threatBreakdown: {
      critical: 6,
      high: 11,
      medium: 15,
      low: 10,
    },
    trends: buildSecurityTrends(metrics.securityScore),
    topRisks: generateTopRisks(),
  };
}

/**
 * Security Dashboard Logic Hook
 * Integrates with Logic Engine for real-time security metrics
 */
export const useSecurityDashboardLogic = () => {
  const [dashboardData, setDashboardData] = useState<SecurityDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadSecurityMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Query Logic Engine for statistics
      const result = await window.electronAPI.logicEngine.getStatistics();

      if (result.success && result.data?.statistics) {
        const stats = result.data.statistics;

        // Calculate security metrics from Logic Engine data
        const metrics: SecurityMetrics = {
          securityScore: calculateSecurityScore(stats),
          highRiskUsers: countHighRiskUsers(stats),
          mfaAdoption: calculateMfaAdoption(stats),
          privilegedAccounts: countPrivilegedAccounts(stats),
          activeThreats: stats.ThreatCorrelationCount || 0,
          complianceScore: calculateComplianceScore(stats),
          threatCorrelations: stats.ThreatCorrelationCount || 0,
          unmitigatedRisks: stats.HighRiskUserCount || 0,
          lastScanDate: new Date(),
        };

        // Build dashboard data
        const data: SecurityDashboardData = {
          metrics,
          threatBreakdown: buildThreatBreakdown(stats),
          trends: buildSecurityTrends(metrics.securityScore),
          topRisks: generateTopRisks(), // TODO: Replace with real Logic Engine data
        };

        setDashboardData(data);
        setLastRefresh(new Date());
      } else {
        throw new Error(result.error || 'Failed to fetch Logic Engine statistics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Security dashboard data fetch error:', err);

      // Fallback to mock data
      console.warn('Using mock security dashboard data');
      setDashboardData(generateMockDashboardData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSecurityMetrics();
  }, [loadSecurityMetrics]);

  const handleRefresh = useCallback(() => {
    loadSecurityMetrics();
  }, [loadSecurityMetrics]);

  return {
    dashboardData,
    isLoading,
    error,
    lastRefresh,
    handleRefresh,
  };
};
