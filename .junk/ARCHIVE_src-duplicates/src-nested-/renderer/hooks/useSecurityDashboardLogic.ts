import { useState, useCallback } from 'react';

export const useSecurityDashboardLogic = () => {
  const [securityData, setSecurityData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const stats = {
    totalThreats: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    criticalVulnerabilities: 0,
    criticalChange: 0,
    activeThreats: 0,
    threatsChange: 0,
    securityScore: 0,
    scoreChange: 0,
    exposedServices: 0,
    exposedChange: 0,
  };

  const handleExport = useCallback(() => {
    console.log('Export security data');
  }, []);

  const handleRefresh = useCallback(() => {
    console.log('Refresh security data');
  }, []);

  const handleRunScan = useCallback(() => {
    console.log('Run security scan');
  }, []);

  const columnDefs = [
    { field: 'id', headerName: 'ID' },
    { field: 'name', headerName: 'Name' },
  ];

  return {
    securityData,
    isLoading,
    stats,
    selectedCategory,
    setSelectedCategory,
    handleExport,
    handleRefresh,
    handleRunScan,
    columnDefs,
  };
};
