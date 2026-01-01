/**
 * Reports View Logic Hook
 * Report generation and management
 */

import { useState, useCallback } from 'react';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  format: 'PDF' | 'Excel' | 'CSV' | 'HTML';
  parameters: Record<string, any>;
}

export const useReportsLogic = () => {
  const [templates] = useState<ReportTemplate[]>([
    {
      id: 'user-summary',
      name: 'User Summary Report',
      description: 'Summary of all discovered users with key metrics',
      category: 'Users',
      format: 'PDF',
      parameters: {},
    },
    {
      id: 'group-membership',
      name: 'Group Membership Report',
      description: 'Detailed group membership and permissions',
      category: 'Groups',
      format: 'Excel',
      parameters: {},
    },
    {
      id: 'migration-readiness',
      name: 'Migration Readiness Report',
      description: 'Assessment of migration readiness and blockers',
      category: 'Migration',
      format: 'PDF',
      parameters: {},
    },
    {
      id: 'license-usage',
      name: 'License Usage Report',
      description: 'Current license allocation and usage statistics',
      category: 'Licensing',
      format: 'Excel',
      parameters: {},
    },
  ]);

  const [generatingReports, setGeneratingReports] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchText ||
      (template.name ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
      (template.description ?? '').toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const generateReport = useCallback(async (templateId: string) => {
    setGeneratingReports(prev => new Set(prev).add(templateId));

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Reporting/ReportGeneration.psm1',
        functionName: 'New-Report',
        parameters: {
          TemplateId: templateId,
        },
      });

      if (result.success) {
        // Report generated successfully
        console.log('Report generated:', result.data.outputPath);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGeneratingReports(prev => {
        const next = new Set(prev);
        next.delete(templateId);
        return next;
      });
    }
  }, []);

  return {
    templates: filteredTemplates,
    generatingReports,
    searchText,
    setSearchText,
    filterCategory,
    setFilterCategory,
    generateReport,
  };
};


