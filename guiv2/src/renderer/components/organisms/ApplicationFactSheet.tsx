/**
 * ApplicationFactSheet Component
 *
 * LeanIX-style fact sheet with 7 collapsible sections for application inventory.
 * Now fully editable with section-level edit buttons.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import {
  X,
  ChevronRight,
  ChevronDown,
  Info,
  Clock,
  Briefcase,
  Cpu,
  Shield,
  ArrowRightLeft,
  Truck,
  Save,
  Edit2,
  Check,
  AlertTriangle,
  Eye,
  Tag,
  User,
  Building,
  Activity,
  Database,
  Globe,
  Lock,
  FileText,
  History,
} from 'lucide-react';

import type {
  ApplicationFactSheet as FactSheetType,
  ApplicationLifecyclePhase,
  ApplicationCriticality,
  ApplicationComplexity,
  DataClassification,
  MigrationDisposition,
  FactRelation,
  ApplicationObservation,
} from '../../types/models/applicationFactSheet';
import { Button } from '../atoms/Button';

export interface ApplicationFactSheetProps {
  isOpen: boolean;
  onClose: () => void;
  factSheet: FactSheetType | null;
  onSave?: (section: string, updates: any) => Promise<void>;
  onNavigateToEntity?: (entityId: string) => void;
  onViewHistory?: (field: string) => void;
}

// ============================================================================
// Constants
// ============================================================================

const LIFECYCLE_OPTIONS: { value: ApplicationLifecyclePhase; label: string }[] = [
  { value: 'plan', label: 'Plan' },
  { value: 'phase_in', label: 'Phase In' },
  { value: 'active', label: 'Active' },
  { value: 'phase_out', label: 'Phase Out' },
  { value: 'end_of_life', label: 'End of Life' },
];

const CRITICALITY_OPTIONS: { value: ApplicationCriticality; label: string }[] = [
  { value: 'mission_critical', label: 'Mission Critical' },
  { value: 'business_critical', label: 'Business Critical' },
  { value: 'business_operational', label: 'Business Operational' },
  { value: 'administrative', label: 'Administrative' },
];

const COMPLEXITY_OPTIONS: { value: ApplicationComplexity; label: string }[] = [
  { value: 'simple', label: 'Simple' },
  { value: 'standard', label: 'Standard' },
  { value: 'complex', label: 'Complex' },
  { value: 'highly_complex', label: 'Highly Complex' },
];

const CLASSIFICATION_OPTIONS: { value: DataClassification; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'internal', label: 'Internal' },
  { value: 'confidential', label: 'Confidential' },
  { value: 'restricted', label: 'Restricted' },
];

const DISPOSITION_OPTIONS: { value: MigrationDisposition; label: string }[] = [
  { value: 'retain', label: 'Retain' },
  { value: 'retire', label: 'Retire' },
  { value: 'replace', label: 'Replace' },
  { value: 'rehost', label: 'Rehost' },
  { value: 'refactor', label: 'Refactor' },
  { value: 'replatform', label: 'Replatform' },
  { value: 'repurchase', label: 'Repurchase' },
];

const LIFECYCLE_COLORS: Record<ApplicationLifecyclePhase, { bg: string; text: string; label: string }> = {
  plan: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Plan' },
  phase_in: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400', label: 'Phase In' },
  active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Active' },
  phase_out: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'Phase Out' },
  end_of_life: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'End of Life' },
};

const CRITICALITY_COLORS: Record<ApplicationCriticality, { bg: string; text: string; label: string }> = {
  mission_critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Mission Critical' },
  business_critical: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'Business Critical' },
  business_operational: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Business Operational' },
  administrative: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400', label: 'Administrative' },
};

const DISPOSITION_COLORS: Record<MigrationDisposition, { bg: string; text: string; label: string }> = {
  retain: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400', label: 'Retain' },
  retire: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Retire' },
  replace: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Replace' },
  rehost: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Rehost' },
  refactor: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', label: 'Refactor' },
  replatform: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400', label: 'Replatform' },
  repurchase: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Repurchase' },
};

const CLASSIFICATION_COLORS: Record<DataClassification, { bg: string; text: string; label: string }> = {
  public: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Public' },
  internal: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Internal' },
  confidential: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'Confidential' },
  restricted: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Restricted' },
};

// ============================================================================
// Helper Components
// ============================================================================

interface ScoreBadgeProps {
  score: number;
  label: string;
  inverse?: boolean;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, label, inverse }) => {
  const getColor = () => {
    const effectiveScore = inverse ? 100 - score : score;
    if (effectiveScore >= 80) return 'text-green-600 dark:text-green-400';
    if (effectiveScore >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (effectiveScore >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="text-center">
      <div className={clsx('text-2xl font-bold', getColor())}>{score}%</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
};

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  isEditing?: boolean;
  onEditToggle?: () => void;
  onSave?: () => void;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  isExpanded,
  onToggle,
  isEditing,
  onEditToggle,
  onSave,
  badge,
  children,
}) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800">
      <button
        onClick={onToggle}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span className="text-gray-600 dark:text-gray-400">{icon}</span>
        <span className="font-medium text-gray-900 dark:text-white">{title}</span>
        {badge}
      </button>
      {onEditToggle && (
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={onSave}
                className="px-3 py-1 text-xs bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors flex items-center gap-1"
              >
                <Save size={12} /> Save
              </button>
              <button
                onClick={onEditToggle}
                className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={onEditToggle}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title="Edit section"
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
    {isExpanded && (
      <div className="p-4 bg-white dark:bg-gray-900">
        {children}
      </div>
    )}
  </div>
);

// Editable field components
interface EditableTextFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  isEditing: boolean;
  placeholder?: string;
  type?: 'text' | 'email' | 'number' | 'date';
}

const EditableTextField: React.FC<EditableTextFieldProps> = ({
  label,
  value,
  onChange,
  isEditing,
  placeholder,
  type = 'text',
}) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    {isEditing ? (
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-48 text-right"
      />
    ) : (
      <span className="text-sm font-medium text-gray-900 dark:text-white text-right">
        {value || <span className="text-gray-400 italic">Not set</span>}
      </span>
    )}
  </div>
);

interface EditableSelectFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  isEditing: boolean;
  options: { value: string; label: string }[];
  colorMap?: Record<string, { bg: string; text: string; label: string }>;
}

const EditableSelectField: React.FC<EditableSelectFieldProps> = ({
  label,
  value,
  onChange,
  isEditing,
  options,
  colorMap,
}) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    {isEditing ? (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    ) : (
      <span
        className={clsx(
          'text-sm px-2 py-0.5 rounded',
          colorMap && value ? `${colorMap[value]?.bg} ${colorMap[value]?.text}` : 'text-gray-900 dark:text-white font-medium'
        )}
      >
        {colorMap && value ? colorMap[value]?.label : options.find(o => o.value === value)?.label || value || <span className="text-gray-400 italic">Not set</span>}
      </span>
    )}
  </div>
);

interface EditableBooleanFieldProps {
  label: string;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  isEditing: boolean;
}

const EditableBooleanField: React.FC<EditableBooleanFieldProps> = ({
  label,
  value,
  onChange,
  isEditing,
}) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    {isEditing ? (
      <input
        type="checkbox"
        checked={value || false}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
      />
    ) : (
      <span className={clsx('text-sm font-medium', value ? 'text-green-600 dark:text-green-400' : 'text-gray-500')}>
        {value ? 'Yes' : 'No'}
      </span>
    )}
  </div>
);

interface EditableTagsFieldProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  isEditing: boolean;
}

const EditableTagsField: React.FC<EditableTagsFieldProps> = ({
  label,
  value,
  onChange,
  isEditing,
}) => (
  <div className="flex items-start justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    {isEditing ? (
      <input
        type="text"
        value={(value || []).join(', ')}
        onChange={(e) => onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
        placeholder="Comma separated"
        className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-48 text-right"
      />
    ) : (
      <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
        {(value || []).length === 0 ? (
          <span className="text-gray-400 italic text-sm">No tags</span>
        ) : (
          (value || []).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))
        )}
      </div>
    )}
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export const ApplicationFactSheet: React.FC<ApplicationFactSheetProps> = ({
  isOpen,
  onClose,
  factSheet,
  onSave,
  onNavigateToEntity,
  onViewHistory,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    baseInfo: true,
    lifecycle: true,
    business: false,
    technical: false,
    security: false,
    relations: true,
    migration: true,
  });

  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({});

  // Local edits for each section
  const [baseInfoEdits, setBaseInfoEdits] = useState<any>({});
  const [lifecycleEdits, setLifecycleEdits] = useState<any>({});
  const [businessEdits, setBusinessEdits] = useState<any>({});
  const [technicalEdits, setTechnicalEdits] = useState<any>({});
  const [securityEdits, setSecurityEdits] = useState<any>({});
  const [migrationEdits, setMigrationEdits] = useState<any>({});

  // Reset edits when fact sheet changes
  useEffect(() => {
    if (factSheet) {
      setBaseInfoEdits({ ...factSheet.baseInfo });
      setLifecycleEdits({ ...factSheet.lifecycle });
      setBusinessEdits({ ...factSheet.business });
      setTechnicalEdits({ ...factSheet.technical });
      setSecurityEdits({ ...factSheet.security });
      setMigrationEdits({ ...factSheet.migration });
    }
  }, [factSheet]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const toggleEditing = useCallback((section: string) => {
    setEditingSections((prev) => ({ ...prev, [section]: !prev[section] }));
    // Reset to original values if cancelling
    if (editingSections[section] && factSheet) {
      if (section === 'baseInfo') setBaseInfoEdits({ ...factSheet.baseInfo });
      if (section === 'lifecycle') setLifecycleEdits({ ...factSheet.lifecycle });
      if (section === 'business') setBusinessEdits({ ...factSheet.business });
      if (section === 'technical') setTechnicalEdits({ ...factSheet.technical });
      if (section === 'security') setSecurityEdits({ ...factSheet.security });
      if (section === 'migration') setMigrationEdits({ ...factSheet.migration });
    }
  }, [editingSections, factSheet]);

  const handleSaveSection = useCallback(async (section: string) => {
    if (!onSave) return;

    let updates: any;
    switch (section) {
      case 'baseInfo': updates = baseInfoEdits; break;
      case 'lifecycle': updates = lifecycleEdits; break;
      case 'business': updates = businessEdits; break;
      case 'technical': updates = technicalEdits; break;
      case 'security': updates = securityEdits; break;
      case 'migration': updates = migrationEdits; break;
      default: return;
    }

    await onSave(section, updates);
    setEditingSections((prev) => ({ ...prev, [section]: false }));
  }, [onSave, baseInfoEdits, lifecycleEdits, businessEdits, technicalEdits, securityEdits, migrationEdits]);

  if (!isOpen || !factSheet) return null;

  const { relations } = factSheet;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-500 to-teal-600">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Briefcase size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{baseInfoEdits.name || factSheet.baseInfo.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {baseInfoEdits.vendor && (
                  <span className="text-sm text-white/80">{baseInfoEdits.vendor}</span>
                )}
                {baseInfoEdits.version && (
                  <span className="text-xs px-2 py-0.5 bg-white/20 rounded text-white">
                    v{baseInfoEdits.version}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6 bg-white/10 rounded-lg px-4 py-2">
              <ScoreBadge score={factSheet.readinessScore} label="Readiness" />
              <ScoreBadge score={factSheet.overallRiskScore} label="Risk" inverse />
              <ScoreBadge score={factSheet.completenessScore} label="Complete" />
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Base Info Section */}
          <CollapsibleSection
            title="Base Information"
            icon={<Info size={18} />}
            isExpanded={expandedSections.baseInfo}
            onToggle={() => toggleSection('baseInfo')}
            isEditing={editingSections.baseInfo}
            onEditToggle={() => toggleEditing('baseInfo')}
            onSave={() => handleSaveSection('baseInfo')}
            badge={
              <span
                className={clsx(
                  'ml-2 px-2 py-0.5 text-xs rounded-full',
                  LIFECYCLE_COLORS[(lifecycleEdits.phase || 'active') as ApplicationLifecyclePhase].bg,
                  LIFECYCLE_COLORS[(lifecycleEdits.phase || 'active') as ApplicationLifecyclePhase].text
                )}
              >
                {LIFECYCLE_COLORS[(lifecycleEdits.phase || 'active') as ApplicationLifecyclePhase].label}
              </span>
            }
          >
            <div className="grid grid-cols-2 gap-x-8">
              <div>
                <EditableTextField
                  label="Name"
                  value={baseInfoEdits.name}
                  onChange={(v) => setBaseInfoEdits((p: any) => ({ ...p, name: v }))}
                  isEditing={editingSections.baseInfo}
                />
                <EditableTextField
                  label="Technical Name"
                  value={baseInfoEdits.technicalName}
                  onChange={(v) => setBaseInfoEdits((p: any) => ({ ...p, technicalName: v }))}
                  isEditing={editingSections.baseInfo}
                />
                <EditableTextField
                  label="External ID"
                  value={baseInfoEdits.externalId}
                  onChange={(v) => setBaseInfoEdits((p: any) => ({ ...p, externalId: v }))}
                  isEditing={editingSections.baseInfo}
                />
                <EditableTextField
                  label="Vendor"
                  value={baseInfoEdits.vendor}
                  onChange={(v) => setBaseInfoEdits((p: any) => ({ ...p, vendor: v }))}
                  isEditing={editingSections.baseInfo}
                />
                <EditableTextField
                  label="Version"
                  value={baseInfoEdits.version}
                  onChange={(v) => setBaseInfoEdits((p: any) => ({ ...p, version: v }))}
                  isEditing={editingSections.baseInfo}
                />
              </div>
              <div>
                <EditableSelectField
                  label="Type"
                  value={baseInfoEdits.applicationType}
                  onChange={(v) => setBaseInfoEdits((p: any) => ({ ...p, applicationType: v }))}
                  isEditing={editingSections.baseInfo}
                  options={[
                    { value: 'saas', label: 'SaaS' },
                    { value: 'cots', label: 'COTS' },
                    { value: 'custom', label: 'Custom' },
                    { value: 'legacy', label: 'Legacy' },
                    { value: 'infrastructure', label: 'Infrastructure' },
                  ]}
                />
                <EditableTagsField
                  label="Tags"
                  value={baseInfoEdits.tags || []}
                  onChange={(v) => setBaseInfoEdits((p: any) => ({ ...p, tags: v }))}
                  isEditing={editingSections.baseInfo}
                />
                <EditableTagsField
                  label="Aliases"
                  value={baseInfoEdits.aliases || []}
                  onChange={(v) => setBaseInfoEdits((p: any) => ({ ...p, aliases: v }))}
                  isEditing={editingSections.baseInfo}
                />
              </div>
            </div>
            {editingSections.baseInfo ? (
              <div className="mt-4">
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Description</label>
                <textarea
                  value={baseInfoEdits.description || ''}
                  onChange={(e) => setBaseInfoEdits((p: any) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  placeholder="Application description..."
                />
              </div>
            ) : baseInfoEdits.description ? (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">{baseInfoEdits.description}</p>
              </div>
            ) : null}
          </CollapsibleSection>

          {/* Lifecycle Section */}
          <CollapsibleSection
            title="Lifecycle"
            icon={<Clock size={18} />}
            isExpanded={expandedSections.lifecycle}
            onToggle={() => toggleSection('lifecycle')}
            isEditing={editingSections.lifecycle}
            onEditToggle={() => toggleEditing('lifecycle')}
            onSave={() => handleSaveSection('lifecycle')}
          >
            <div className="grid grid-cols-2 gap-x-8">
              <div>
                <EditableSelectField
                  label="Phase"
                  value={lifecycleEdits.phase}
                  onChange={(v) => setLifecycleEdits((p: any) => ({ ...p, phase: v }))}
                  isEditing={editingSections.lifecycle}
                  options={LIFECYCLE_OPTIONS}
                  colorMap={LIFECYCLE_COLORS}
                />
                <EditableTextField
                  label="Phase Start Date"
                  value={lifecycleEdits.phaseStartDate}
                  onChange={(v) => setLifecycleEdits((p: any) => ({ ...p, phaseStartDate: v }))}
                  isEditing={editingSections.lifecycle}
                  type="date"
                />
                <EditableTextField
                  label="End of Life Date"
                  value={lifecycleEdits.endOfLifeDate}
                  onChange={(v) => setLifecycleEdits((p: any) => ({ ...p, endOfLifeDate: v }))}
                  isEditing={editingSections.lifecycle}
                  type="date"
                />
              </div>
              <div>
                <EditableTextField
                  label="Last Review"
                  value={lifecycleEdits.lastReviewDate}
                  onChange={(v) => setLifecycleEdits((p: any) => ({ ...p, lastReviewDate: v }))}
                  isEditing={editingSections.lifecycle}
                  type="date"
                />
                <EditableTextField
                  label="Next Review"
                  value={lifecycleEdits.nextReviewDate}
                  onChange={(v) => setLifecycleEdits((p: any) => ({ ...p, nextReviewDate: v }))}
                  isEditing={editingSections.lifecycle}
                  type="date"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Business Section */}
          <CollapsibleSection
            title="Business Context"
            icon={<Building size={18} />}
            isExpanded={expandedSections.business}
            onToggle={() => toggleSection('business')}
            isEditing={editingSections.business}
            onEditToggle={() => toggleEditing('business')}
            onSave={() => handleSaveSection('business')}
            badge={
              <span
                className={clsx(
                  'ml-2 px-2 py-0.5 text-xs rounded-full',
                  CRITICALITY_COLORS[(businessEdits.criticality || 'administrative') as ApplicationCriticality].bg,
                  CRITICALITY_COLORS[(businessEdits.criticality || 'administrative') as ApplicationCriticality].text
                )}
              >
                {CRITICALITY_COLORS[(businessEdits.criticality || 'administrative') as ApplicationCriticality].label}
              </span>
            }
          >
            <div className="grid grid-cols-2 gap-x-8">
              <div>
                <EditableSelectField
                  label="Criticality"
                  value={businessEdits.criticality}
                  onChange={(v) => setBusinessEdits((p: any) => ({ ...p, criticality: v }))}
                  isEditing={editingSections.business}
                  options={CRITICALITY_OPTIONS}
                  colorMap={CRITICALITY_COLORS}
                />
                <EditableTextField
                  label="Business Owner"
                  value={businessEdits.businessOwner}
                  onChange={(v) => setBusinessEdits((p: any) => ({ ...p, businessOwner: v }))}
                  isEditing={editingSections.business}
                />
                <EditableTextField
                  label="Owner Email"
                  value={businessEdits.businessOwnerEmail}
                  onChange={(v) => setBusinessEdits((p: any) => ({ ...p, businessOwnerEmail: v }))}
                  isEditing={editingSections.business}
                  type="email"
                />
                <EditableTextField
                  label="Cost Center"
                  value={businessEdits.costCenter}
                  onChange={(v) => setBusinessEdits((p: any) => ({ ...p, costCenter: v }))}
                  isEditing={editingSections.business}
                />
                <EditableTextField
                  label="Annual Cost"
                  value={businessEdits.annualCost?.toString()}
                  onChange={(v) => setBusinessEdits((p: any) => ({ ...p, annualCost: parseFloat(v) || 0 }))}
                  isEditing={editingSections.business}
                  type="number"
                />
              </div>
              <div>
                <EditableTextField
                  label="User Count"
                  value={businessEdits.userCount?.toString()}
                  onChange={(v) => setBusinessEdits((p: any) => ({ ...p, userCount: parseInt(v) || 0 }))}
                  isEditing={editingSections.business}
                  type="number"
                />
                <EditableTextField
                  label="Business Value (1-10)"
                  value={businessEdits.businessValueScore?.toString()}
                  onChange={(v) => setBusinessEdits((p: any) => ({ ...p, businessValueScore: parseInt(v) || 0 }))}
                  isEditing={editingSections.business}
                  type="number"
                />
                <EditableTagsField
                  label="Departments"
                  value={businessEdits.departments || []}
                  onChange={(v) => setBusinessEdits((p: any) => ({ ...p, departments: v }))}
                  isEditing={editingSections.business}
                />
                <EditableTagsField
                  label="Capabilities"
                  value={businessEdits.businessCapabilities || []}
                  onChange={(v) => setBusinessEdits((p: any) => ({ ...p, businessCapabilities: v }))}
                  isEditing={editingSections.business}
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Technical Section */}
          <CollapsibleSection
            title="Technical Details"
            icon={<Cpu size={18} />}
            isExpanded={expandedSections.technical}
            onToggle={() => toggleSection('technical')}
            isEditing={editingSections.technical}
            onEditToggle={() => toggleEditing('technical')}
            onSave={() => handleSaveSection('technical')}
          >
            <div className="grid grid-cols-2 gap-x-8">
              <div>
                <EditableSelectField
                  label="Complexity"
                  value={technicalEdits.complexity}
                  onChange={(v) => setTechnicalEdits((p: any) => ({ ...p, complexity: v }))}
                  isEditing={editingSections.technical}
                  options={COMPLEXITY_OPTIONS}
                />
                <EditableTextField
                  label="Technical Owner"
                  value={technicalEdits.technicalOwner}
                  onChange={(v) => setTechnicalEdits((p: any) => ({ ...p, technicalOwner: v }))}
                  isEditing={editingSections.technical}
                />
                <EditableTextField
                  label="Owner Email"
                  value={technicalEdits.technicalOwnerEmail}
                  onChange={(v) => setTechnicalEdits((p: any) => ({ ...p, technicalOwnerEmail: v }))}
                  isEditing={editingSections.technical}
                  type="email"
                />
                <EditableSelectField
                  label="Hosting"
                  value={technicalEdits.hostingType}
                  onChange={(v) => setTechnicalEdits((p: any) => ({ ...p, hostingType: v }))}
                  isEditing={editingSections.technical}
                  options={[
                    { value: 'on_premise', label: 'On-Premise' },
                    { value: 'cloud', label: 'Cloud' },
                    { value: 'hybrid', label: 'Hybrid' },
                    { value: 'saas', label: 'SaaS' },
                  ]}
                />
                <EditableTextField
                  label="Health Score (%)"
                  value={technicalEdits.healthScore?.toString()}
                  onChange={(v) => setTechnicalEdits((p: any) => ({ ...p, healthScore: parseInt(v) || 0 }))}
                  isEditing={editingSections.technical}
                  type="number"
                />
              </div>
              <div>
                <EditableTagsField
                  label="Languages"
                  value={technicalEdits.languages || []}
                  onChange={(v) => setTechnicalEdits((p: any) => ({ ...p, languages: v }))}
                  isEditing={editingSections.technical}
                />
                <EditableTagsField
                  label="Frameworks"
                  value={technicalEdits.frameworks || []}
                  onChange={(v) => setTechnicalEdits((p: any) => ({ ...p, frameworks: v }))}
                  isEditing={editingSections.technical}
                />
                <EditableTagsField
                  label="Databases"
                  value={technicalEdits.databases || []}
                  onChange={(v) => setTechnicalEdits((p: any) => ({ ...p, databases: v }))}
                  isEditing={editingSections.technical}
                />
                <EditableTagsField
                  label="Infrastructure"
                  value={technicalEdits.infrastructure || []}
                  onChange={(v) => setTechnicalEdits((p: any) => ({ ...p, infrastructure: v }))}
                  isEditing={editingSections.technical}
                />
                <EditableTagsField
                  label="Integrations"
                  value={technicalEdits.integrations || []}
                  onChange={(v) => setTechnicalEdits((p: any) => ({ ...p, integrations: v }))}
                  isEditing={editingSections.technical}
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Security Section */}
          <CollapsibleSection
            title="Security & Compliance"
            icon={<Shield size={18} />}
            isExpanded={expandedSections.security}
            onToggle={() => toggleSection('security')}
            isEditing={editingSections.security}
            onEditToggle={() => toggleEditing('security')}
            onSave={() => handleSaveSection('security')}
            badge={
              <span
                className={clsx(
                  'ml-2 px-2 py-0.5 text-xs rounded-full',
                  CLASSIFICATION_COLORS[(securityEdits.dataClassification || 'internal') as DataClassification].bg,
                  CLASSIFICATION_COLORS[(securityEdits.dataClassification || 'internal') as DataClassification].text
                )}
              >
                {CLASSIFICATION_COLORS[(securityEdits.dataClassification || 'internal') as DataClassification].label}
              </span>
            }
          >
            <div className="grid grid-cols-2 gap-x-8">
              <div>
                <EditableSelectField
                  label="Data Classification"
                  value={securityEdits.dataClassification}
                  onChange={(v) => setSecurityEdits((p: any) => ({ ...p, dataClassification: v }))}
                  isEditing={editingSections.security}
                  options={CLASSIFICATION_OPTIONS}
                  colorMap={CLASSIFICATION_COLORS}
                />
                <EditableBooleanField
                  label="Contains PII"
                  value={securityEdits.containsPII}
                  onChange={(v) => setSecurityEdits((p: any) => ({ ...p, containsPII: v }))}
                  isEditing={editingSections.security}
                />
                <EditableBooleanField
                  label="Contains PHI"
                  value={securityEdits.containsPHI}
                  onChange={(v) => setSecurityEdits((p: any) => ({ ...p, containsPHI: v }))}
                  isEditing={editingSections.security}
                />
                <EditableBooleanField
                  label="Financial Data"
                  value={securityEdits.containsFinancialData}
                  onChange={(v) => setSecurityEdits((p: any) => ({ ...p, containsFinancialData: v }))}
                  isEditing={editingSections.security}
                />
              </div>
              <div>
                <EditableTextField
                  label="Auth Method"
                  value={securityEdits.authenticationMethod}
                  onChange={(v) => setSecurityEdits((p: any) => ({ ...p, authenticationMethod: v }))}
                  isEditing={editingSections.security}
                />
                <EditableBooleanField
                  label="SSO Enabled"
                  value={securityEdits.ssoEnabled}
                  onChange={(v) => setSecurityEdits((p: any) => ({ ...p, ssoEnabled: v }))}
                  isEditing={editingSections.security}
                />
                <EditableTextField
                  label="SSO Provider"
                  value={securityEdits.ssoProvider}
                  onChange={(v) => setSecurityEdits((p: any) => ({ ...p, ssoProvider: v }))}
                  isEditing={editingSections.security}
                />
                <EditableTextField
                  label="Last Security Review"
                  value={securityEdits.lastSecurityReview}
                  onChange={(v) => setSecurityEdits((p: any) => ({ ...p, lastSecurityReview: v }))}
                  isEditing={editingSections.security}
                  type="date"
                />
                <EditableTagsField
                  label="Compliance"
                  value={securityEdits.complianceRequirements || []}
                  onChange={(v) => setSecurityEdits((p: any) => ({ ...p, complianceRequirements: v }))}
                  isEditing={editingSections.security}
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Relations Section (read-only for now) */}
          <CollapsibleSection
            title="Relations"
            icon={<ArrowRightLeft size={18} />}
            isExpanded={expandedSections.relations}
            onToggle={() => toggleSection('relations')}
            badge={
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {relations.length}
              </span>
            }
          >
            {relations.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">No relations discovered</p>
            ) : (
              <div className="space-y-2">
                {relations.map((rel) => (
                  <div
                    key={rel.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                    onClick={() => onNavigateToEntity?.(rel.targetId)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                        {rel.relationType.replace('_', ' ')}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {rel.targetName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({rel.targetType})
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

          {/* Migration Section */}
          <CollapsibleSection
            title="Migration Planning"
            icon={<Truck size={18} />}
            isExpanded={expandedSections.migration}
            onToggle={() => toggleSection('migration')}
            isEditing={editingSections.migration}
            onEditToggle={() => toggleEditing('migration')}
            onSave={() => handleSaveSection('migration')}
            badge={
              <span
                className={clsx(
                  'ml-2 px-2 py-0.5 text-xs rounded-full',
                  DISPOSITION_COLORS[(migrationEdits.disposition || 'retain') as MigrationDisposition].bg,
                  DISPOSITION_COLORS[(migrationEdits.disposition || 'retain') as MigrationDisposition].text
                )}
              >
                {DISPOSITION_COLORS[(migrationEdits.disposition || 'retain') as MigrationDisposition].label}
              </span>
            }
          >
            <div className="grid grid-cols-2 gap-x-8">
              <div>
                <EditableSelectField
                  label="Disposition"
                  value={migrationEdits.disposition}
                  onChange={(v) => setMigrationEdits((p: any) => ({ ...p, disposition: v }))}
                  isEditing={editingSections.migration}
                  options={DISPOSITION_OPTIONS}
                  colorMap={DISPOSITION_COLORS}
                />
                <EditableTextField
                  label="Target Environment"
                  value={migrationEdits.targetEnvironment}
                  onChange={(v) => setMigrationEdits((p: any) => ({ ...p, targetEnvironment: v }))}
                  isEditing={editingSections.migration}
                />
                <EditableTextField
                  label="Migration Wave"
                  value={migrationEdits.waveName || migrationEdits.waveId}
                  onChange={(v) => setMigrationEdits((p: any) => ({ ...p, waveName: v }))}
                  isEditing={editingSections.migration}
                />
                <EditableTextField
                  label="Planned Date"
                  value={migrationEdits.plannedDate}
                  onChange={(v) => setMigrationEdits((p: any) => ({ ...p, plannedDate: v }))}
                  isEditing={editingSections.migration}
                  type="date"
                />
              </div>
              <div>
                <EditableSelectField
                  label="Status"
                  value={migrationEdits.status}
                  onChange={(v) => setMigrationEdits((p: any) => ({ ...p, status: v }))}
                  isEditing={editingSections.migration}
                  options={[
                    { value: 'not_started', label: 'Not Started' },
                    { value: 'planning', label: 'Planning' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'testing', label: 'Testing' },
                    { value: 'blocked', label: 'Blocked' },
                    { value: 'completed', label: 'Completed' },
                  ]}
                />
                <EditableSelectField
                  label="Risk Level"
                  value={migrationEdits.riskLevel}
                  onChange={(v) => setMigrationEdits((p: any) => ({ ...p, riskLevel: v }))}
                  isEditing={editingSections.migration}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'critical', label: 'Critical' },
                  ]}
                />
                <EditableTextField
                  label="Estimated Effort (hrs)"
                  value={migrationEdits.estimatedEffort?.toString()}
                  onChange={(v) => setMigrationEdits((p: any) => ({ ...p, estimatedEffort: parseInt(v) || 0 }))}
                  isEditing={editingSections.migration}
                  type="number"
                />
                <EditableTagsField
                  label="Blockers"
                  value={migrationEdits.blockers || []}
                  onChange={(v) => setMigrationEdits((p: any) => ({ ...p, blockers: v }))}
                  isEditing={editingSections.migration}
                />
                <EditableTagsField
                  label="Risk Factors"
                  value={migrationEdits.riskFactors || []}
                  onChange={(v) => setMigrationEdits((p: any) => ({ ...p, riskFactors: v }))}
                  isEditing={editingSections.migration}
                />
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date(factSheet.updatedAt).toLocaleString()}
            {factSheet.updatedBy && ` by ${factSheet.updatedBy}`}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationFactSheet;


