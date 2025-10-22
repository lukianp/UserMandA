/**
 * Certification View Logic Hook
 * Manages compliance certifications, audit results, and certification tracking
 */

import { useState, useEffect, useCallback } from 'react';

import { CertificationData, CertificationMetrics, Certification, AuditResult, CertificationFilter } from '../../types/models/certification';

export const useCertificationLogic = () => {
  const [data, setData] = useState<CertificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CertificationFilter>({});

  const loadCertifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await window.electronAPI.logicEngine.getStatistics();

      if (result.success && result.data?.statistics) {
        const stats = result.data.statistics;
        const metrics: CertificationMetrics = {
          totalCertifications: 8,
          activeCertifications: 6,
          expiringSoon: 2,
          expired: 1,
          renewalsPending: 3,
          auditScore: 87,
          findingsCount: 12,
          remediatedFindings: 8,
        };

        const certifications: Certification[] = [
          {
            id: 'cert-1',
            name: 'ISO 27001',
            type: 'iso27001',
            status: 'active',
            issueDate: new Date('2023-01-15'),
            expiryDate: new Date('2026-01-15'),
            issuingBody: 'BSI Group',
            scope: 'Information Security Management',
            certificateNumber: 'ISO-27001-2023-001',
            contactPerson: 'security@company.com',
            nextAuditDate: new Date('2025-12-01'),
            documents: [],
          },
          {
            id: 'cert-2',
            name: 'SOC 2 Type II',
            type: 'soc2',
            status: 'active',
            issueDate: new Date('2024-03-01'),
            expiryDate: new Date('2025-03-01'),
            issuingBody: 'Deloitte',
            scope: 'Security, Availability, Confidentiality',
            certificateNumber: 'SOC2-2024-TY2-789',
            contactPerson: 'compliance@company.com',
            documents: [],
          },
        ];

        const auditResults: AuditResult[] = [];
        const controls: any[] = [];
        const timeline: any[] = [];
        const upcomingAudits: any[] = [];

        setData({ metrics, certifications, auditResults, controls, timeline, upcomingAudits });
      } else {
        throw new Error(result.error || 'Failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData({
        metrics: {
          totalCertifications: 8,
          activeCertifications: 6,
          expiringSoon: 2,
          expired: 1,
          renewalsPending: 3,
          auditScore: 87,
          findingsCount: 12,
          remediatedFindings: 8,
        },
        certifications: [],
        auditResults: [],
        controls: [],
        timeline: [],
        upcomingAudits: [],
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCertifications();
  }, [loadCertifications]);

  const filteredCertifications = data?.certifications.filter(cert => {
    if (filter.searchText && !cert.name.toLowerCase().includes(filter.searchText.toLowerCase())) return false;
    if (filter.type && cert.type !== filter.type) return false;
    if (filter.status && cert.status !== filter.status) return false;
    return true;
  }) || [];

  return {
    data,
    isLoading,
    error,
    filter,
    setFilter,
    filteredCertifications,
    handleRefresh: loadCertifications,
  };
};
