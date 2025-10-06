/**
 * Security Audit View
 * Displays security audit logs with filtering and real-time updates
 */

import React from 'react';
import { useSecurityAuditLogic } from '../../hooks/useSecurityAuditLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';
import { Shield, RefreshCw, Download, Filter, X, Radio, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SecurityAuditView: React.FC = () => {
  const {
    data,
    columns,
    isLoading,
    isLiveMode,
    error,
    filters,
    filterOptions,
    updateFilter,
    clearFilters,
    selectedEvents,
    setSelectedEvents,
    loadData,
    toggleLiveMode,
    exportData,
    stats,
    timelineData,
    selectedProfile,
  } = useSecurityAuditLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="security-audit-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Audit Log</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor security events and audit trail
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isLiveMode && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Radio className="w-4 h-4 text-green-600 dark:text-green-400 animate-pulse" />
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">Live</span>
              </div>
            )}
            {selectedProfile && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Profile: <span className="font-semibold">{selectedProfile.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Events</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="text-sm text-red-600 dark:text-red-400 font-medium">Critical</div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.critical}</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">High Severity</div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.high}</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Failures</div>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.failures}</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Auth Events</div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.authEvents}</div>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
            <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Security Events</div>
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{stats.securityEvents}</div>
          </div>
        </div>
      </div>

      {/* Event Timeline */}
      {timelineData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Event Timeline (Hourly)</h3>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
              <XAxis dataKey="hour" className="text-xs" tick={{ fill: 'currentColor' }} />
              <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
          {(filters.eventCategory || filters.severity || filters.user || filters.resource || filters.result || filters.dateFrom || filters.dateTo || filters.searchText) && (
            <Button
              variant="ghost"
              size="sm"
              icon={<X className="w-4 h-4" />}
              onClick={clearFilters}
              data-cy="clear-filters-btn"
            >
              Clear All
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <Input
            placeholder="Search events..."
            value={filters.searchText}
            onChange={(value) => updateFilter('searchText', value)}
            className="md:col-span-2"
            data-cy="search-input"
          />
          <Select
            value={filters.eventCategory}
            onChange={(value) => updateFilter('eventCategory', value)}
            data-cy="category-select"
          >
            <option value="">All Categories</option>
            {filterOptions.categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
          <Select
            value={filters.severity}
            onChange={(value) => updateFilter('severity', value)}
            data-cy="severity-select"
          >
            <option value="">All Severities</option>
            {filterOptions.severities.map((sev) => (
              <option key={sev} value={sev}>{sev}</option>
            ))}
          </Select>
          <Select
            value={filters.result}
            onChange={(value) => updateFilter('result', value)}
            data-cy="result-select"
          >
            <option value="">All Results</option>
            {filterOptions.results.map((res) => (
              <option key={res} value={res}>{res}</option>
            ))}
          </Select>
          <Input
            type="date"
            placeholder="From Date"
            value={filters.dateFrom}
            onChange={(value) => updateFilter('dateFrom', value)}
            data-cy="date-from-input"
          />
          <Input
            type="date"
            placeholder="To Date"
            value={filters.dateTo}
            onChange={(value) => updateFilter('dateTo', value)}
            data-cy="date-to-input"
          />
          <Input
            placeholder="User..."
            value={filters.user}
            onChange={(value) => updateFilter('user', value)}
            data-cy="user-input"
          />
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={loadData}
              loading={isLoading}
              data-cy="refresh-btn"
            >
              Refresh
            </Button>
            <Button
              variant={isLiveMode ? 'secondary' : 'ghost'}
              icon={<Radio className="w-4 h-4" />}
              onClick={toggleLiveMode}
              data-cy="live-mode-btn"
            >
              {isLiveMode ? 'Stop Live' : 'Start Live'}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
              onClick={() => exportData('csv')}
              disabled={data.length === 0}
              data-cy="export-csv-btn"
            >
              Export CSV
            </Button>
            <Button
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
              onClick={() => exportData('json')}
              disabled={data.length === 0}
              data-cy="export-json-btn"
            >
              Export JSON
            </Button>
            <Button
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
              onClick={() => exportData('siem')}
              disabled={data.length === 0}
              data-cy="export-siem-btn"
            >
              Export SIEM/CEF
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Data Grid */}
      <div className="flex-1 overflow-hidden p-6">
        <VirtualizedDataGrid
          data={data}
          columns={columns}
          loading={isLoading}
          enableSelection={true}
          selectionMode="multiple"
          onSelectionChange={setSelectedEvents}
          height="calc(100vh - 700px)"
         
        />
      </div>
    </div>
  );
};

export default SecurityAuditView;
