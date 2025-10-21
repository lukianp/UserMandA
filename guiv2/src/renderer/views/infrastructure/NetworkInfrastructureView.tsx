import React, { useRef, useEffect } from 'react';
import { useNetworkInfrastructureLogic } from '../../hooks/useNetworkInfrastructureLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { RefreshCw, Download, Network, Activity } from 'lucide-react';

/**
 * Network Infrastructure View Component
 * Displays network topology and device inventory
 */
const NetworkInfrastructureView: React.FC = () => {
  const {
    devices,
    topology,
    statistics,
    isLoading,
    error,
    searchText,
    setSearchText,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    refreshData,
    exportDevices,
  } = useNetworkInfrastructureLogic();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw network topology
  useEffect(() => {
    if (!canvasRef.current || topology.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 2;
    topology.forEach(node => {
      node.connections.forEach(targetId => {
        const target = topology.find(n => n.id === targetId);
        if (target) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      });
    });

    // Draw nodes
    topology.forEach(node => {
      const colors: Record<string, string> = {
        Router: '#3B82F6',
        Switch: '#10B981',
        Firewall: '#EF4444',
        'Wireless AP': '#F59E0B',
      };

      ctx.fillStyle = colors[node.type] || '#6B7280';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
      ctx.fill();

      // Draw label
      ctx.fillStyle = '#1F2937';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + 40);
    });
  }, [topology]);

  const columnDefs = [
    {
      accessorKey: 'name',
      header: 'Device Name',
      size: 200,
      cell: (info: any) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {info.getValue()}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      size: 140,
      cell: (info: any) => {
        const typeColors: Record<string, string> = {
          'Router': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
          'Switch': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          'Firewall': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
          'Load Balancer': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
          'Wireless AP': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        };
        const colorClass = typeColors[info.getValue()] || 'bg-gray-100 text-gray-800';
        return (
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${colorClass}`}>
            {info.getValue()}
          </span>
        );
      },
    },
    {
      accessorKey: 'manufacturer',
      header: 'Manufacturer',
      size: 140,
    },
    {
      accessorKey: 'model',
      header: 'Model',
      size: 160,
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP Address',
      size: 140,
      cell: (info: any) => (
        <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
          {info.getValue() || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      size: 180,
    },
    {
      accessorKey: 'ports',
      header: 'Ports',
      size: 100,
      cell: (info: any) => {
        const row = info.row.original;
        const utilization = row.ports > 0 ? ((row.portsInUse / row.ports) * 100).toFixed(0) : '0';
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {row.portsInUse || 0}/{row.ports || 0} ({utilization}%)
          </span>
        );
      },
    },
    {
      accessorKey: 'utilization',
      header: 'Utilization',
      size: 140,
      cell: (info: any) => {
        const value = info.getValue() as number;
        const colorClass = value > 80 ? 'text-red-600' : value > 60 ? 'text-yellow-600' : 'text-green-600';
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${value > 80 ? 'bg-red-500' : value > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${value}%` }}
              />
            </div>
            <span className={`text-sm font-medium ${colorClass}`}>{value}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'uptime',
      header: 'Uptime',
      size: 120,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 120,
      cell: (info: any) => {
        const statusColors: Record<string, string> = {
          Online: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          Offline: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
          Warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
          Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        const colorClass = statusColors[info.getValue()] || 'bg-gray-100 text-gray-800';
        return (
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${colorClass}`}>
            {info.getValue()}
          </span>
        );
      },
    },
  ];

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Network Infrastructure
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Network topology visualization and device inventory
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Network className="text-blue-600" size={20} />
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {statistics.totalDevices}
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Devices</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {statistics.onlineDevices}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Online</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="text-orange-600" size={20} />
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {statistics.(typeof avgUtilization === 'number' ? avgUtilization : 0).toFixed(0)}%
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Utilization</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {statistics.totalPorts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Ports</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {statistics.portsInUse}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Ports In Use</div>
          </div>
        </div>
      )}

      {/* Network Topology */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Network Topology</h2>
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
        />
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-4 flex-1">
          <input
            type="text"
            placeholder="Search devices..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="All">All Types</option>
            <option value="Router">Router</option>
            <option value="Switch">Switch</option>
            <option value="Firewall">Firewall</option>
            <option value="Load Balancer">Load Balancer</option>
            <option value="Wireless AP">Wireless AP</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="All">All Statuses</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={refreshData} variant="secondary" icon={<RefreshCw size={18} />}>
            Refresh
          </Button>
          <Button onClick={exportDevices} variant="secondary" icon={<Download size={18} />}>
            Export
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Data Grid */}
      <div className="flex-1">
        <VirtualizedDataGrid
          data={devices}
          columns={columnDefs as any}
          loading={isLoading}
          height="calc(100vh - 800px)"
        />
      </div>
    </div>
  );
};

export default NetworkInfrastructureView;
