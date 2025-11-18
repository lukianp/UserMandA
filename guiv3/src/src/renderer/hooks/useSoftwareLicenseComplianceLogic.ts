import { useState, useCallback } from 'react';

export interface LicenseComplianceIssue {
  id: string;
  softwareName: string;
  licenseType: string;
  installedCount: number;
  licensedCount: number;
  complianceStatus: 'compliant' | 'over-licensed' | 'under-licensed' | 'unlicensed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastScanned: Date;
  recommendedAction: string;
}

export interface SoftwareLicenseComplianceLogicReturn {
  complianceIssues: LicenseComplianceIssue[];
  isScanning: boolean;
  lastScanDate: Date | null;
  error: string | null;
  scanCompliance: () => Promise<void>;
  fixComplianceIssue: (issueId: string) => Promise<void>;
  exportReport: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useSoftwareLicenseComplianceLogic(): SoftwareLicenseComplianceLogicReturn {
  const [complianceIssues, setComplianceIssues] = useState<LicenseComplianceIssue[]>([
    {
      id: 'issue-1',
      softwareName: 'Microsoft Office 365',
      licenseType: 'Enterprise',
      installedCount: 150,
      licensedCount: 145,
      complianceStatus: 'under-licensed',
      severity: 'high',
      lastScanned: new Date(),
      recommendedAction: 'Purchase 5 additional licenses',
    },
    {
      id: 'issue-2',
      softwareName: 'Adobe Creative Suite',
      licenseType: 'Professional',
      installedCount: 25,
      licensedCount: 30,
      complianceStatus: 'over-licensed',
      severity: 'low',
      lastScanned: new Date(),
      recommendedAction: 'Consider reallocating unused licenses',
    },
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanDate, setLastScanDate] = useState<Date | null>(new Date());
  const [error, setError] = useState<string | null>(null);

  const scanCompliance = useCallback(async () => {
    setIsScanning(true);
    setError(null);

    try {
      // Simulate compliance scan
      await new Promise(resolve => setTimeout(resolve, 2000));

      setLastScanDate(new Date());
      // Mock update some issues
      setComplianceIssues(prev =>
        prev.map(issue =>
          issue.id === 'issue-1'
            ? { ...issue, installedCount: 152, lastScanned: new Date() }
            : issue
        )
      );
    } catch (err) {
      setError('Failed to scan compliance');
    } finally {
      setIsScanning(false);
    }
  }, []);

  const fixComplianceIssue = useCallback(async (issueId: string) => {
    setError(null);

    try {
      // Simulate fixing the issue
      await new Promise(resolve => setTimeout(resolve, 1000));

      setComplianceIssues(prev =>
        prev.filter(issue => issue.id !== issueId)
      );
    } catch (err) {
      setError('Failed to fix compliance issue');
    }
  }, []);

  const exportReport = useCallback(async () => {
    setError(null);

    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Compliance report exported');
    } catch (err) {
      setError('Failed to export compliance report');
    }
  }, []);

  const refreshData = useCallback(async () => {
    setError(null);

    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      setError('Failed to refresh data');
    }
  }, []);

  return {
    complianceIssues,
    isScanning,
    lastScanDate,
    error,
    scanCompliance,
    fixComplianceIssue,
    exportReport,
    refreshData,
  };
}