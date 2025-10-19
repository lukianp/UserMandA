
/**
 * Reports View
 * Report templates and generation
 */

import React from 'react';
import { useReportsLogic } from '../../hooks/useReportsLogic';
import SearchBar from '../../components/molecules/SearchBar';
import { Button } from '../../components/atoms/Button';
import { Select } from '../../components/atoms/Select';
import Badge from '../../components/atoms/Badge';
import { FileText, Download, Loader2 } from 'lucide-react';

const ReportsView: React.FC = () => {
  const {
    templates,
    generatingReports,
    searchText,
    setSearchText,
    filterCategory,
    setFilterCategory,
    generateReport,
  } = useReportsLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="reports-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reports
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate reports from discovery and migration data
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchText}
              onChange={setSearchText}
              placeholder="Search report templates..."
              data-cy="reports-search"
            />
          </div>
          <div className="w-48">
            <Select
              value={filterCategory}
              onChange={setFilterCategory}
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'Users', label: 'Users' },
                { value: 'Groups', label: 'Groups' },
                { value: 'Migration', label: 'Migration' },
                { value: 'Licensing', label: 'Licensing' },
              ]}
              data-cy="category-filter"
            />
          </div>
        </div>
      </div>

      {/* Report Templates Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates?.map((template) => {
              const isGenerating = generatingReports.has(template.id);

              return (
                <div
                  key={template.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  data-cy={`report-card-${template.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <Badge variant="default">{template.format}</Badge>
                    </div>
                    <Badge>{template.category}</Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {template.name}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {template.description}
                  </p>

                  <Button
                    variant="primary"
                    onClick={() => generateReport(template.id)}
                    disabled={isGenerating}
                    loading={isGenerating}
                    icon={isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    className="w-full"
                    data-cy={`generate-btn-${template.id}`}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Report'}
                  </Button>
                </div>
              );
            })}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No report templates found
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
