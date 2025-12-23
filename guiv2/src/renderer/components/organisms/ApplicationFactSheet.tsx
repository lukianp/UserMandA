/**
 * ApplicationFactSheet Component
 *
 * LeanIX-style application fact sheet with 7 collapsible sections:
 * - Base Information
 * - Lifecycle
 * - Business Context
 * - Technical Details
 * - Security Assessment
 * - Relations
 * - Migration Planning
 *
 * Features:
 * - Provenance tracking (show source of each field)
 * - Edit mode for manual enrichment
 * - Observation history
 */

import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import {
  X,
  Info,
  Clock,
  Briefcase,
  Cpu,
  Shield,
  GitBranch,
  Truck,
  ChevronDown,
  ChevronRight,
  Edit2,
  Save,
  History,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Calendar,
  Users,
  DollarSign,
  Server,
  Database,
  Cloud,
  Lock,
  Key,
  Eye,
} from 'lucide-react';

import {
  ApplicationFact,
  FieldProvenance,
  FactRelation,
  LifecycleState,
  BusinessCriticality,
  TechnicalFitness,
  FunctionalFitness,
  HostingType,
  DataClassification,
  MigrationApproach,
} from '../../../shared/types/applicationFacts';

// ============================================================
// Props Interface
// ============================================================

export interface ApplicationFactSheetProps {
  fact: ApplicationFact;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updates: Partial<ApplicationFact>) => Promise<void>;
  onNavigateToRelation?: (relationId: string) => void;
}

// ============================================================
// Color/Badge Configurations
// ============================================================

const LIFECYCLE_COLORS: Record<LifecycleState, { bg: string; text: string; icon: React.ReactNode }> = {
  plan: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: <Clock size={14} /> },
  'phase-in': { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400', icon: <ChevronRight size={14} /> },
  active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: <CheckCircle size={14} /> },
  'phase-out': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', icon: <AlertTriangle size={14} /> },
  'end-of-life': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: <AlertTriangle size={14} /> },
  retired: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-400', icon: <X size={14} /> },
  unknown: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-500 dark:text-gray-400', icon: <HelpCircle size={14} /> },
};

const CRITICALITY_COLORS: Record<BusinessCriticality, { bg: string; text: string }> = {
  'mission-critical': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  'business-critical': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  'business-operational': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  administrative: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  unknown: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-500 dark:text-gray-400' },
};

const CLASSIFICATION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  MicrosoftDefault: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  CustomerManaged: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  ThirdParty: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  Unknown: { bg: 'bg-gray-50 dark:bg-gray-900/20', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700' },
};

// ============================================================
// Section Components
// ============================================================

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, isOpen, onToggle, children, badge }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-600 dark:text-gray-400">{icon}</span>
        <span className="font-medium text-gray-900 dark:text-white">{title}</span>
        {badge}
      </div>
      {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
    </button>
    {isOpen && <div className="p-4 bg-white dark:bg-gray-800">{children}</div>}
  </div>
);

interface FieldRowProps {
  label: string;
  value: React.ReactNode;
  provenance?: FieldProvenance;
  showProvenance?: boolean;
}

const FieldRow: React.FC<FieldRowProps> = ({ label, value, provenance, showProvenance = false }) => (
  <div className="flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      {showProvenance && provenance && (
        <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded" title={`Source: ${provenance.source}`}>
          {provenance.source}
        </span>
      )}
    </div>
    <div className="text-sm font-medium text-gray-900 dark:text-white text-right max-w-[60%]">{value || '-'}</div>
  </div>
);

// ============================================================
// Main Component
// ============================================================

export const ApplicationFactSheet: React.FC<ApplicationFactSheetProps> = ({
  fact,
  isOpen,
  onClose,
  onSave,
  onNavigateToRelation,
}) => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['base', 'lifecycle', 'business']));
  const [isEditing, setIsEditing] = useState(false);
  const [showProvenance, setShowProvenance] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const getProvenance = (field: string): FieldProvenance | undefined => {
    return fact.provenance.find((p) => p.field === field);
  };

  const classificationColors = CLASSIFICATION_COLORS[fact.classification] || CLASSIFICATION_COLORS.Unknown;
  const lifecycleColors = LIFECYCLE_COLORS[fact.lifecycle.state] || LIFECYCLE_COLORS.unknown;
  const criticalityColors = CRITICALITY_COLORS[fact.business.criticality] || CRITICALITY_COLORS.unknown;

  // Group relations by type
  const relationGroups = useMemo(() => {
    const groups: Record<string, FactRelation[]> = {};
    for (const rel of fact.relations) {
      if (!groups[rel.relationType]) {
        groups[rel.relationType] = [];
      }
      groups[rel.relationType].push(rel);
    }
    return groups;
  }, [fact.relations]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className={clsx('p-3 rounded-xl', classificationColors.bg, classificationColors.border, 'border')}>
              <Briefcase size={24} className={classificationColors.text} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{fact.displayName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', classificationColors.bg, classificationColors.text)}>
                  {fact.classification}
                </span>
                <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1', lifecycleColors.bg, lifecycleColors.text)}>
                  {lifecycleColors.icon}
                  {fact.lifecycle.state}
                </span>
                {fact.classificationConfidence > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(fact.classificationConfidence * 100)}% confidence
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProvenance(!showProvenance)}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                showProvenance ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
              title="Toggle provenance display"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                showHistory ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
              title="View history"
            >
              <History size={18} />
            </button>
            {onSave && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  isEditing ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
                title={isEditing ? 'Save changes' : 'Edit'}
              >
                {isEditing ? <Save size={18} /> : <Edit2 size={18} />}
              </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Observation History Panel */}
          {showHistory && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Observation History</h3>
              {fact.observations.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No observations recorded yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {fact.observations.slice().reverse().map((obs) => (
                    <div key={obs.id} className="flex items-start gap-3 text-sm">
                      <span className="text-gray-400">{new Date(obs.timestamp).toLocaleString()}</span>
                      <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                        {obs.source}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Updated: {obs.fieldsUpdated.join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Base Information */}
          <Section
            title="Base Information"
            icon={<Info size={18} />}
            isOpen={openSections.has('base')}
            onToggle={() => toggleSection('base')}
          >
            <div className="grid grid-cols-2 gap-x-6">
              <FieldRow label="Display Name" value={fact.displayName} provenance={getProvenance('displayName')} showProvenance={showProvenance} />
              <FieldRow label="App ID" value={fact.appId} provenance={getProvenance('appId')} showProvenance={showProvenance} />
              <FieldRow label="Object ID" value={fact.objectId} provenance={getProvenance('objectId')} showProvenance={showProvenance} />
              <FieldRow label="Publisher" value={fact.publisherName || fact.publisherDomain} provenance={getProvenance('publisherName')} showProvenance={showProvenance} />
              <FieldRow label="Sign-in Audience" value={fact.signInAudience} provenance={getProvenance('signInAudience')} showProvenance={showProvenance} />
              <FieldRow label="Service Principal Type" value={fact.servicePrincipalType} provenance={getProvenance('servicePrincipalType')} showProvenance={showProvenance} />
            </div>
            {fact.description && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">{fact.description}</p>
              </div>
            )}
            {fact.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {fact.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Section>

          {/* Lifecycle */}
          <Section
            title="Lifecycle"
            icon={<Clock size={18} />}
            isOpen={openSections.has('lifecycle')}
            onToggle={() => toggleSection('lifecycle')}
            badge={
              <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1', lifecycleColors.bg, lifecycleColors.text)}>
                {lifecycleColors.icon}
                {fact.lifecycle.state}
              </span>
            }
          >
            <div className="grid grid-cols-2 gap-x-6">
              <FieldRow label="Current State" value={fact.lifecycle.state} />
              <FieldRow label="Introduction Date" value={fact.lifecycle.introductionDate ? new Date(fact.lifecycle.introductionDate).toLocaleDateString() : undefined} />
              <FieldRow label="Active Since" value={fact.lifecycle.activeDate ? new Date(fact.lifecycle.activeDate).toLocaleDateString() : undefined} />
              <FieldRow label="Phase Out Date" value={fact.lifecycle.phaseOutDate ? new Date(fact.lifecycle.phaseOutDate).toLocaleDateString() : undefined} />
              <FieldRow label="End of Life" value={fact.lifecycle.endOfLifeDate ? new Date(fact.lifecycle.endOfLifeDate).toLocaleDateString() : undefined} />
              <FieldRow label="Vendor Support Ends" value={fact.lifecycle.vendorSupportEndDate ? new Date(fact.lifecycle.vendorSupportEndDate).toLocaleDateString() : undefined} />
            </div>
            {fact.lifecycle.notes && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">{fact.lifecycle.notes}</p>
              </div>
            )}
          </Section>

          {/* Business Context */}
          <Section
            title="Business Context"
            icon={<Briefcase size={18} />}
            isOpen={openSections.has('business')}
            onToggle={() => toggleSection('business')}
            badge={
              <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', criticalityColors.bg, criticalityColors.text)}>
                {fact.business.criticality.replace('-', ' ')}
              </span>
            }
          >
            <div className="grid grid-cols-2 gap-x-6">
              <FieldRow label="Business Criticality" value={fact.business.criticality.replace('-', ' ')} />
              <FieldRow label="Functional Fitness" value={fact.business.functionalFitness} />
              <FieldRow label="Business Owner" value={fact.business.businessOwner} />
              <FieldRow label="IT Owner" value={fact.business.itOwner} />
              <FieldRow label="Cost Center" value={fact.business.costCenter} />
              <FieldRow label="Annual Cost" value={fact.business.annualCost ? `$${fact.business.annualCost.toLocaleString()}` : undefined} />
              <FieldRow label="User Count" value={fact.business.userCount?.toLocaleString()} />
              <FieldRow label="Business Value" value={fact.business.businessValue ? `${fact.business.businessValue}/10` : undefined} />
            </div>
            {fact.business.capabilities.length > 0 && (
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Business Capabilities:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {fact.business.capabilities.map((cap, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* Technical Details */}
          <Section
            title="Technical Details"
            icon={<Cpu size={18} />}
            isOpen={openSections.has('technical')}
            onToggle={() => toggleSection('technical')}
          >
            <div className="grid grid-cols-2 gap-x-6">
              <FieldRow label="Hosting Type" value={fact.technical.hostingType} />
              <FieldRow label="Technical Fitness" value={fact.technical.technicalFitness} />
            </div>
            {fact.technical.technology.length > 0 && (
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Technology Stack:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {fact.technical.technology.map((tech, idx) => (
                    <span key={idx} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {fact.technical.databases.length > 0 && (
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Databases:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {fact.technical.databases.map((db, idx) => (
                    <span key={idx} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded flex items-center gap-1">
                      <Database size={12} />
                      {db}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {fact.technical.azureResources.length > 0 && (
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Azure Resources:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {fact.technical.azureResources.map((res, idx) => (
                    <span key={idx} className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs rounded flex items-center gap-1">
                      <Cloud size={12} />
                      {res}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* Security Assessment */}
          <Section
            title="Security Assessment"
            icon={<Shield size={18} />}
            isOpen={openSections.has('security')}
            onToggle={() => toggleSection('security')}
          >
            <div className="grid grid-cols-2 gap-x-6">
              <FieldRow label="Data Classification" value={fact.security.dataClassification} />
              <FieldRow label="Handles PII" value={fact.security.handlesPII ? 'Yes' : 'No'} />
              <FieldRow label="SSO Enabled" value={fact.security.ssoEnabled ? 'Yes' : 'No'} />
              <FieldRow label="MFA Required" value={fact.security.mfaRequired ? 'Yes' : 'No'} />
              <FieldRow label="Authentication" value={fact.security.authenticationMethod} />
              <FieldRow label="Last Security Review" value={fact.security.lastSecurityReview ? new Date(fact.security.lastSecurityReview).toLocaleDateString() : undefined} />
            </div>
            {fact.security.complianceFrameworks.length > 0 && (
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Compliance Frameworks:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {fact.security.complianceFrameworks.map((fw, idx) => (
                    <span key={idx} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded flex items-center gap-1">
                      <Lock size={12} />
                      {fw}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {fact.security.expiringSecrets && fact.security.expiringSecrets.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium mb-2">
                  <Key size={16} />
                  Expiring Secrets
                </div>
                <div className="space-y-1">
                  {fact.security.expiringSecrets.map((secret, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-red-600 dark:text-red-400">{secret.name}</span>
                      <span className="text-red-500 dark:text-red-500">
                        {secret.daysUntilExpiry} days ({new Date(secret.expiresAt).toLocaleDateString()})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* Relations */}
          <Section
            title="Relations"
            icon={<GitBranch size={18} />}
            isOpen={openSections.has('relations')}
            onToggle={() => toggleSection('relations')}
            badge={
              fact.relations.length > 0 ? (
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                  {fact.relations.length}
                </span>
              ) : undefined
            }
          >
            {fact.relations.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No relations defined.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(relationGroups).map(([type, relations]) => (
                  <div key={type}>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {type.replace(/-/g, ' ')} ({relations.length})
                    </h4>
                    <div className="space-y-2">
                      {relations.map((rel) => (
                        <div
                          key={rel.id}
                          onClick={() => onNavigateToRelation?.(rel.targetId)}
                          className={clsx(
                            'flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg',
                            onNavigateToRelation && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {rel.direction === 'inbound' && <ChevronRight size={14} className="text-green-500" />}
                            {rel.direction === 'outbound' && <ChevronRight size={14} className="text-blue-500 rotate-180" />}
                            {rel.direction === 'bidirectional' && <GitBranch size={14} className="text-purple-500" />}
                            <span className="text-sm text-gray-900 dark:text-white">{rel.targetName}</span>
                            {rel.isCritical && (
                              <span className="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                                Critical
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{rel.targetType}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Migration Planning */}
          <Section
            title="Migration Planning"
            icon={<Truck size={18} />}
            isOpen={openSections.has('migration')}
            onToggle={() => toggleSection('migration')}
            badge={
              fact.migration ? (
                <span className={clsx(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  fact.migration.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  fact.migration.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  fact.migration.status === 'blocked' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                )}>
                  {fact.migration.status.replace('-', ' ')}
                </span>
              ) : undefined
            }
          >
            {!fact.migration ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No migration plan defined.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-6">
                  <FieldRow label="Approach" value={fact.migration.approach} />
                  <FieldRow label="Status" value={fact.migration.status.replace('-', ' ')} />
                  <FieldRow label="Target Date" value={fact.migration.targetDate ? new Date(fact.migration.targetDate).toLocaleDateString() : undefined} />
                  <FieldRow label="Wave" value={fact.migration.wave} />
                  <FieldRow label="Priority" value={fact.migration.priority} />
                  <FieldRow label="Effort Estimate" value={fact.migration.effortHours ? `${fact.migration.effortHours} hours` : undefined} />
                  <FieldRow label="Cost Estimate" value={fact.migration.costEstimate ? `$${fact.migration.costEstimate.toLocaleString()}` : undefined} />
                </div>
                {fact.migration.risks.length > 0 && (
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Risks:</span>
                    <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {fact.migration.risks.map((risk, idx) => (
                        <li key={idx}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {fact.migration.dependencies.length > 0 && (
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dependencies:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {fact.migration.dependencies.map((dep, idx) => (
                        <span key={idx} className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded">
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </Section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span>Created: {new Date(fact.createdAt).toLocaleString()}</span>
            <span className="mx-2">|</span>
            <span>Updated: {new Date(fact.updatedAt).toLocaleString()}</span>
            {fact.lastSyncAt && (
              <>
                <span className="mx-2">|</span>
                <span>Last Sync: {new Date(fact.lastSyncAt).toLocaleString()}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
              Close
            </button>
            {isEditing && onSave && (
              <button
                onClick={() => {
                  // Save logic would go here
                  setIsEditing(false);
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationFactSheet;
