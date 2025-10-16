/**
 * Error Dashboard
 *
 * Comprehensive UI for monitoring errors, viewing logs, and resolving issues
 */

import React, { useState, useMemo } from 'react';
import { useErrorMonitoring } from '../../hooks/useErrorMonitoring';
import type { LogLevel, LogEntry, ErrorReport } from '../../hooks/useErrorMonitoring';

export const ErrorDashboard: React.FC = () => {
  const {
    state,
    loadErrorReports,
    resolveError,
    setFilter,
    clearLogs,
    getFilteredLogs,
    getFilteredErrorReports
  } = useErrorMonitoring();

  const [activeTab, setActiveTab] = useState<'logs' | 'errors'>('errors');
  const [selectedError, setSelectedError] = useState<ErrorReport | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');

  const filteredLogs = useMemo(() => getFilteredLogs(), [getFilteredLogs]);
  const filteredErrors = useMemo(() => getFilteredErrorReports(), [getFilteredErrorReports]);

  const handleResolveError = async () => {
    if (!selectedError) return;

    try {
      await resolveError(selectedError.id, resolveNotes);
      setSelectedError(null);
      setResolveNotes('');
    } catch (error: any) {
      alert(`Failed to resolve error: ${error.message}`);
    }
  };

  const handleFilterChange = (filterUpdate: Partial<typeof state.filter>) => {
    setFilter({ ...state.filter, ...filterUpdate });
  };

  const getLevelColor = (level: LogLevel): string => {
    switch (level) {
      case 'fatal':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'warn':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'debug':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getLevelBadgeColor = (level: LogLevel): string => {
    switch (level) {
      case 'fatal':
        return 'bg-red-600 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warn':
        return 'bg-yellow-500 text-white';
      case 'info':
        return 'bg-blue-500 text-white';
      case 'debug':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Error Monitoring Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Monitor application errors and view system logs
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {state.unresolvedErrors > 0 && (
            <div className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
              {state.unresolvedErrors} Unresolved Error{state.unresolvedErrors !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('errors')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'errors'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Error Reports ({state.errorReports.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            System Logs ({state.logs.length})
          </button>
        </nav>
      </div>

      {/* Error Reports Tab */}
      {activeTab === 'errors' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-3">
            <select
              value={state.filter.resolved === undefined ? '' : state.filter.resolved.toString()}
              onChange={e =>
                handleFilterChange({
                  resolved: e.target.value === '' ? undefined : e.target.value === 'true'
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Errors</option>
              <option value="false">Unresolved Only</option>
              <option value="true">Resolved Only</option>
            </select>

            <button
              onClick={() => loadErrorReports({ resolved: false })}
              disabled={state.isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {/* Error List */}
          <div className="space-y-3">
            {filteredErrors.length === 0 ? (
              <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-lg font-medium text-gray-900">No errors found</p>
                <p className="text-sm text-gray-600">
                  {state.filter.resolved === false
                    ? 'All errors have been resolved!'
                    : 'Your application is running smoothly'}
                </p>
              </div>
            ) : (
              filteredErrors.map(error => (
                <div
                  key={error.id}
                  className={`border rounded-lg p-4 ${
                    error.resolved
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{error.error.name}</h3>
                        {error.resolved && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{error.error.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{new Date(error.timestamp).toLocaleString()}</span>
                        {Object.keys(error.context).length > 0 && (
                          <span>{Object.keys(error.context).length} context properties</span>
                        )}
                      </div>

                      {/* Context */}
                      {Object.keys(error.context).length > 0 && (
                        <div className="mt-3 p-2 bg-white border border-gray-200 rounded">
                          <p className="text-xs font-medium text-gray-700 mb-1">Context:</p>
                          <pre className="text-xs text-gray-600 overflow-x-auto">
                            {JSON.stringify(error.context, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Stack Trace */}
                      {error.error.stack && (
                        <details className="mt-3">
                          <summary className="text-xs font-medium text-gray-700 cursor-pointer">
                            Stack Trace
                          </summary>
                          <pre className="mt-2 p-2 bg-white border border-gray-200 rounded text-xs text-gray-600 overflow-x-auto max-h-48 overflow-y-auto">
                            {error.error.stack}
                          </pre>
                        </details>
                      )}

                      {/* Resolution Notes */}
                      {error.resolved && error.notes && (
                        <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded">
                          <p className="text-xs font-medium text-green-800 mb-1">
                            Resolution Notes:
                          </p>
                          <p className="text-xs text-green-700">{error.notes}</p>
                        </div>
                      )}
                    </div>

                    {!error.resolved && (
                      <button
                        onClick={() => setSelectedError(error)}
                        className="ml-4 px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* System Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Filters and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <select
                value={state.filter.level || ''}
                onChange={e =>
                  handleFilterChange({
                    level: e.target.value ? (e.target.value as LogLevel) : undefined
                  })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
                <option value="fatal">Fatal</option>
              </select>

              <input
                type="text"
                value={state.filter.category || ''}
                onChange={e => handleFilterChange({ category: e.target.value || undefined })}
                placeholder="Filter by category..."
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={clearLogs}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Logs
            </button>
          </div>

          {/* Log Entries */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No log entries</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Time
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Level
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Category
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLogs.map((log, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs text-gray-600 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${getLevelBadgeColor(log.level)}`}
                          >
                            {log.level.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-700">{log.category}</td>
                        <td className="px-4 py-2 text-xs text-gray-900">
                          {log.message}
                          {log.context && (
                            <details className="mt-1">
                              <summary className="cursor-pointer text-blue-600">
                                Show context
                              </summary>
                              <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                                {JSON.stringify(log.context, null, 2)}
                              </pre>
                            </details>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resolve Error Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resolve Error</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Error:</p>
                <p className="text-sm text-gray-900 mt-1">{selectedError.error.message}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resolution Notes
                </label>
                <textarea
                  value={resolveNotes}
                  onChange={e => setResolveNotes(e.target.value)}
                  placeholder="Describe how this error was resolved..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedError(null);
                    setResolveNotes('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolveError}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Mark as Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
