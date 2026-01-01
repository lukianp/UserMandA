/**
 * FactSheetModal Component
 *
 * LeanIX-style fact sheet modal with 9 tabs for displaying comprehensive entity details.
 * Features:
 * - Overview tab with base information
 * - Relations explorer with incoming/outgoing relationships
 * - IT Components, Subscriptions, Comments, To-dos, Resources, Metrics, Surveys tabs
 *
 * Phase 5: FactSheetModal Component Implementation
 */

import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import {
  X,
  Info,
  ArrowRightLeft,
  Box,
  CreditCard,
  MessageSquare,
  CheckSquare,
  Folder,
  BarChart3,
  ClipboardList,
  ExternalLink,
  Calendar,
  User,
  Tag,
  Activity,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

import {
  SankeyNode,
  FactSheetData,
  EntityType,
  EntityStatus,
  Relation,
  ITComponent,
  Subscription,
  Comment,
  TodoItem,
  Resource,
  Metric,
  SurveyResponse,
} from '../../types/models/organisation';

export interface FactSheetModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** The selected node to display */
  node: SankeyNode | null;
  /** Handler for navigating to a related entity */
  onNavigateToEntity?: (entityId: string) => void;
}

/**
 * Tab definition
 */
interface TabDefinition {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

/**
 * Entity type colors for visual consistency
 */
const ENTITY_TYPE_COLORS: Record<EntityType, string> = {
  'company': '#3b82f6',
  'platform': '#8b5cf6',
  'application': '#10b981',
  'datacenter': '#f59e0b',
  'provider-interface': '#06b6d4',
  'consumer-interface': '#ec4899',
  'business-capability': '#6366f1',
  'it-component': '#84cc16',
  'user': '#0ea5e9',
  'group': '#a855f7',
  'mailbox': '#f97316',
  'license': '#22c55e',
  'subscription': '#eab308',
  'resource-group': '#14b8a6'
};

/**
 * Status badge colors
 */
const STATUS_COLORS: Record<EntityStatus, { bg: string; text: string }> = {
  'active': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  'plan': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  'phase-in': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  'phase-out': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  'end-of-life': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
};

/**
 * Priority badge colors for todos
 */
const PRIORITY_COLORS: Record<string, string> = {
  'low': 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  'medium': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'high': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'critical': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

/**
 * Format date helper
 */
function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const FactSheetModal: React.FC<FactSheetModalProps> = ({
  isOpen,
  onClose,
  node,
  onNavigateToEntity,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    incoming: true,
    outgoing: true,
  });

  // Get fact sheet data with safe fallbacks
  const factSheet: FactSheetData | null = useMemo(() => {
    if (!node?.factSheet) return null;
    return node.factSheet;
  }, [node]);

  // Define tabs with counts
  const tabs: TabDefinition[] = useMemo(() => {
    if (!factSheet) return [];
    return [
      { id: 'overview', label: 'Overview', icon: <Info size={16} /> },
      { id: 'relations', label: 'Relations', icon: <ArrowRightLeft size={16} />, count: (factSheet.relations?.incoming?.length || 0) + (factSheet.relations?.outgoing?.length || 0) },
      { id: 'components', label: 'IT Components', icon: <Box size={16} />, count: factSheet.itComponents?.length || 0 },
      { id: 'subscriptions', label: 'Subscriptions', icon: <CreditCard size={16} />, count: factSheet.subscriptions?.length || 0 },
      { id: 'comments', label: 'Comments', icon: <MessageSquare size={16} />, count: factSheet.comments?.length || 0 },
      { id: 'todos', label: 'To-dos', icon: <CheckSquare size={16} />, count: factSheet.todos?.length || 0 },
      { id: 'resources', label: 'Resources', icon: <Folder size={16} />, count: factSheet.resources?.length || 0 },
      { id: 'metrics', label: 'Metrics', icon: <BarChart3 size={16} />, count: factSheet.metrics?.length || 0 },
      { id: 'surveys', label: 'Surveys', icon: <ClipboardList size={16} />, count: factSheet.surveys?.length || 0 },
    ];
  }, [factSheet]);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle ESC key and body scroll
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !node || !factSheet) return null;

  const { baseInfo } = factSheet;
  const statusStyle = STATUS_COLORS[baseInfo?.status || 'active'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-5xl mx-4 max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="factsheet-title"
      >
        {/* Header with entity color accent */}
        <div
          className="border-b border-gray-200 dark:border-gray-700"
          style={{ borderTopColor: ENTITY_TYPE_COLORS[node.type], borderTopWidth: '4px' }}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: ENTITY_TYPE_COLORS[node.type] }}
              >
                {node.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 id="factsheet-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {node.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded capitalize"
                    style={{ backgroundColor: `${ENTITY_TYPE_COLORS[node.type]}20`, color: ENTITY_TYPE_COLORS[node.type] }}
                  >
                    {node.type.replace('-', ' ')}
                  </span>
                  {baseInfo?.status && (
                    <span className={clsx('text-xs font-medium px-2 py-0.5 rounded capitalize', statusStyle.bg, statusStyle.text)}>
                      {baseInfo.status.replace('-', ' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto px-6 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {baseInfo?.description || 'No description available.'}
                </p>
              </div>

              {/* Key Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <User size={14} />
                    <span className="text-xs uppercase tracking-wide">Owner</span>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {baseInfo?.owner || 'Not assigned'}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <Activity size={14} />
                    <span className="text-xs uppercase tracking-wide">Lifecycle</span>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 font-medium capitalize">
                    {baseInfo?.lifecycle?.replace('-', ' ') || 'N/A'}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <Calendar size={14} />
                    <span className="text-xs uppercase tracking-wide">Last Updated</span>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {formatDate(factSheet.lastUpdate)}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <Folder size={14} />
                    <span className="text-xs uppercase tracking-wide">Source</span>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 font-medium text-sm truncate" title={node.metadata?.sourceFile}>
                    {node.metadata?.sourceFile || node.metadata?.source || 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {baseInfo?.tags && baseInfo.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                    <Tag size={14} />
                    <span className="text-xs uppercase tracking-wide font-semibold">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {baseInfo.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw Data Preview */}
              {node.metadata?.record && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Source Data</h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-gray-300 font-mono">
                      {JSON.stringify(node.metadata.record, null, 2).substring(0, 1000)}
                      {JSON.stringify(node.metadata.record, null, 2).length > 1000 && '\n...'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Relations Tab */}
          {activeTab === 'relations' && (
            <div className="space-y-6">
              {/* Incoming Relations */}
              <div>
                <button
                  onClick={() => toggleSection('incoming')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  {expandedSections.incoming ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <ArrowLeft size={16} className="text-blue-500" />
                  Incoming Relations ({factSheet.relations?.incoming?.length || 0})
                </button>
                {expandedSections.incoming && (
                  <div className="space-y-2 ml-6">
                    {factSheet.relations?.incoming?.length > 0 ? (
                      factSheet.relations.incoming.map((rel: Relation) => (
                        <div
                          key={rel.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                          onClick={() => onNavigateToEntity?.(rel.targetId)}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-medium"
                              style={{ backgroundColor: ENTITY_TYPE_COLORS[rel.targetType] }}
                            >
                              {rel.targetName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{rel.targetName}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {rel.type} - {rel.targetType.replace('-', ' ')}
                              </p>
                            </div>
                          </div>
                          <ExternalLink size={14} className="text-gray-400" />
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">No incoming relations</p>
                    )}
                  </div>
                )}
              </div>

              {/* Outgoing Relations */}
              <div>
                <button
                  onClick={() => toggleSection('outgoing')}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  {expandedSections.outgoing ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <ArrowRight size={16} className="text-green-500" />
                  Outgoing Relations ({factSheet.relations?.outgoing?.length || 0})
                </button>
                {expandedSections.outgoing && (
                  <div className="space-y-2 ml-6">
                    {factSheet.relations?.outgoing?.length > 0 ? (
                      factSheet.relations.outgoing.map((rel: Relation) => (
                        <div
                          key={rel.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                          onClick={() => onNavigateToEntity?.(rel.targetId)}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-medium"
                              style={{ backgroundColor: ENTITY_TYPE_COLORS[rel.targetType] }}
                            >
                              {rel.targetName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{rel.targetName}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {rel.type} - {rel.targetType.replace('-', ' ')}
                              </p>
                            </div>
                          </div>
                          <ExternalLink size={14} className="text-gray-400" />
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">No outgoing relations</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* IT Components Tab */}
          {activeTab === 'components' && (
            <div className="space-y-4">
              {factSheet.itComponents?.length > 0 ? (
                <div className="grid gap-4">
                  {factSheet.itComponents.map((comp: ITComponent) => (
                    <div key={comp.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{comp.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{comp.type}</p>
                        </div>
                        <span className={clsx('text-xs px-2 py-1 rounded capitalize', STATUS_COLORS[comp.status]?.bg, STATUS_COLORS[comp.status]?.text)}>
                          {comp.status}
                        </span>
                      </div>
                      {(comp.vendor || comp.version) && (
                        <div className="mt-2 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                          {comp.vendor && <span>Vendor: {comp.vendor}</span>}
                          {comp.version && <span>Version: {comp.version}</span>}
                        </div>
                      )}
                      {comp.description && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{comp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Box size={40} className="mx-auto mb-2 opacity-50" />
                  <p>No IT components found</p>
                </div>
              )}
            </div>
          )}

          {/* Subscriptions Tab */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              {factSheet.subscriptions?.length > 0 ? (
                <div className="grid gap-4">
                  {factSheet.subscriptions.map((sub: Subscription) => (
                    <div key={sub.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{sub.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{sub.provider} - {sub.type}</p>
                        </div>
                        <span className={clsx(
                          'text-xs px-2 py-1 rounded capitalize',
                          sub.status === 'active' ? 'bg-green-100 text-green-700' : sub.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        )}>
                          {sub.status}
                        </span>
                      </div>
                      {sub.cost && (
                        <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {sub.currency || '$'}{sub.cost.toLocaleString()}
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-1">/month</span>
                        </p>
                      )}
                      {sub.renewalDate && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Renewal: {formatDate(sub.renewalDate)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CreditCard size={40} className="mx-auto mb-2 opacity-50" />
                  <p>No subscriptions found</p>
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              {factSheet.comments?.length > 0 ? (
                factSheet.comments.map((comment: Comment) => (
                  <div key={comment.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-medium">
                        {comment.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{comment.author}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.timestamp)}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{comment.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MessageSquare size={40} className="mx-auto mb-2 opacity-50" />
                  <p>No comments yet</p>
                </div>
              )}
            </div>
          )}

          {/* To-dos Tab */}
          {activeTab === 'todos' && (
            <div className="space-y-4">
              {factSheet.todos?.length > 0 ? (
                factSheet.todos.map((todo: TodoItem) => (
                  <div key={todo.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={todo.status === 'completed'}
                        readOnly
                        className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={clsx(
                            'font-medium',
                            todo.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'
                          )}>
                            {todo.title}
                          </h4>
                          <span className={clsx('text-xs px-2 py-0.5 rounded', PRIORITY_COLORS[todo.priority])}>
                            {todo.priority}
                          </span>
                        </div>
                        {todo.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{todo.description}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {todo.assignedTo && <span>Assigned: {todo.assignedTo}</span>}
                          {todo.dueDate && <span>Due: {formatDate(todo.dueDate)}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CheckSquare size={40} className="mx-auto mb-2 opacity-50" />
                  <p>No to-dos yet</p>
                </div>
              )}
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              {factSheet.resources?.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {factSheet.resources.map((resource: Resource) => (
                    <div key={resource.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                      <div className="flex items-start gap-3">
                        <Folder size={20} className="text-gray-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{resource.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{resource.type}</p>
                          {resource.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{resource.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Folder size={40} className="mx-auto mb-2 opacity-50" />
                  <p>No resources found</p>
                </div>
              )}
            </div>
          )}

          {/* Metrics Tab */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              {factSheet.metrics?.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {factSheet.metrics.map((metric: Metric) => (
                    <div key={metric.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{metric.category}</p>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mt-1">{metric.name}</h4>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metric.value}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{metric.unit}</span>
                        {metric.trend && (
                          <span className={clsx(
                            'text-xs',
                            metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                          )}>
                            {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BarChart3 size={40} className="mx-auto mb-2 opacity-50" />
                  <p>No metrics available</p>
                </div>
              )}
            </div>
          )}

          {/* Surveys Tab */}
          {activeTab === 'surveys' && (
            <div className="space-y-4">
              {factSheet.surveys?.length > 0 ? (
                factSheet.surveys.map((survey: SurveyResponse) => (
                  <div key={survey.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{survey.surveyName}</p>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mt-1">{survey.question}</h4>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{survey.answer}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {survey.respondent && <span>By: {survey.respondent}</span>}
                      <span>{formatDate(survey.timestamp)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <ClipboardList size={40} className="mx-auto mb-2 opacity-50" />
                  <p>No survey responses</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FactSheetModal;


