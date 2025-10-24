import React from 'react';
import { Settings, AlertCircle, Plus, Search, Bell, BellOff, Edit, Trash2, Play, Pause, RefreshCw } from 'lucide-react';

import { Button } from '../../components/atoms/Button';
import DataTableOrganism from '../../components/organisms/DataTable';
import { Badge } from '../../components/atoms/Badge';
import { Input } from '../../components/atoms/Input';

import { useNotificationRulesLogic } from '../../hooks/useNotificationRulesLogic';

export const NotificationRulesView: React.FC = () => {
  const {
    rules,
    isLoading,
    error,
    channels,
    templates,
    escalations,
    createRule,
    updateRule,
    deleteRule,
    enableRule,
    disableRule,
    testRule,
    validateRule,
  } = useNotificationRulesLogic();

  const [selectedRules, setSelectedRules] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);

  const ruleColumns: any[] = [
    {
      id: 'name',
      header: 'Rule Name',
      accessor: 'name',
      sortable: true,
      cell: (value: any, row: any) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            row.enabled ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      id: 'triggerType',
      header: 'Trigger',
      accessor: 'triggerType',
      sortable: true,
      width: '100px',
      cell: (value: any) => (
        <Badge variant="info" className="text-xs capitalize">
          {value}
        </Badge>
      ),
    },
    {
      id: 'priority',
      header: 'Priority',
      accessor: 'priority',
      sortable: true,
      width: '90px',
      cell: (value: any) => {
        const colors = {
          low: 'bg-gray-500',
          medium: 'bg-yellow-500',
          high: 'bg-orange-500',
          critical: 'bg-red-500',
        };
        return (
          <Badge
            variant="secondary"
            className={`text-xs capitalize ${colors[value as keyof typeof colors] || 'bg-gray-500'}`}
          >
            {value}
          </Badge>
        );
      },
    },
    {
      id: 'notificationChannels',
      header: 'Channels',
      accessor: 'notificationChannels',
      sortable: false,
      width: '120px',
      cell: (value: any) => (
        <div className="flex gap-1">
          {(value ?? []).slice(0, 3).map((channel: string) => (
            <Badge key={channel} variant="info" className="text-xs">
              {channel}
            </Badge>
          ))}
          {(value ?? []).length > 3 && (
            <Badge variant="info" className="text-xs">
              +{value.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: 'recipients',
      header: 'Recipients',
      accessor: 'recipients',
      sortable: false,
      width: '120px',
      cell: (value: any) => (
        <span className="text-sm text-gray-600">{(value ?? []).length} recipients</span>
      ),
    },
    {
      id: 'lastTriggered',
      header: 'Last Triggered',
      accessor: 'lastTriggered',
      sortable: true,
      width: '140px',
      cell: (value: any) => value ? new Date(value).toLocaleString() : 'Never',
    },
    {
      id: 'analytics',
      header: 'Success Rate',
      accessor: (row: any) => row.analytics,
      sortable: false,
      width: '110px',
      cell: (value: any) => {
        const rate = value.totalSent > 0 ? (value.totalDelivered / value.totalSent * 100) : 0;
        return (
          <div className="flex items-center gap-1">
            <span className="text-sm">{Math.round(rate)}%</span>
            <div className="w-8 h-1 bg-gray-200 rounded">
              <div
                className="h-full bg-green-500 rounded"
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        );
      },
    },
  ];

  const handleToggleRule = React.useCallback(async (ruleId: string, enabled: boolean) => {
    if (enabled) {
      await enableRule(ruleId);
    } else {
      await disableRule(ruleId);
    }
  }, [enableRule, disableRule]);

  const handleTestRule = React.useCallback(async (ruleId: string) => {
    const result = await testRule(ruleId);
    // Could show a toast notification here
    console.log('Test result:', result);
  }, [testRule]);

  const handleDeleteRule = React.useCallback(async (ruleId: string) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      await deleteRule(ruleId);
    }
  }, [deleteRule]);

  const filteredRules = (rules ?? []).filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (error) {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">Error loading notification rules</p>
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Notification Rules</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage automated notification rules and alerting policies
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<RefreshCw className="w-4 h-4" />}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateDialog(true)}
          >
            New Rule
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <Bell className="w-8 h-8 text-blue-500 mb-3" />
          <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">Total Rules</h3>
          <div className="text-2xl font-bold">{(rules ?? []).length}</div>
          <div className="text-xs text-gray-500 mt-1">
            {(rules ?? []).filter(r => r.enabled).length} enabled
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <Settings className="w-8 h-8 text-green-500 mb-3" />
          <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">Active Channels</h3>
          <div className="text-2xl font-bold">{(channels ?? []).filter(c => c.enabled).length}</div>
          <div className="text-xs text-gray-500 mt-1">
            {(channels ?? []).length} total configured
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <AlertCircle className="w-8 h-8 text-purple-500 mb-3" />
          <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">Templates</h3>
          <div className="text-2xl font-bold">{(templates ?? []).length}</div>
          <div className="text-xs text-gray-500 mt-1">
            {(escalations ?? []).length} escalation policies
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<Play className="w-4 h-4" />}
            onClick={() => selectedRules.forEach(id => handleTestRule(id))}
            disabled={selectedRules.length === 0}
          >
            Test Selected ({selectedRules.length})
          </Button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
        <DataTableOrganism
          data={filteredRules}
          columns={ruleColumns}
          loading={isLoading}
          selectable={true}
          onSelectionChange={(selectedRows: any[]) => setSelectedRules((selectedRows ?? []).map(r => r.id))}
          emptyMessage="No notification rules found"
        />
      </div>
    </div>
  );
};


export default NotificationRulesView;
