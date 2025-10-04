import React, { useState } from 'react';
import { Box } from 'lucide-react';
import { useHyperVDiscoveryLogic } from '../../hooks/useHyperVDiscoveryLogic';
import VirtualizedDataGrid from '../../components/organisms/VirtualizedDataGrid';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';

const HyperVDiscoveryView: React.FC = () => {
  const { config, setConfig, result, isDiscovering, progress, filter, setFilter, startDiscovery, cancelDiscovery, columns, filteredData, stats } = useHyperVDiscoveryLogic();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="hyper-v-discovery-view">
      {isDiscovering && <LoadingOverlay progress={progress} onCancel={cancelDiscovery} message="Discovering resources..." />}
      
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Box className="w-8 h-8 text-slate-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hyper V</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Discover and analyze resources</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary" data-cy="start-discovery-btn">
            {isDiscovering ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4 p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="p-4 bg-slate-600/10 rounded-lg">
            <div className="text-2xl font-bold text-slate-600">{stats.totalFound || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Found</div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col p-6">
        <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
          <button onClick={() => setActiveTab(0)} className={`px-4 py-2 ${activeTab === 0 ? 'border-b-2 border-slate-600 text-slate-600' : 'text-gray-600'}`} data-cy="tab-overview">Overview</button>
          <button onClick={() => setActiveTab(1)} className={`px-4 py-2 ${activeTab === 1 ? 'border-b-2 border-slate-600 text-slate-600' : 'text-gray-600'}`} data-cy="tab-hosts">Hosts</button>
          <button onClick={() => setActiveTab(2)} className={`px-4 py-2 ${activeTab === 2 ? 'border-b-2 border-slate-600 text-slate-600' : 'text-gray-600'}`} data-cy="tab-vms">VMs</button>
          <button onClick={() => setActiveTab(3)} className={`px-4 py-2 ${activeTab === 3 ? 'border-b-2 border-slate-600 text-slate-600' : 'text-gray-600'}`} data-cy="tab-virtual-switches">Virtual Switches</button>
        </div>

        <div className="mb-4">
          <Input
            value={filter.searchText}
            onChange={(e) => setFilter({ ...filter, searchText: e.target.value })}
            placeholder="Search..."
            data-cy="search-input"
          />
        </div>

        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow">
          <VirtualizedDataGrid
            data={filteredData}
            columns={columns}
            loading={isDiscovering}
            enableExport
            data-cy="discovery-grid"
          />
        </div>
      </div>
    </div>
  );
};

export default HyperVDiscoveryView;
