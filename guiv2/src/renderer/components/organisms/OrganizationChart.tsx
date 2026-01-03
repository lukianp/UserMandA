/**
 * Organization Chart Component
 * Interactive hierarchical visualization of Active Directory reporting structure
 */

import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  User,
  Users as UsersIcon,
  Shield,
  AlertTriangle,
  Mail,
  Building2,
  Briefcase,
  MapPin,
  Search,
} from 'lucide-react';
import { OrgChartNode, OrgChartStats } from '../../utils/orgChartBuilder';

interface OrganizationChartProps {
  roots: OrgChartNode[];
  stats: OrgChartStats;
  onNodeClick?: (node: OrgChartNode) => void;
}

export const OrganizationChart: React.FC<OrganizationChartProps> = ({
  roots,
  stats,
  onNodeClick,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<OrgChartNode | null>(null);

  // Auto-expand first level
  useMemo(() => {
    const firstLevel = new Set<string>();
    roots.forEach(root => {
      firstLevel.add(root.distinguishedName);
    });
    setExpandedNodes(firstLevel);
  }, [roots]);

  const toggleNode = (dn: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(dn)) {
        next.delete(dn);
      } else {
        next.add(dn);
      }
      return next;
    });
  };

  const handleNodeClick = (node: OrgChartNode) => {
    setSelectedNode(node);
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  // Filter nodes by search query
  const isNodeVisible = (node: OrgChartNode): boolean => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      node.displayName.toLowerCase().includes(query) ||
      node.samAccountName.toLowerCase().includes(query) ||
      node.email.toLowerCase().includes(query) ||
      node.title.toLowerCase().includes(query) ||
      node.department.toLowerCase().includes(query)
    );
  };

  // Expand all matching nodes
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim()) {
      const expanded = new Set<string>();
      const checkNode = (node: OrgChartNode) => {
        if (isNodeVisible(node)) {
          expanded.add(node.distinguishedName);
          // Expand all parents
          let current = node;
          while (current.managerDN) {
            expanded.add(current.managerDN);
            current = roots.find(r => findNodeByDN(r, current.managerDN!)) || current;
            if (!current.managerDN) break;
          }
        }
        node.directReports.forEach(checkNode);
      };
      roots.forEach(checkNode);
      setExpandedNodes(expanded);
    }
  };

  const findNodeByDN = (node: OrgChartNode, dn: string): OrgChartNode | null => {
    if (node.distinguishedName === dn) return node;
    for (const report of node.directReports) {
      const found = findNodeByDN(report, dn);
      if (found) return found;
    }
    return null;
  };

  return (
    <div className="h-full flex bg-gray-50 dark:bg-gray-900">
      {/* Left Panel: Tree View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Stats Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatItem icon={<UsersIcon className="w-4 h-4" />} label="Total Employees" value={stats.totalNodes} />
            <StatItem icon={<User className="w-4 h-4" />} label="Top Executives" value={stats.topLevelManagers} />
            <StatItem icon={<Building2 className="w-4 h-4" />} label="Org Depth" value={stats.maxDepth} />
            <StatItem icon={<UsersIcon className="w-4 h-4" />} label="Avg Team Size" value={stats.averageSpanOfControl.toFixed(1)} />
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, title, or department..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {searchQuery && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Showing results for "{searchQuery}" - {roots.length} root nodes
            </p>
          )}
        </div>

        {/* Tree Container */}
        <div className="flex-1 overflow-auto p-6">
          {roots.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No organizational data available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {roots.map(root => (
                <OrgNode
                  key={root.distinguishedName}
                  node={root}
                  isExpanded={expandedNodes.has(root.distinguishedName)}
                  isSelected={selectedNode?.distinguishedName === root.distinguishedName}
                  isVisible={isNodeVisible(root)}
                  expandedNodes={expandedNodes}
                  onToggle={() => toggleNode(root.distinguishedName)}
                  onClick={() => handleNodeClick(root)}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Node Details */}
      {selectedNode && (
        <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-auto">
          <NodeDetailsPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        </div>
      )}
    </div>
  );
};

/**
 * Individual org chart node (recursive tree structure)
 */
interface OrgNodeProps {
  node: OrgChartNode;
  isExpanded: boolean;
  isSelected: boolean;
  isVisible: boolean;
  expandedNodes: Set<string>;
  onToggle: () => void;
  onClick: () => void;
  searchQuery: string;
}

const OrgNode: React.FC<OrgNodeProps> = ({
  node,
  isExpanded,
  isSelected,
  isVisible,
  expandedNodes,
  onToggle,
  onClick,
  searchQuery,
}) => {
  const hasChildren = node.directReports.length > 0;

  if (!isVisible && !hasChildren) return null;

  // Highlight search matches
  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-600 text-gray-900 dark:text-gray-100">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="select-none">
      {/* Node Card */}
      <div
        className={`
          flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer
          ${isSelected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm'
          }
          ${!isVisible ? 'opacity-40' : ''}
        `}
        onClick={onClick}
      >
        {/* Expand/Collapse Icon */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-6" />}

        {/* User Avatar/Icon */}
        <div
          className={`
            p-2 rounded-full
            ${node.isPrivileged
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : node.isDisabled
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            }
          `}
        >
          {node.isPrivileged ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {highlightText(node.displayName)}
            </p>
            {node.isDisabled && (
              <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                Disabled
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {highlightText(node.title)}
          </p>
          {node.department !== 'No Department' && (
            <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
              {highlightText(node.department)}
            </p>
          )}
        </div>

        {/* Team Count Badge */}
        {hasChildren && (
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
            <UsersIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {node.directReports.length}
            </span>
          </div>
        )}
      </div>

      {/* Direct Reports (Children) */}
      {isExpanded && hasChildren && (
        <div className="ml-8 mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-2">
          {node.directReports.map(report => (
            <OrgNode
              key={report.distinguishedName}
              node={report}
              isExpanded={expandedNodes.has(report.distinguishedName)}
              isSelected={false}
              isVisible={true}
              expandedNodes={expandedNodes}
              onToggle={() => {}}
              onClick={() => {}}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Node details side panel
 */
interface NodeDetailsPanelProps {
  node: OrgChartNode;
  onClose: () => void;
}

const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({ node, onClose }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{node.displayName}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{node.samAccountName}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <span className="sr-only">Close</span>
          ✕
        </button>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        {node.isPrivileged && (
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded">
            <Shield className="w-3 h-3 inline mr-1" />
            Privileged Account
          </span>
        )}
        {node.isDisabled && (
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-400 text-xs font-semibold rounded">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            Disabled
          </span>
        )}
        {node.isServiceAccount && (
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded">
            Service Account
          </span>
        )}
      </div>

      {/* Contact Information */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Contact Information</h4>
        <DetailRow icon={<Mail className="w-4 h-4" />} label="Email" value={node.email || 'N/A'} />
        <DetailRow icon={<Briefcase className="w-4 h-4" />} label="Title" value={node.title} />
        <DetailRow icon={<Building2 className="w-4 h-4" />} label="Department" value={node.department} />
        {node.office && <DetailRow icon={<MapPin className="w-4 h-4" />} label="Office" value={node.office} />}
        {node.company && <DetailRow icon={<Building2 className="w-4 h-4" />} label="Company" value={node.company} />}
      </div>

      {/* Organizational Metrics */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Organizational Metrics</h4>
        <DetailRow icon={<UsersIcon className="w-4 h-4" />} label="Direct Reports" value={node.spanOfControl.toString()} />
        <DetailRow icon={<UsersIcon className="w-4 h-4" />} label="Total Subordinates" value={node.totalSubordinates.toString()} />
        <DetailRow icon={<Building2 className="w-4 h-4" />} label="Org Level" value={node.level.toString()} />
      </div>

      {/* Direct Reports List */}
      {node.directReports.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            Direct Reports ({node.directReports.length})
          </h4>
          <div className="space-y-2">
            {node.directReports.slice(0, 10).map(report => (
              <div key={report.distinguishedName} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                <User className="w-4 h-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{report.displayName}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{report.title}</p>
                </div>
              </div>
            ))}
            {node.directReports.length > 10 && (
              <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                ... and {node.directReports.length - 10} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* Technical Details */}
      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Technical Details</h4>
        <div className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
          <p className="mb-1"><strong>DN:</strong></p>
          <p className="bg-gray-100 dark:bg-gray-700 p-2 rounded">{node.distinguishedName}</p>
          {node.managerDN && (
            <>
              <p className="mb-1 mt-2"><strong>Manager DN:</strong></p>
              <p className="bg-gray-100 dark:bg-gray-700 p-2 rounded">{node.managerDN}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Stat item component
 */
const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-center gap-2">
    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  </div>
);

/**
 * Detail row component
 */
const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-start gap-2">
    <div className="p-1 text-gray-400 dark:text-gray-600">{icon}</div>
    <div className="flex-1">
      <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  </div>
);

export default OrganizationChart;
