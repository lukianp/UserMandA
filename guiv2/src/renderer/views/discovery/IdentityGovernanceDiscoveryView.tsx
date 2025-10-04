import React, { useState } from 'react';
import { UserCheck } from 'lucide-react';
import { useIdentityGovernanceDiscoveryLogic } from '../../hooks/useIdentityGovernanceDiscoveryLogic';
import VirtualizedDataGrid from '../../components/organisms/VirtualizedDataGrid';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';

const IdentityGovernanceDiscoveryView: React.FC = () => {
  const { config, setConfig, result, isDiscovering, progress, filter, setFilter, startDiscovery, cancelDiscovery, columns, filteredData, stats } = useIdentityGovernanceDiscoveryLogic();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="identity-governance-discovery-view">
      {isDiscovering && <LoadingOverlay progress={progress} onCancel={cancelDiscovery} message="Discovering resources..." />}
      
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <UserCheck className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Identity Governance</h1>
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
          <div className="p-4 bg-purple-600/10 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.totalFound || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Found</div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col p-6">
        <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
          <button onClick={() => setActiveTab(0)} className={`px-4 py-2 ${activeTab === 0 ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`} data-cy="tab-overview">Overview</button>
          <button onClick={() => setActiveTab(1)} className={`px-4 py-2 ${activeTab === 1 ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`} data-cy="tab-access-reviews">Access Reviews</button>
          <button onClick={() => setActiveTab(2)} className={`px-4 py-2 ${activeTab === 2 ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`} data-cy="tab-entitlements">Entitlements</button>
          <button onClick={() => setActiveTab(3)} className={`px-4 py-2 ${activeTab === 3 ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`} data-cy="tab-pim">PIM</button>
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

export default IdentityGovernanceDiscoveryView;
