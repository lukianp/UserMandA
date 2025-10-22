import { useState, useEffect, useCallback } from 'react';

import { IncidentResponseData, SecurityIncident } from '../../types/models/incidentResponse';

export const useIncidentResponseLogic = () => {
  const [data, setData] = useState<IncidentResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIncidents = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await window.electronAPI.logicEngine.getStatistics();

      if (result.success) {
        const incidents: SecurityIncident[] = [
          {
            id: 'inc-1',
            title: 'Suspected Phishing Campaign',
            severity: 'high',
            status: 'investigating',
            category: 'phishing',
            detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            reportedBy: 'security@company.com',
            affectedSystems: ['Email Gateway'],
            affectedUsers: ['user1@company.com', 'user2@company.com'],
            description: 'Multiple users reported suspicious emails',
            timeline: [],
            responseActions: [],
          },
        ];

        setData({
          metrics: {
            totalIncidents: 45,
            activeIncidents: 3,
            resolvedIncidents: 42,
            avgResponseTime: 15,
            avgResolutionTime: 4,
            criticalIncidents: 2,
          },
          incidents,
        });
      } else {
        throw new Error(result.error || 'Failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData({
        metrics: {
          totalIncidents: 45,
          activeIncidents: 3,
          resolvedIncidents: 42,
          avgResponseTime: 15,
          avgResolutionTime: 4,
          criticalIncidents: 2,
        },
        incidents: [],
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  return {
    data,
    isLoading,
    error,
    handleRefresh: loadIncidents,
  };
};
