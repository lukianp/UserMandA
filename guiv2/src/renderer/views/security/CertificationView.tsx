/**
 * Certification View Component
 * Displays compliance certifications, audit results, and certification tracking
 */

import React, { useState } from 'react';
import { Award, RefreshCw, AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';

import { useCertificationLogic } from '../../hooks/security/useCertificationLogic';

export const CertificationView: React.FC = () => {
  const { data, isLoading, error, filter, setFilter, filteredCertifications, handleRefresh } = useCertificationLogic();
  const [activeTab, setActiveTab] = useState<'overview' | 'certifications' | 'audits'>('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading certifications...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button onClick={handleRefresh} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Award className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Certification Management</h1>
              <p className="text-sm text-gray-600">Track compliance certifications and audits</p>
            </div>
          </div>
          <button onClick={handleRefresh} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Certifications</p>
              <p className="text-2xl font-bold text-green-700">{data.metrics.activeCertifications}/{data.metrics.totalCertifications}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-700">{data.metrics.expiringSoon}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
          <div className="mt-2 text-xs text-gray-500">Within 90 days</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Audit Score</p>
              <p className="text-2xl font-bold text-blue-700">{data.metrics.auditScore}%</p>
            </div>
            <Award className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Findings</p>
              <p className="text-2xl font-bold text-red-700">{data.metrics.findingsCount - data.metrics.remediatedFindings}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div className="mt-2 text-xs text-gray-500">{data.metrics.remediatedFindings} remediated</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('certifications')}
            className={`py-3 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'certifications' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
            }`}
          >
            Certifications ({filteredCertifications.length})
          </button>
          <button
            onClick={() => setActiveTab('audits')}
            className={`py-3 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'audits' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
            }`}
          >
            Audit Results
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Certification Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Certifications</span>
                  <span className="text-sm font-medium">{data.metrics.totalCertifications}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active</span>
                  <span className="text-sm font-medium text-green-700">{data.metrics.activeCertifications}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Renewals Pending</span>
                  <span className="text-sm font-medium text-orange-700">{data.metrics.renewalsPending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Expired</span>
                  <span className="text-sm font-medium text-red-700">{data.metrics.expired}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Findings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Findings</span>
                  <span className="text-sm font-medium">{data.metrics.findingsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Remediated</span>
                  <span className="text-sm font-medium text-green-700">{data.metrics.remediatedFindings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="text-sm font-medium text-blue-700">{data.metrics.findingsCount - data.metrics.remediatedFindings}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'certifications' && (
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search certifications..."
                value={filter.searchText || ''}
                onChange={(e) => setFilter({ ...filter, searchText: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="divide-y divide-gray-200">
              {filteredCertifications.map((cert) => (
                <div key={cert.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">{cert.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cert.status === 'active' ? 'bg-green-100 text-green-800' :
                      cert.status === 'expired' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {cert.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>Issuing Body: {cert.issuingBody}</p>
                    <p>Certificate #: {cert.certificateNumber}</p>
                    <p>Issued: {cert.issueDate.toLocaleDateString()} | Expires: {cert.expiryDate.toLocaleDateString()}</p>
                    {cert.nextAuditDate && <p>Next Audit: {cert.nextAuditDate.toLocaleDateString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'audits' && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <p className="text-gray-600">Audit results will be displayed here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationView;
