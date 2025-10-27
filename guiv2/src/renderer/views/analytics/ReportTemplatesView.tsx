/**
 * Report Templates View
 * Manage reusable report templates with full CRUD operations
 */

import React, { useState, useMemo, useEffect } from 'react';
import { FileText, Copy, Edit2, Trash2, Download, Play, Plus, Search, Filter, Star } from 'lucide-react';
import { ColDef } from 'ag-grid-community';

import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { useNotificationStore } from '../../store/useNotificationStore';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  dataSource: string;
  fields: string[];
  filters: any[];
  groupBy?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  createdBy: string;
  createdDate: Date;
  modifiedDate?: Date;
  usageCount: number;
  isFavorite?: boolean;
  tags?: string[];
}

const ReportTemplatesView: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { addNotification } = useNotificationStore();

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem('reportTemplates');
      if (stored) {
        const templates = JSON.parse(stored);
        setTemplates(
          templates.map((t: any) => ({
            ...t,
            createdDate: new Date(t.createdDate),
            modifiedDate: t.modifiedDate ? new Date(t.modifiedDate) : undefined,
          }))
        );
      } else {
        // Initialize with sample templates
        const initialTemplates: ReportTemplate[] = [
          {
            id: crypto.randomUUID(),
            name: 'Active Users Summary',
            description: 'List of all active users with key attributes',
            category: 'Users',
            dataSource: 'users',
            fields: ['displayName', 'email', 'department', 'jobTitle', 'lastLogon'],
            filters: [{ field: 'enabled', operator: 'equals', value: 'true' }],
            sortBy: 'displayName',
            sortDirection: 'asc',
            createdBy: 'System',
            createdDate: new Date('2025-01-15'),
            usageCount: 45,
            isFavorite: true,
            tags: ['users', 'active', 'summary'],
          },
          {
            id: crypto.randomUUID(),
            name: 'Migration Status Report',
            description: 'Current status of all migration waves',
            category: 'Migration',
            dataSource: 'migrations',
            fields: ['waveName', 'status', 'startDate', 'completionPercentage', 'userCount'],
            filters: [],
            groupBy: 'status',
            createdBy: 'System',
            createdDate: new Date('2025-01-20'),
            usageCount: 28,
            isFavorite: false,
            tags: ['migration', 'status'],
          },
          {
            id: crypto.randomUUID(),
            name: 'Security Group Membership',
            description: 'Detailed security group membership report',
            category: 'Groups',
            dataSource: 'groups',
            fields: ['name', 'description', 'memberCount', 'groupType', 'scope'],
            filters: [{ field: 'groupType', operator: 'equals', value: 'Security' }],
            createdBy: 'System',
            createdDate: new Date('2025-02-01'),
            usageCount: 32,
            tags: ['groups', 'security'],
          },
          {
            id: crypto.randomUUID(),
            name: 'License Compliance Report',
            description: 'License assignment and compliance overview',
            category: 'Licensing',
            dataSource: 'licenses',
            fields: ['licenseName', 'assignedCount', 'totalCount', 'percentageUsed', 'costPerLicense'],
            filters: [],
            sortBy: 'percentageUsed',
            sortDirection: 'desc',
            createdBy: 'System',
            createdDate: new Date('2025-02-10'),
            usageCount: 19,
            isFavorite: true,
            tags: ['licenses', 'compliance'],
          },
        ];
        setTemplates(initialTemplates);
        saveToStorage(initialTemplates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      addNotification({ type: 'error', message: 'Failed to load report templates', pinned: false, priority: 'normal' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveToStorage = (templates: ReportTemplate[]) => {
    localStorage.setItem('reportTemplates', JSON.stringify(templates));
  };

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesSearch =
        !searchText ||
        t.name.toLowerCase().includes(searchText.toLowerCase()) ||
        t.description.toLowerCase().includes(searchText.toLowerCase()) ||
        t.tags?.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [templates, searchText, categoryFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(templates.map(t => t.category));
    return ['all', ...Array.from(cats).sort()];
  }, [templates]);

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        field: 'isFavorite',
        headerName: '',
        width: 50,
        cellRenderer: (params: any) => {
          return params.value ? '<span class="text-yellow-500">★</span>' : '<span class="text-gray-300">☆</span>';
        },
      },
      { field: 'name', headerName: 'Template Name', sortable: true, filter: true, flex: 2 },
      { field: 'description', headerName: 'Description', sortable: true, filter: true, flex: 2 },
      { field: 'category', headerName: 'Category', sortable: true, filter: true, width: 120 },
      { field: 'dataSource', headerName: 'Data Source', sortable: true, width: 120 },
      { field: 'usageCount', headerName: 'Times Used', sortable: true, width: 120 },
      {
        field: 'createdDate',
        headerName: 'Created',
        sortable: true,
        valueFormatter: params => new Date(params.value).toLocaleDateString(),
        width: 120,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 220,
        cellRenderer: (params: any) => {
          const template = params.data;
          return `<div class="flex gap-1" data-template-id="${template.id}">
            <button class="action-btn use p-1 hover:bg-blue-100 rounded text-blue-600" title="Use Template">▶</button>
            <button class="action-btn duplicate p-1 hover:bg-gray-100 rounded" title="Duplicate">📋</button>
            <button class="action-btn download p-1 hover:bg-gray-100 rounded" title="Download">⬇</button>
            <button class="action-btn edit p-1 hover:bg-gray-100 rounded" title="Edit">✏</button>
            <button class="action-btn favorite p-1 hover:bg-yellow-100 rounded" title="Toggle Favorite">${template.isFavorite ? '★' : '☆'}</button>
            <button class="action-btn delete p-1 hover:bg-red-100 rounded text-red-600" title="Delete">🗑</button>
          </div>`;
        },
      },
    ],
    []
  );

  const handleCreate = () => {
    setSelectedTemplate({
      id: crypto.randomUUID(),
      name: '',
      description: '',
      category: 'Users',
      dataSource: 'users',
      fields: [],
      filters: [],
      createdBy: 'Current User',
      createdDate: new Date(),
      usageCount: 0,
      tags: [],
    });
    setShowEditor(true);
  };

  const handleEdit = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      setSelectedTemplate(template);
      setShowEditor(true);
    }
  };

  const handleDuplicate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      const duplicate: ReportTemplate = {
        ...template,
        id: crypto.randomUUID(),
        name: `${template.name} (Copy)`,
        createdDate: new Date(),
        usageCount: 0,
      };
      setTemplates([...templates, duplicate]);
      saveToStorage([...templates, duplicate]);
      addNotification({ type: 'success', message: 'Template duplicated successfully', pinned: false, priority: 'normal' });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      const updated = templates.filter(t => t.id !== id);
      setTemplates(updated);
      saveToStorage(updated);
      addNotification({ type: 'success', message: 'Template deleted', pinned: false, priority: 'normal' });
    }
  };

  const handleToggleFavorite = (id: string) => {
    const updated = templates.map(t => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
    setTemplates(updated);
    saveToStorage(updated);
  };

  const handleUse = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      // Increment usage count
      const updated = templates.map(t => (t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t));
      setTemplates(updated);
      saveToStorage(updated);

      // Navigate to report builder with template
      addNotification({ type: 'success', message: `Loading template: ${template.name}`, pinned: false, priority: 'normal' });
      // TODO: Navigate to CustomReportBuilderView with template data
    }
  };

  const handleDownload = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      const dataStr = JSON.stringify(template, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.name.replace(/\s+/g, '_')}_template.json`;
      link.click();
      URL.revokeObjectURL(url);
      addNotification({ type: 'success', message: 'Template exported', pinned: false, priority: 'normal' });
    }
  };

  const handleSave = (template: ReportTemplate) => {
    const exists = templates.find(t => t.id === template.id);
    if (exists) {
      const updated = templates.map(t => (t.id === template.id ? { ...template, modifiedDate: new Date() } : t));
      setTemplates(updated);
      saveToStorage(updated);
      addNotification({ type: 'success', message: 'Template updated', pinned: false, priority: 'normal' });
    } else {
      setTemplates([...templates, template]);
      saveToStorage([...templates, template]);
      addNotification({ type: 'success', message: 'Template created', pinned: false, priority: 'normal' });
    }
    setShowEditor(false);
    setSelectedTemplate(null);
  };

  // Handle grid cell clicks
  const onCellClicked = (event: any) => {
    const target = event.event?.target;
    if (!target) return;

    const templateId = target.closest('[data-template-id]')?.dataset.templateId;
    if (!templateId) return;

    if (target.closest('.use')) {
      handleUse(templateId);
    } else if (target.closest('.duplicate')) {
      handleDuplicate(templateId);
    } else if (target.closest('.download')) {
      handleDownload(templateId);
    } else if (target.closest('.edit')) {
      handleEdit(templateId);
    } else if (target.closest('.favorite')) {
      handleToggleFavorite(templateId);
    } else if (target.closest('.delete')) {
      handleDelete(templateId);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50" data-cy="report-templates-view" data-testid="report-templates-view">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report Templates</h1>
            <p className="mt-1 text-sm text-gray-500">Reusable report configurations for quick report generation</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={loadTemplates}>
              Refresh
            </Button>
            <Button onClick={handleCreate} icon={<Plus className="w-4 h-4" />}>
              Create Template
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="w-64">
            <Select label="" value={categoryFilter} onChange={value => setCategoryFilter(value)} options={categories.map(cat => ({ value: cat, label: cat === 'all' ? 'All Categories' : cat }))} />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="grid grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Templates</p>
            <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Favorites</p>
            <p className="text-2xl font-bold text-yellow-600">{templates.filter(t => t.isFavorite).length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-2xl font-bold text-blue-600">{categories.length - 1}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Usage</p>
            <p className="text-2xl font-bold text-green-600">{templates.reduce((sum, t) => sum + t.usageCount, 0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Filtered</p>
            <p className="text-2xl font-bold text-gray-900">{filteredTemplates.length}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 p-6">
        <VirtualizedDataGrid
          data={filteredTemplates}
          columns={columnDefs}
          loading={isLoading}
        />
      </div>

      {/* Editor Modal */}
      {showEditor && selectedTemplate && (
        <TemplateEditor
          template={selectedTemplate}
          onSave={handleSave}
          onCancel={() => {
            setShowEditor(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};

// Template Editor Component
interface TemplateEditorProps {
  template: ReportTemplate;
  onSave: (template: ReportTemplate) => void;
  onCancel: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ReportTemplate>(template);

  const categories = ['Users', 'Groups', 'Computers', 'Migrations', 'Licensing', 'Security', 'Compliance'];
  const dataSources = ['users', 'groups', 'computers', 'migrations', 'licenses', 'servers', 'applications'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-cy="template-editor-modal" data-testid="template-editor-modal">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">{template.name ? 'Edit' : 'Create'} Report Template</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input label="Template Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={formData.category} onChange={value => setFormData({ ...formData, category: value })} required options={categories.map(cat => ({ value: cat, label: cat }))} />

            <Select
              label="Data Source"
              value={formData.dataSource}
              onChange={value => setFormData({ ...formData, dataSource: value })}
              required
              options={dataSources.map(ds => ({ value: ds, label: ds.charAt(0).toUpperCase() + ds.slice(1) }))}
            />
          </div>

          <Input
            label="Tags (comma-separated)"
            value={formData.tags?.join(', ') || ''}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
            placeholder="users, active, summary"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFavorite"
              checked={formData.isFavorite || false}
              onChange={e => setFormData({ ...formData, isFavorite: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="isFavorite" className="text-sm text-gray-700">
              Mark as Favorite
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Template</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportTemplatesView;
