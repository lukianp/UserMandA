import React from 'react';
import { AlertTriangle, RefreshCw, Activity, Clock, CheckCircle } from 'lucide-react';

import { useIncidentResponseLogic } from '../../hooks/security/useIncidentResponseLogic';

export const IncidentResponseView: React.FC = () => {
  const { data, isLoading, error, handleRefresh } = useIncidentResponseLogic();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-3 text-lg text-gray-600">Loading incidents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <AlertTriangle className="w-6 h-6 text-red-600 mb-3" />
          <p className="text-red-700">{error}</p>
          <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Retry</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold">Incident Response</h1>
              <p className="text-sm text-gray-600">Security incident management and tracking</p>
            </div>
          </div>
          <button onClick={handleRefresh} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Incidents</p>
              <p className="text-2xl font-bold text-red-700">{data.metrics.activeIncidents}</p>
            </div>
            <Activity className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-700">{data.metrics.resolvedIncidents}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-blue-700">{data.metrics.avgResponseTime}m</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-orange-700">{data.metrics.criticalIncidents}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg shadow">
          {data.incidents.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No active incidents</div>
          ) : (
            <div className="divide-y">
              {data.incidents.map((incident) => (
                <div key={incident.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">{incident.title}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      incident.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      incident.severity === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {incident.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                  <div className="text-xs text-gray-500">
                    Detected: {(incident.detectedAt ?? 0).toLocaleString()} | Status: {incident.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentResponseView;
