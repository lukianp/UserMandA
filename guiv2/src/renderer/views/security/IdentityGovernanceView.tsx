/**
 * Identity Governance View Component
 *
 * Displays identity governance metrics, access reviews, entitlement packages,
 * PIM roles, and lifecycle management. Integrates with Logic Engine for real data.
 */

import React, { useState } from 'react';
import { useIdentityGovernanceLogic } from '../../hooks/security/useIdentityGovernanceLogic';
import {
  Shield,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Key,
  Activity,
  TrendingUp,
} from 'lucide-react';

export const IdentityGovernanceView: React.FC = () => {
  const {
    data,
    isLoading,
    error,
    filter,
    setFilter,
    filteredAccessReviews,
    isExporting,
    handleRefresh,
    handleExport,
    handleStartReview,
    handleActivatePIMRole,
  } = useIdentityGovernanceLogic();

  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'entitlements' | 'pim' | 'lifecycle'>('overview');

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading identity governance...</span>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { metrics, accessReviews, entitlementPackages, pimRoles, lifecycleEvents, provisioningStatus } = data;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Identity Governance</h1>
              <p className="text-sm text-gray-600">Lifecycle management and access governance</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Governance Score</p>
              <p className="text-2xl font-bold text-blue-700">{metrics.governanceScore}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {metrics.governanceScore >= 80 ? 'Excellent' : metrics.governanceScore >= 60 ? 'Good' : 'Needs Improvement'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Reviews</p>
              <p className="text-2xl font-bold text-orange-700">{metrics.activeAccessReviews}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-orange-600" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {metrics.pendingDecisions} pending decisions
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Entitlements</p>
              <p className="text-2xl font-bold text-purple-700">{metrics.entitlementPackages}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {metrics.activeAssignments} active assignments
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">PIM Roles</p>
              <p className="text-2xl font-bold text-green-700">{metrics.eligiblePIMRoles}</p>
            </div>
            <Key className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {metrics.activePIMRoles} currently active
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Access Reviews ({filteredAccessReviews.length})
          </button>
          <button
            onClick={() => setActiveTab('entitlements')}
            className={`py-3 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'entitlements'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Entitlements ({entitlementPackages.length})
          </button>
          <button
            onClick={() => setActiveTab('pim')}
            className={`py-3 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'pim'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            PIM Roles ({pimRoles.length})
          </button>
          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`py-3 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'lifecycle'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Lifecycle
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Provisioning Status */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Provisioning Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Users</span>
                  <span className="text-sm font-medium text-gray-900">{provisioningStatus.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Provisioned</span>
                  <span className="text-sm font-medium text-green-700">{provisioningStatus.provisionedUsers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-medium text-orange-700">{provisioningStatus.pendingProvisioning.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Failed</span>
                  <span className="text-sm font-medium text-red-700">{provisioningStatus.failedProvisioning.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Deprovisioned</span>
                  <span className="text-sm font-medium text-gray-700">{provisioningStatus.deprovisionedUsers.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                Last sync: {provisioningStatus.lastSyncTime.toLocaleString()}
              </div>
            </div>

            {/* Recent Lifecycle Events */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Lifecycle Events</h3>
              <div className="space-y-3">
                {lifecycleEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                    <Activity className={`w-5 h-5 mt-0.5 ${
                      event.status === 'success' ? 'text-green-600' :
                      event.status === 'failed' ? 'text-red-600' : 'text-orange-600'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.userName}</p>
                      <p className="text-xs text-gray-600">{event.details}</p>
                      <p className="text-xs text-gray-500 mt-1">{event.timestamp.toLocaleString()}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      event.status === 'success' ? 'bg-green-100 text-green-800' :
                      event.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Access Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search reviews..."
                value={filter.searchText}
                onChange={(e) => setFilter({ ...filter, searchText: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="divide-y divide-gray-200">
              {filteredAccessReviews.map((review) => (
                <div key={review.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">{review.displayName}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      review.status === 'completed' ? 'bg-green-100 text-green-800' :
                      review.status === 'inProgress' ? 'bg-blue-100 text-blue-800' :
                      review.status === 'applied' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {review.status}
                    </span>
                  </div>
                  {review.description && <p className="text-sm text-gray-600 mb-2">{review.description}</p>}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Start: {review.startDateTime.toLocaleDateString()}</span>
                    <span>"</span>
                    <span>End: {review.endDateTime.toLocaleDateString()}</span>
                    <span>"</span>
                    <span>Reviewer: {review.reviewers[0]?.query || 'N/A'}</span>
                  </div>
                  {review.status === 'notStarted' && (
                    <button
                      onClick={() => handleStartReview(review.id)}
                      className="mt-3 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Start Review
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Entitlements Tab */}
        {activeTab === 'entitlements' && (
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="divide-y divide-gray-200">
              {entitlementPackages.map((pkg) => (
                <div key={pkg.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">{pkg.displayName}</h4>
                    {pkg.isHidden && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Hidden</span>
                    )}
                  </div>
                  {pkg.description && <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Catalog: {pkg.catalog.displayName}</span>
                    <span>"</span>
                    <span>Policies: {pkg.assignmentPolicies.length}</span>
                    <span>"</span>
                    <span>Created: {pkg.createdDateTime.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PIM Roles Tab */}
        {activeTab === 'pim' && (
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Principal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">State</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pimRoles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{role.roleName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{role.principalDisplayName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          role.assignmentState === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {role.assignmentState}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{role.memberType}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {role.endDateTime ? (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{Math.round((role.endDateTime.getTime() - Date.now()) / (60 * 60 * 1000))}h</span>
                          </div>
                        ) : (
                          'Permanent'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {role.assignmentState === 'eligible' && (
                          <button
                            onClick={() => handleActivatePIMRole(role.id)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          >
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lifecycle Tab */}
        {activeTab === 'lifecycle' && (
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Identity Lifecycle Events</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {lifecycleEvents.map((event) => (
                <div key={event.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <Activity className={`w-5 h-5 mt-0.5 ${
                      event.status === 'success' ? 'text-green-600' :
                      event.status === 'failed' ? 'text-red-600' : 'text-orange-600'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">{event.userName}</h4>
                        <span className="text-xs text-gray-500">{event.timestamp.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{event.details}</p>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          event.eventType === 'provisioning' ? 'bg-green-100 text-green-800' :
                          event.eventType === 'deprovisioning' ? 'bg-red-100 text-red-800' :
                          event.eventType === 'modification' ? 'bg-blue-100 text-blue-800' :
                          event.eventType === 'access_granted' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {event.eventType.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          event.status === 'success' ? 'bg-green-100 text-green-800' :
                          event.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdentityGovernanceView;
