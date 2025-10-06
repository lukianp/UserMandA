/**
 * Custom Report Builder View
 *
 * Drag-and-drop interface for building custom reports with:
 * - Field selection
 * - Filter configuration
 * - Grouping and sorting
 * - Export to PDF, Excel, CSV
 * - Save as templates
 */

import React, { useState, useMemo } from 'react';
import { Download, Save, Play, Plus, Trash2, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Select } from '../../components/atoms/Select';
import { Input } from '../../components/atoms/Input';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { ColDef } from 'ag-grid-community';

// Report field definition
interface ReportField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  source: string; // Data source (users, groups, computers, etc.)
}

// Report filter
interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'greater_than' | 'less_than';
  value: string;
}

// Report configuration
interface ReportConfig {
  name: string;
  description: string;
  dataSource: string;
  fields: string[];
  filters: ReportFilter[];
  groupBy?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

const CustomReportBuilderView: React.FC = () => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    name: 'New Report',
    description: '',
    dataSource: 'users',
    fields: [],
    filters: [],
    groupBy: undefined,
    sortBy: undefined,
    sortDirection: 'asc',
  });

  const [reportData, setReportData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Available data sources
  const dataSources = [
    { value: 'users', label: 'Users' },
    { value: 'groups', label: 'Groups' },
    { value: 'computers', label: 'Computers' },
    { value: 'servers', label: 'Servers' },
    { value: 'applications', label: 'Applications' },
    { value: 'licenses', label: 'Licenses' },
    { value: 'migrations', label: 'Migrations' },
  ];

  // Available fields based on data source
  const availableFields: Record<string, ReportField[]> = {
    users: [
      { id: 'displayName', name: 'Display Name', type: 'string', source: 'users' },
      { id: 'email', name: 'Email', type: 'string', source: 'users' },
      { id: 'department', name: 'Department', type: 'string', source: 'users' },
      { id: 'jobTitle', name: 'Job Title', type: 'string', source: 'users' },
      { id: 'enabled', name: 'Enabled', type: 'boolean', source: 'users' },
      { id: 'lastLogon', name: 'Last Logon', type: 'date', source: 'users' },
      { id: 'createdDate', name: 'Created Date', type: 'date', source: 'users' },
    ],
    groups: [
      { id: 'name', name: 'Name', type: 'string', source: 'groups' },
      { id: 'description', name: 'Description', type: 'string', source: 'groups' },
      { id: 'memberCount', name: 'Member Count', type: 'number', source: 'groups' },
      { id: 'groupType', name: 'Type', type: 'string', source: 'groups' },
    ],
    computers: [
      { id: 'name', name: 'Name', type: 'string', source: 'computers' },
      { id: 'operatingSystem', name: 'OS', type: 'string', source: 'computers' },
      { id: 'lastSeen', name: 'Last Seen', type: 'date', source: 'computers' },
    ],
  };

  const currentFields = availableFields[reportConfig.dataSource] || [];

  // Filter operators
  const filterOperators = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
  ];

  // Add field to report
  const handleAddField = (fieldId: string) => {
    if (!reportConfig.fields.includes(fieldId)) {
      setReportConfig({
        ...reportConfig,
        fields: [...reportConfig.fields, fieldId],
      });
    }
  };

  // Remove field from report
  const handleRemoveField = (fieldId: string) => {
    setReportConfig({
      ...reportConfig,
      fields: reportConfig.fields.filter(f => f !== fieldId),
    });
  };

  // Move field up
  const handleMoveFieldUp = (index: number) => {
    if (index === 0) return;
    const newFields = [...reportConfig.fields];
    [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    setReportConfig({ ...reportConfig, fields: newFields });
  };

  // Move field down
  const handleMoveFieldDown = (index: number) => {
    if (index === reportConfig.fields.length - 1) return;
    const newFields = [...reportConfig.fields];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    setReportConfig({ ...reportConfig, fields: newFields });
  };

  // Add filter
  const handleAddFilter = () => {
    const newFilter: ReportFilter = {
      id: crypto.randomUUID(),
      field: currentFields[0]?.id || '',
      operator: 'equals',
      value: '',
    };

    setReportConfig({
      ...reportConfig,
      filters: [...reportConfig.filters, newFilter],
    });
  };

  // Update filter
  const handleUpdateFilter = (filterId: string, updates: Partial<ReportFilter>) => {
    setReportConfig({
      ...reportConfig,
      filters: reportConfig.filters.map(f => (f.id === filterId ? { ...f, ...updates } : f)),
    });
  };

  // Remove filter
  const handleRemoveFilter = (filterId: string) => {
    setReportConfig({
      ...reportConfig,
      filters: reportConfig.filters.filter(f => f.id !== filterId),
    });
  };

  // Generate report
  const handleGenerateReport = async () => {
    setIsGenerating(true);

    try {
      // Execute PowerShell module to fetch data
      const result = await window.electronAPI.executeModule({
        modulePath: `Modules/Reports/CustomReportGenerator.psm1`,
        functionName: 'Invoke-CustomReport',
        parameters: {
          DataSource: reportConfig.dataSource,
          Fields: reportConfig.fields,
          Filters: reportConfig.filters,
          GroupBy: reportConfig.groupBy,
          SortBy: reportConfig.sortBy,
          SortDirection: reportConfig.sortDirection,
        },
      });

      if (result.success && result.data) {
        const data = Array.isArray(result.data) ? result.data : [result.data];
        setReportData(data);
      } else {
        console.error('Report generation failed:', result.error);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export report
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    console.log(`Exporting report as ${format}...`);
    // TODO: Implement export functionality
  };

  // Save as template
  const handleSaveTemplate = async () => {
    console.log('Saving report template...', reportConfig);
    // TODO: Save template to localStorage or backend
  };

  // Column definitions for preview grid
  const columnDefs: ColDef[] = useMemo(() => {
    return reportConfig.fields.map(fieldId => {
      const field = currentFields.find(f => f.id === fieldId);
      return {
        field: fieldId,
        headerName: field?.name || fieldId,
        sortable: true,
        filter: true,
        resizable: true,
      };
    });
  }, [reportConfig.fields, currentFields]);

  return (
    <div className="h-full flex flex-col bg-gray-50" data-cy="custom-report-builder-view">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Custom Report Builder</h1>
            <p className="mt-1 text-sm text-gray-500">Create custom reports with drag-and-drop field selection and filters</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleSaveTemplate} icon={<Save className="w-4 h-4" />}>
              Save Template
            </Button>
            <Button onClick={handleGenerateReport} loading={isGenerating} icon={<Play className="w-4 h-4" />}>
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Panel - Configuration */}
        <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Report Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h2>
              <div className="space-y-4">
                <Input
                  label="Report Name"
                  value={reportConfig.name}
                  onChange={(e) => setReportConfig({ ...reportConfig, name: e.target.value })}
                />
                <Input
                  label="Description"
                  value={reportConfig.description}
                  onChange={(e) => setReportConfig({ ...reportConfig, description: e.target.value })}
                />
                <Select
                  label="Data Source"
                  value={reportConfig.dataSource}
                  onChange={(e) => setReportConfig({ ...reportConfig, dataSource: e.target.value, fields: [], filters: [] })}
                >
                  {dataSources.map(ds => (
                    <option key={ds.value} value={ds.value}>
                      {ds.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Available Fields */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Available Fields</h3>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-64 overflow-y-auto">
                {currentFields.map(field => (
                  <div key={field.id} className="p-2 flex items-center justify-between hover:bg-gray-50">
                    <span className="text-sm text-gray-700">{field.name}</span>
                    <Button size="xs" onClick={() => handleAddField(field.id)} disabled={reportConfig.fields.includes(field.id)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Fields */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Selected Fields ({reportConfig.fields.length})</h3>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                {reportConfig.fields.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No fields selected</div>
                ) : (
                  reportConfig.fields.map((fieldId, index) => {
                    const field = currentFields.find(f => f.id === fieldId);
                    return (
                      <div key={fieldId} className="p-2 flex items-center justify-between hover:bg-gray-50">
                        <span className="text-sm text-gray-700">{field?.name || fieldId}</span>
                        <div className="flex gap-1">
                          <Button size="xs" variant="ghost" onClick={() => handleMoveFieldUp(index)} disabled={index === 0}>
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => handleMoveFieldDown(index)}
                            disabled={index === reportConfig.fields.length - 1}
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                          <Button size="xs" variant="danger" onClick={() => handleRemoveField(fieldId)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Filters */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                <Button size="xs" onClick={handleAddFilter}>
                  <Plus className="w-3 h-3 mr-1" /> Add Filter
                </Button>
              </div>
              <div className="space-y-2">
                {reportConfig.filters.map(filter => {
                  const field = currentFields.find(f => f.id === filter.field);
                  return (
                    <div key={filter.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          label="Field"
                          value={filter.field}
                          onChange={(e) => handleUpdateFilter(filter.id, { field: e.target.value })}
                          size="sm"
                        >
                          {currentFields.map(f => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                        </Select>
                        <Select
                          label="Operator"
                          value={filter.operator}
                          onChange={(e) => handleUpdateFilter(filter.id, { operator: e.target.value as any })}
                          size="sm"
                        >
                          {filterOperators.map(op => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          label="Value"
                          value={filter.value}
                          onChange={(e) => handleUpdateFilter(filter.id, { value: e.target.value })}
                          size="sm"
                        />
                        <Button size="sm" variant="danger" onClick={() => handleRemoveFilter(filter.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grouping & Sorting */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Grouping & Sorting</h3>
              <div className="space-y-3">
                <Select
                  label="Group By"
                  value={reportConfig.groupBy || ''}
                  onChange={(e) => setReportConfig({ ...reportConfig, groupBy: e.target.value || undefined })}
                >
                  <option value="">None</option>
                  {reportConfig.fields.map(fieldId => {
                    const field = currentFields.find(f => f.id === fieldId);
                    return (
                      <option key={fieldId} value={fieldId}>
                        {field?.name || fieldId}
                      </option>
                    );
                  })}
                </Select>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    label="Sort By"
                    value={reportConfig.sortBy || ''}
                    onChange={(e) => setReportConfig({ ...reportConfig, sortBy: e.target.value || undefined })}
                  >
                    <option value="">None</option>
                    {reportConfig.fields.map(fieldId => {
                      const field = currentFields.find(f => f.id === fieldId);
                      return (
                        <option key={fieldId} value={fieldId}>
                          {field?.name || fieldId}
                        </option>
                      );
                    })}
                  </Select>
                  <Select
                    label="Direction"
                    value={reportConfig.sortDirection || 'asc'}
                    onChange={(e) => setReportConfig({ ...reportConfig, sortDirection: e.target.value as any })}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Report Preview ({reportData.length} rows)</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => handleExport('csv')} icon={<Download className="w-4 h-4" />}>
                Export CSV
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleExport('excel')} icon={<Download className="w-4 h-4" />}>
                Export Excel
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleExport('pdf')} icon={<Download className="w-4 h-4" />}>
                Export PDF
              </Button>
            </div>
          </div>
          <div className="flex-1 p-4">
            {reportData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Data</h3>
                  <p className="text-sm text-gray-500">
                    Configure your report and click "Generate Report" to see results
                  </p>
                </div>
              </div>
            ) : (
              <VirtualizedDataGrid
                data={reportData}
                columns={columnDefs}
                loading={isGenerating}
                enableExport
                enableGrouping
                enableFiltering
                data-cy="report-preview-grid"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomReportBuilderView;
