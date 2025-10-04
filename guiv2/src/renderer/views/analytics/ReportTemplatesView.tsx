/**
 * Report Templates View
 * Manage reusable report templates
 */

import React, { useState, useMemo } from 'react';
import { FileText, Copy, Edit2, Trash2, Download, Play } from 'lucide-react';
import Button from '../../components/atoms/Button';
import VirtualizedDataGrid from '../../components/organisms/VirtualizedDataGrid';
import { ColDef } from 'ag-grid-community';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  dataSource: string;
  fields: string[];
  filters: any[];
  createdBy: string;
  createdDate: Date;
  usageCount: number;
}

const ReportTemplatesView: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([
    {
      id: '1',
      name: 'Active Users Summary',
      description: 'List of all active users with key attributes',
      category: 'Users',
      dataSource: 'users',
      fields: ['displayName', 'email', 'department', 'lastLogon'],
      filters: [{ field: 'enabled', operator: 'equals', value: 'true' }],
      createdBy: 'Admin',
      createdDate: new Date('2025-01-15'),
      usageCount: 45,
    },
  ]);

  const columnDefs: ColDef[] = useMemo(
    () => [
      { field: 'name', headerName: 'Template Name', sortable: true, filter: true, flex: 2 },
      { field: 'category', headerName: 'Category', sortable: true, filter: true },
      { field: 'dataSource', headerName: 'Data Source', sortable: true },
      { field: 'usageCount', headerName: 'Times Used', sortable: true },
      {
        field: 'createdDate',
        headerName: 'Created',
        sortable: true,
        valueFormatter: params => new Date(params.value).toLocaleDateString(),
      },
    ],
    []
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report Templates</h1>
            <p className="mt-1 text-sm text-gray-500">Reusable report configurations</p>
          </div>
          <Button icon={<FileText className="w-4 h-4" />}>Create Template</Button>
        </div>
      </div>

      <div className="flex-1 p-6">
        <VirtualizedDataGrid data={templates} columns={columnDefs} enableExport data-cy="templates-grid" />
      </div>
    </div>
  );
};

export default ReportTemplatesView;
