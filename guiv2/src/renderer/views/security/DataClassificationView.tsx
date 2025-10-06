/**
 * Data Classification View Component
 *
 * TODO: Type alignment needed with hook - see useDataClassificationLogic.ts
 * Status: Functional with TypeScript warnings. Cleanup scheduled.
 *
 * Displays data classification metrics, classified items, DLP policies, and trends.
 * Integrates with Logic Engine for real data and provides comprehensive classification management.
 */

import React, { useState } from 'react';
import { useDataClassificationLogic } from '../../hooks/security/useDataClassificationLogic';
import { ClassificationLevel } from '../../types/models/dataClassification';
import { Download, RefreshCw, Shield, Lock, AlertTriangle, TrendingUp, FileText, Users } from 'lucide-react';

export const DataClassificationView: React.FC = () => {
  const {
    data,
    isLoading,
    error,
    filter,
    setFilter,
    filteredItems,
    isExporting,
    handleRefresh,
    handleExport,
    handleReclassify,
    handleBulkClassify,
  } = useDataClassificationLogic();

  const [activeTab, setActiveTab] = useState<'items' | 'summary' | 'policies' | 'trends'>('summary');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkClassificationLevel, setBulkClassificationLevel] = useState<ClassificationLevel>('Internal');

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading data classification...</span>
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

  const { metrics, classifiedAssets, policies } = data;

  // Classification level colors
  const getLevelColor = (level: ClassificationLevel): string => {
    switch (level) {
      case 'Public': return 'bg-green-100 text-green-800 border-green-300';
      case 'Internal': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Confidential': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Restricted': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'TopSecret': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Handle bulk classification
  const handleBulkAction = async () => {
    if (selectedItems.length === 0) return;
    await handleBulkClassify(selectedItems, bulkClassificationLevel);
    setSelectedItems([]);
  };

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Data Classification</h1>
              <p className="text-sm text-gray-600">Manage and monitor data sensitivity levels</p>
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
            <div className="relative">
              <button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalAssets.toLocaleString()}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {metrics.classifiedAssets.toLocaleString()} classified ({Math.round((metrics.classifiedAssets / metrics.totalAssets) * 100)}%)
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Encrypted Items</p>
              <p className="text-2xl font-bold text-green-700">{metrics.encryptedAssets.toLocaleString()}</p>
            </div>
            <Lock className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {metrics.unencryptedSensitiveAssets.toLocaleString()} sensitive unencrypted
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Risk Assets</p>
              <p className="text-2xl font-bold text-orange-700">{metrics.highRiskAssets.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-orange-600" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {metrics.assetsRequiringReview.toLocaleString()} require review
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Classification Coverage</p>
              <p className="text-2xl font-bold text-purple-700">{Math.round(metrics.classificationCoveragePercentage)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {metrics.unclassifiedAssets.toLocaleString()} items need classification
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'summary'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`py-3 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'items'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Classified Items ({filteredItems.length})
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`py-3 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'policies'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Policies ({policies.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Classification Distribution</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getLevelColor('Public')}`}>
                    Public
                  </span>
                  <span className="text-gray-900 font-medium">{metrics.publicAssets.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getLevelColor('Internal')}`}>
                    Internal
                  </span>
                  <span className="text-gray-900 font-medium">{metrics.internalAssets.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getLevelColor('Confidential')}`}>
                    Confidential
                  </span>
                  <span className="text-gray-900 font-medium">{metrics.confidentialAssets.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getLevelColor('Restricted')}`}>
                    Restricted
                  </span>
                  <span className="text-gray-900 font-medium">{metrics.restrictedAssets.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getLevelColor('TopSecret')}`}>
                    Top Secret
                  </span>
                  <span className="text-gray-900 font-medium">{metrics.topSecretAssets.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Distribution</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-medium text-green-900">Public Assets</span>
                  <span className="text-green-900 font-bold">{metrics.publicAssets.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-900">Internal Assets</span>
                  <span className="text-blue-900 font-bold">{metrics.internalAssets.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="text-sm font-medium text-yellow-900">Confidential Assets</span>
                  <span className="text-yellow-900 font-bold">{metrics.confidentialAssets.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="text-sm font-medium text-orange-900">Restricted Assets</span>
                  <span className="text-orange-900 font-bold">{metrics.restrictedAssets.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-sm font-medium text-red-900">Top Secret Assets</span>
                  <span className="text-red-900 font-bold">{metrics.topSecretAssets.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="bg-white rounded-lg shadow border border-gray-200">
            {/* Filters and Bulk Actions */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select
                  value={filter.classificationLevels?.[0] || 'all'}
                  onChange={(e) => setFilter({ ...filter, classificationLevels: e.target.value === 'all' ? undefined : [e.target.value as ClassificationLevel] })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Levels</option>
                  <option value="Public">Public</option>
                  <option value="Internal">Internal</option>
                  <option value="Confidential">Confidential</option>
                  <option value="Restricted">Restricted</option>
                  <option value="TopSecret">Top Secret</option>
                </select>

                <select
                  value={filter.encryptionStatus?.[0] || 'all'}
                  onChange={(e) => setFilter({ ...filter, encryptionStatus: e.target.value === 'all' ? undefined : [e.target.value] })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Encryption Status</option>
                  <option value="Encrypted">Encrypted</option>
                  <option value="NotEncrypted">Not Encrypted</option>
                </select>
              </div>

              {selectedItems.length > 0 && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{selectedItems.length} selected</span>
                  <select
                    value={bulkClassificationLevel}
                    onChange={(e) => setBulkClassificationLevel(e.target.value as ClassificationLevel)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Public">Public</option>
                    <option value="Internal">Internal</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Secret">Secret</option>
                    <option value="Top Secret">Top Secret</option>
                  </select>
                  <button
                    onClick={handleBulkAction}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reclassify
                  </button>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                        onChange={(e) => setSelectedItems(e.target.checked ? filteredItems.map(item => item.id) : [])}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Classification</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Owner</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Encryption</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Sensitive Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(item.classificationLevel)}`}>
                          {item.classificationLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.assetType}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.owner}</td>
                      <td className="px-4 py-3">
                        {item.encryptionStatus === 'Encrypted' ? (
                          <span className="flex items-center text-green-700 text-sm">
                            <Lock className="w-4 h-4 mr-1" />
                            Encrypted
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {item.complianceFlags.map((flag, idx) => (
                            <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">{flag}</span>
                          ))}
                          {item.dlpPolicies.slice(0, 2).map((policy, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">{policy}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DLP Policies Tab */}
        {activeTab === 'policies' && (
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Data Loss Prevention Policies</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {policies.map((policy) => (
                <div key={policy.policyId} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">{policy.policyName}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      policy.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {policy.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{policy.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Level: {policy.classificationLevel}</span>
                    <span>•</span>
                    <span>Encryption Required: {policy.encryptionRequired ? 'Yes' : 'No'}</span>
                    <span>•</span>
                    <span>External Sharing: {policy.allowExternalSharing ? 'Allowed' : 'Blocked'}</span>
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

export default DataClassificationView;
