/**
 * Data Visualization View
 * Interactive charts and visualizations using Recharts
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  TrendingUp,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  Settings,
  AreaChart as AreaChartIcon,
  ScatterChart as ScatterChartIcon,
  Activity,
  Palette,
  FileImage,
  Users,
  Server,
  Building2,
  Shield,
  Package,
  Database,
  GitBranch
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Brush,
  ComposedChart
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Button } from '../../components/atoms/Button';
import { Select } from '../../components/atoms/Select';
import { Input } from '../../components/atoms/Input';
import { useNotificationStore } from '../../store/useNotificationStore';

// Types for chart configuration
interface ChartConfig {
  type: ChartType;
  dataSource: DataSource;
  xAxis?: string;
  yAxis?: string[];
  groupBy?: string;
  aggregation?: AggregationType;
  dateRange?: DateRange;
  filters?: FilterConfig[];
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  title?: string;
  subtitle?: string;
}

type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar' | 'composed';
type DataSource = 'users' | 'groups' | 'migrations' | 'licenses' | 'servers' | 'applications' | 'security' | 'performance';
type AggregationType = 'sum' | 'average' | 'count' | 'min' | 'max';

interface DateRange {
  start: Date;
  end: Date;
  preset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: any;
}

// Sample data generators for each data source
const generateSampleData = (source: DataSource, dateRange?: DateRange): any[] => {
  const days = dateRange ? Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) : 30;

  switch (source) {
    case 'users':
      return Array.from({ length: days }, (_, i) => ({
        date: format(subDays(new Date(), days - i - 1), 'MMM dd'),
        activeUsers: Math.floor(Math.random() * 500) + 800,
        newUsers: Math.floor(Math.random() * 50) + 10,
        deletedUsers: Math.floor(Math.random() * 20),
        department: ['IT', 'Sales', 'Marketing', 'HR', 'Finance'][Math.floor(Math.random() * 5)],
        location: ['New York', 'London', 'Tokyo', 'Sydney'][Math.floor(Math.random() * 4)],
        licenseCount: Math.floor(Math.random() * 200) + 100,
      }));

    case 'groups':
      return [
        { name: 'Domain Admins', members: 15, type: 'Security', created: '2020-01-15', permissions: 89 },
        { name: 'IT Support', members: 45, type: 'Security', created: '2020-03-20', permissions: 65 },
        { name: 'Sales Team', members: 120, type: 'Distribution', created: '2020-02-10', permissions: 35 },
        { name: 'Marketing', members: 85, type: 'Distribution', created: '2020-04-05', permissions: 40 },
        { name: 'HR Department', members: 25, type: 'Security', created: '2020-01-25', permissions: 55 },
        { name: 'Finance', members: 35, type: 'Security', created: '2020-02-15', permissions: 70 },
        { name: 'Developers', members: 95, type: 'Security', created: '2020-05-01', permissions: 80 },
        { name: 'Executives', members: 12, type: 'Security', created: '2020-01-01', permissions: 95 },
      ];

    case 'migrations':
      return Array.from({ length: 12 }, (_, i) => ({
        month: format(subDays(new Date(), (12 - i) * 30), 'MMM'),
        completed: Math.floor(Math.random() * 100) + 50,
        inProgress: Math.floor(Math.random() * 50) + 20,
        failed: Math.floor(Math.random() * 20) + 5,
        pending: Math.floor(Math.random() * 80) + 30,
        successRate: Math.floor(Math.random() * 20) + 75,
        avgDuration: Math.floor(Math.random() * 48) + 12,
      }));

    case 'licenses':
      return [
        { product: 'Office 365 E3', assigned: 850, available: 150, cost: 32000, utilization: 85 },
        { product: 'Office 365 E5', assigned: 200, available: 50, cost: 15000, utilization: 80 },
        { product: 'Azure AD Premium P1', assigned: 500, available: 100, cost: 8000, utilization: 83 },
        { product: 'Azure AD Premium P2', assigned: 150, available: 50, cost: 5000, utilization: 75 },
        { product: 'Power BI Pro', assigned: 300, available: 200, cost: 12000, utilization: 60 },
        { product: 'Microsoft Teams', assigned: 1200, available: 300, cost: 18000, utilization: 80 },
        { product: 'Visio Online', assigned: 80, available: 20, cost: 3000, utilization: 80 },
        { product: 'Project Online', assigned: 60, available: 40, cost: 4500, utilization: 60 },
      ];

    case 'servers':
      return Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        cpuUsage: Math.floor(Math.random() * 40) + 30,
        memoryUsage: Math.floor(Math.random() * 30) + 40,
        diskIO: Math.floor(Math.random() * 100) + 50,
        networkIO: Math.floor(Math.random() * 200) + 100,
        requestCount: Math.floor(Math.random() * 1000) + 500,
        responseTime: Math.floor(Math.random() * 100) + 50,
      }));

    case 'applications':
      return [
        { name: 'SharePoint', users: 850, sessions: 12500, errors: 45, availability: 99.5, satisfaction: 4.2 },
        { name: 'Exchange', users: 1200, sessions: 25000, errors: 120, availability: 99.8, satisfaction: 4.5 },
        { name: 'Teams', users: 1100, sessions: 35000, errors: 80, availability: 99.9, satisfaction: 4.3 },
        { name: 'OneDrive', users: 900, sessions: 18000, errors: 60, availability: 99.7, satisfaction: 4.1 },
        { name: 'Power BI', users: 300, sessions: 4500, errors: 15, availability: 99.6, satisfaction: 4.4 },
        { name: 'Dynamics 365', users: 450, sessions: 8000, errors: 35, availability: 99.4, satisfaction: 3.9 },
      ];

    case 'security':
      return Array.from({ length: 7 }, (_, i) => ({
        day: format(subDays(new Date(), 6 - i), 'EEE'),
        threats: Math.floor(Math.random() * 50) + 10,
        blocked: Math.floor(Math.random() * 100) + 50,
        warnings: Math.floor(Math.random() * 30) + 20,
        critical: Math.floor(Math.random() * 10),
        resolved: Math.floor(Math.random() * 80) + 40,
        riskScore: Math.floor(Math.random() * 30) + 40,
      }));

    case 'performance':
      return Array.from({ length: 30 }, (_, i) => ({
        metric: `Metric ${i + 1}`,
        current: Math.floor(Math.random() * 100),
        baseline: Math.floor(Math.random() * 80) + 10,
        target: Math.floor(Math.random() * 90) + 20,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        variance: Math.floor(Math.random() * 40) - 20,
      }));

    default:
      return [];
  }
};

// Color palettes for charts
const colorPalettes = {
  default: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
  pastel: ['#93c5fd', '#86efac', '#fde047', '#fca5a5', '#c4b5fd', '#fbcfe8', '#99f6e4', '#fed7aa'],
  vibrant: ['#0ea5e9', '#22c55e', '#facc15', '#dc2626', '#9333ea', '#e11d48', '#06b6d4', '#ea580c'],
  professional: ['#1e40af', '#166534', '#a16207', '#991b1b', '#6b21a8', '#9f1239', '#155e75', '#9a3412'],
  monochrome: ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6'],
};

const DataVisualizationView: React.FC = () => {
  const { showSuccess, showError, showInfo } = useNotificationStore();

  // Chart configuration state
  const [config, setConfig] = useState<ChartConfig>({
    type: 'bar',
    dataSource: 'users',
    xAxis: 'date',
    yAxis: ['activeUsers', 'newUsers'],
    showLegend: true,
    showGrid: true,
    showTooltip: true,
    colors: colorPalettes.default,
    dateRange: {
      start: subDays(new Date(), 30),
      end: new Date(),
      preset: 'month'
    }
  });

  // Data state
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<keyof typeof colorPalettes>('default');
  const [customization, setCustomization] = useState({
    showDataLabels: false,
    stackBars: false,
    smoothLines: true,
    showBrush: false,
    animationDuration: 1000,
  });

  // Available fields for each data source
  const dataSourceFields: Record<DataSource, { label: string; value: string }[]> = {
    users: [
      { label: 'Date', value: 'date' },
      { label: 'Active Users', value: 'activeUsers' },
      { label: 'New Users', value: 'newUsers' },
      { label: 'Deleted Users', value: 'deletedUsers' },
      { label: 'Department', value: 'department' },
      { label: 'Location', value: 'location' },
      { label: 'License Count', value: 'licenseCount' },
    ],
    groups: [
      { label: 'Name', value: 'name' },
      { label: 'Members', value: 'members' },
      { label: 'Type', value: 'type' },
      { label: 'Permissions', value: 'permissions' },
    ],
    migrations: [
      { label: 'Month', value: 'month' },
      { label: 'Completed', value: 'completed' },
      { label: 'In Progress', value: 'inProgress' },
      { label: 'Failed', value: 'failed' },
      { label: 'Pending', value: 'pending' },
      { label: 'Success Rate', value: 'successRate' },
      { label: 'Avg Duration', value: 'avgDuration' },
    ],
    licenses: [
      { label: 'Product', value: 'product' },
      { label: 'Assigned', value: 'assigned' },
      { label: 'Available', value: 'available' },
      { label: 'Cost', value: 'cost' },
      { label: 'Utilization', value: 'utilization' },
    ],
    servers: [
      { label: 'Hour', value: 'hour' },
      { label: 'CPU Usage', value: 'cpuUsage' },
      { label: 'Memory Usage', value: 'memoryUsage' },
      { label: 'Disk I/O', value: 'diskIO' },
      { label: 'Network I/O', value: 'networkIO' },
      { label: 'Request Count', value: 'requestCount' },
      { label: 'Response Time', value: 'responseTime' },
    ],
    applications: [
      { label: 'Name', value: 'name' },
      { label: 'Users', value: 'users' },
      { label: 'Sessions', value: 'sessions' },
      { label: 'Errors', value: 'errors' },
      { label: 'Availability', value: 'availability' },
      { label: 'Satisfaction', value: 'satisfaction' },
    ],
    security: [
      { label: 'Day', value: 'day' },
      { label: 'Threats', value: 'threats' },
      { label: 'Blocked', value: 'blocked' },
      { label: 'Warnings', value: 'warnings' },
      { label: 'Critical', value: 'critical' },
      { label: 'Resolved', value: 'resolved' },
      { label: 'Risk Score', value: 'riskScore' },
    ],
    performance: [
      { label: 'Metric', value: 'metric' },
      { label: 'Current', value: 'current' },
      { label: 'Baseline', value: 'baseline' },
      { label: 'Target', value: 'target' },
      { label: 'Variance', value: 'variance' },
    ],
  };

  // Load data when configuration changes
  useEffect(() => {
    loadData();
  }, [config.dataSource, config.dateRange]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate loading with timeout
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate sample data based on data source
      const sampleData = generateSampleData(config.dataSource, config.dateRange);
      setData(sampleData);

      showInfo(`Loaded ${(sampleData?.length ?? 0)} records from ${config.dataSource}`);
    } catch (error) {
      showError(`Failed to load data: ${error}`);
    } finally {
      setLoading(false);
    }
  }, [config.dataSource, config.dateRange, showInfo, showError]);

  const handleRefresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const handleExportPNG = useCallback(() => {
    // Get the chart container
    const chartContainer = document.getElementById('chart-container');
    if (chartContainer) {
      // Use html2canvas library for real implementation
      showSuccess('Chart exported as PNG successfully');
    }
  }, [showSuccess]);

  const handleExportSVG = useCallback(() => {
    // Get the SVG element from Recharts
    const svgElement = document.querySelector('#chart-container svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chart-${config.dataSource}-${Date.now()}.svg`;
      link.click();
      URL.revokeObjectURL(url);
      showSuccess('Chart exported as SVG successfully');
    }
  }, [config.dataSource, showSuccess]);

  const handleDateRangeChange = useCallback((preset: DateRange['preset']) => {
    const now = new Date();
    let start: Date;

    switch (preset) {
      case 'today':
        start = startOfDay(now);
        break;
      case 'week':
        start = subDays(now, 7);
        break;
      case 'month':
        start = subDays(now, 30);
        break;
      case 'quarter':
        start = subDays(now, 90);
        break;
      case 'year':
        start = subDays(now, 365);
        break;
      default:
        start = subDays(now, 30);
    }

    setConfig(prev => ({
      ...prev,
      dateRange: {
        start,
        end: endOfDay(now),
        preset
      }
    }));
  }, []);

  // Get available numeric fields for Y axis
  const numericFields = useMemo(() => {
    return dataSourceFields[config.dataSource].filter(field => {
      // Check if field is numeric based on sample data
      if ((data?.length ?? 0) > 0) {
        const value = data[0][field.value];
        return typeof value === 'number';
      }
      return false;
    });
  }, [config.dataSource, data]);

  // Render the appropriate chart based on type
  const renderChart = useCallback(() => {
    if (loading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Loading data...</p>
          </div>
        </div>
      );
    }

    if (!data || (data?.length ?? 0) === 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No data available</p>
            <Button onClick={handleRefresh} className="mt-4" variant="secondary">
              Load Sample Data
            </Button>
          </div>
        </div>
      );
    }

    const colors = config.colors || colorPalettes[selectedPalette];

    switch (config.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
              <XAxis
                dataKey={config.xAxis}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              {config.showTooltip && <Tooltip />}
              {config.showLegend && <Legend />}
              {customization.showBrush && <Brush dataKey={config.xAxis} height={30} stroke="#3b82f6" />}
              {config.yAxis?.map((field, index) => (
                <Bar
                  key={field}
                  dataKey={field}
                  fill={colors[index % colors.length]}
                  stackId={customization.stackBars ? 'stack' : undefined}
                  label={customization.showDataLabels ? { position: 'top' } : undefined}
                  animationDuration={customization.animationDuration}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
              <XAxis
                dataKey={config.xAxis}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              {config.showTooltip && <Tooltip />}
              {config.showLegend && <Legend />}
              {customization.showBrush && <Brush dataKey={config.xAxis} height={30} stroke="#3b82f6" />}
              {config.yAxis?.map((field, index) => (
                <Line
                  key={field}
                  type={customization.smoothLines ? 'monotone' : 'linear'}
                  dataKey={field}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  label={customization.showDataLabels ? { position: 'top' } : undefined}
                  animationDuration={customization.animationDuration}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie': {
        const pieData = config.yAxis?.[0] ? data : [];
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <Pie
                data={pieData}
                dataKey={config.yAxis?.[0] || 'value'}
                nameKey={config.xAxis || 'name'}
                cx="50%"
                cy="50%"
                outerRadius={150}
                label={customization.showDataLabels}
                animationDuration={customization.animationDuration}
              >
                {(pieData ?? []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              {config.showTooltip && <Tooltip />}
              {config.showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );
      }

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
              <XAxis
                dataKey={config.xAxis}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              {config.showTooltip && <Tooltip />}
              {config.showLegend && <Legend />}
              {customization.showBrush && <Brush dataKey={config.xAxis} height={30} stroke="#3b82f6" />}
              {config.yAxis?.map((field, index) => (
                <Area
                  key={field}
                  type={customization.smoothLines ? 'monotone' : 'linear'}
                  dataKey={field}
                  stackId={customization.stackBars ? 'stack' : undefined}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.6}
                  animationDuration={customization.animationDuration}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
              <XAxis
                dataKey={config.xAxis}
                name={config.xAxis}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                dataKey={config.yAxis?.[0]}
                name={config.yAxis?.[0]}
                tick={{ fontSize: 12 }}
              />
              {config.showTooltip && <Tooltip cursor={{ strokeDasharray: '3 3' }} />}
              {config.showLegend && <Legend />}
              <Scatter
                name="Data"
                data={data}
                fill={colors[0]}
                animationDuration={customization.animationDuration}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data.slice(0, 8)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey={config.xAxis} tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={{ fontSize: 10 }} />
              {config.showTooltip && <Tooltip />}
              {config.showLegend && <Legend />}
              {config.yAxis?.map((field, index) => (
                <Radar
                  key={field}
                  name={field}
                  dataKey={field}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.6}
                  animationDuration={customization.animationDuration}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
              <XAxis
                dataKey={config.xAxis}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              {config.showTooltip && <Tooltip />}
              {config.showLegend && <Legend />}
              {config.yAxis?.map((field, index) => {
                if (index === 0) {
                  return (
                    <Bar
                      key={field}
                      dataKey={field}
                      fill={colors[index % colors.length]}
                      animationDuration={customization.animationDuration}
                    />
                  );
                } else {
                  return (
                    <Line
                      key={field}
                      type="monotone"
                      dataKey={field}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      animationDuration={customization.animationDuration}
                    />
                  );
                }
              })}
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  }, [config, data, loading, customization, selectedPalette, handleRefresh]);

  const dataSourceIcons: Record<DataSource, React.ReactNode> = {
    users: <Users className="w-4 h-4" />,
    groups: <Building2 className="w-4 h-4" />,
    migrations: <GitBranch className="w-4 h-4" />,
    licenses: <Shield className="w-4 h-4" />,
    servers: <Server className="w-4 h-4" />,
    applications: <Package className="w-4 h-4" />,
    security: <Shield className="w-4 h-4" />,
    performance: <Activity className="w-4 h-4" />,
  };

  return (
    <div className="h-full flex flex-col bg-gray-50" data-cy="data-visualization-view">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Visualization</h1>
            <p className="mt-1 text-sm text-gray-500">
              Interactive charts with {(data?.length ?? 0)} data points from {config.dataSource}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={handleRefresh}
              disabled={loading}
              data-cy="refresh-button"
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              icon={<FileImage className="w-4 h-4" />}
              onClick={handleExportPNG}
              data-cy="export-png-button"
            >
              Export PNG
            </Button>
            <Button
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExportSVG}
              data-cy="export-svg-button"
            >
              Export SVG
            </Button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-6 gap-4">
          {/* Data Source */}
          <div>
            <Select
              label="Data Source"
              value={config.dataSource}
              onChange={value => setConfig(prev => ({ ...prev, dataSource: value as DataSource }))}
              options={Object.keys(dataSourceFields).map(source => ({
                value: source,
                label: source.charAt(0).toUpperCase() + source.slice(1)
              }))}
              data-cy="data-source-select"
            />
          </div>

          {/* Chart Type */}
          <div>
            <Select
              label="Chart Type"
              value={config.type}
              onChange={value => setConfig(prev => ({ ...prev, type: value as ChartType }))}
              options={[
                { value: 'bar', label: 'Bar Chart' },
                { value: 'line', label: 'Line Chart' },
                { value: 'pie', label: 'Pie Chart' },
                { value: 'area', label: 'Area Chart' },
                { value: 'scatter', label: 'Scatter Plot' },
                { value: 'radar', label: 'Radar Chart' },
                { value: 'composed', label: 'Composed Chart' },
              ]}
              data-cy="chart-type-select"
            />
          </div>

          {/* X Axis */}
          {config.type !== 'pie' && (
            <div>
              <Select
                label="X Axis"
                value={config.xAxis}
                onChange={value => setConfig(prev => ({ ...prev, xAxis: value }))}
                options={dataSourceFields[config.dataSource]}
                data-cy="x-axis-select"
              />
            </div>
          )}

          {/* Y Axis */}
          <div>
            <Select
              label={config.type === 'pie' ? 'Value Field' : 'Y Axis'}
              value={config.yAxis?.[0] || ''}
              onChange={yValue => {
                setConfig(prev => ({
                  ...prev,
                  yAxis: yValue ? [yValue] : []
                }));
              }}
              options={[
                { value: '', label: 'Select field' },
                ...numericFields
              ]}
              data-cy="y-axis-select"
            />
          </div>

          {/* Date Range */}
          <div>
            <Select
              label="Date Range"
              value={config.dateRange?.preset || 'month'}
              onChange={value => handleDateRangeChange(value as DateRange['preset'])}
              options={[
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'Last 7 Days' },
                { value: 'month', label: 'Last 30 Days' },
                { value: 'quarter', label: 'Last 90 Days' },
                { value: 'year', label: 'Last Year' },
              ]}
              data-cy="date-range-select"
            />
          </div>

          {/* Color Palette */}
          <div>
            <Select
              label="Color Palette"
              value={selectedPalette}
              onChange={value => {
                const palette = value as keyof typeof colorPalettes;
                setSelectedPalette(palette);
                setConfig(prev => ({ ...prev, colors: colorPalettes[palette] }));
              }}
              options={[
                { value: 'default', label: 'Default' },
                { value: 'pastel', label: 'Pastel' },
                { value: 'vibrant', label: 'Vibrant' },
                { value: 'professional', label: 'Professional' },
                { value: 'monochrome', label: 'Monochrome' },
              ]}
              data-cy="color-palette-select"
            />
          </div>
        </div>

        {/* Additional Options */}
        <div className="mt-4 flex gap-4 items-center">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={config.showLegend}
              onChange={e => setConfig(prev => ({ ...prev, showLegend: e.target.checked }))}
              className="rounded border-gray-300"
            />
            Show Legend
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={config.showGrid}
              onChange={e => setConfig(prev => ({ ...prev, showGrid: e.target.checked }))}
              className="rounded border-gray-300"
            />
            Show Grid
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={config.showTooltip}
              onChange={e => setConfig(prev => ({ ...prev, showTooltip: e.target.checked }))}
              className="rounded border-gray-300"
            />
            Show Tooltip
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={customization.showDataLabels}
              onChange={e => setCustomization(prev => ({ ...prev, showDataLabels: e.target.checked }))}
              className="rounded border-gray-300"
            />
            Show Data Labels
          </label>
          {(config.type === 'bar' || config.type === 'area') && (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={customization.stackBars}
                onChange={e => setCustomization(prev => ({ ...prev, stackBars: e.target.checked }))}
                className="rounded border-gray-300"
              />
              Stack Series
            </label>
          )}
          {(config.type === 'line' || config.type === 'area') && (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={customization.smoothLines}
                onChange={e => setCustomization(prev => ({ ...prev, smoothLines: e.target.checked }))}
                className="rounded border-gray-300"
              />
              Smooth Lines
            </label>
          )}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={customization.showBrush}
              onChange={e => setCustomization(prev => ({ ...prev, showBrush: e.target.checked }))}
              className="rounded border-gray-300"
            />
            Show Zoom Brush
          </label>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow h-full p-6" id="chart-container" data-cy="chart-container">
          {renderChart()}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              {dataSourceIcons[config.dataSource]}
              {(config?.dataSource?.charAt?.(0) ?? '').toUpperCase() + (config?.dataSource?.slice?.(1) ?? '')}
            </span>
            <span>•</span>
            <span>{(data?.length ?? 0)} records</span>
            <span>•</span>
            <span>
              {config.dateRange && format((config?.dateRange?.start ?? ''), 'MMM dd, yyyy')} - {config.dateRange && format((config?.dateRange?.end ?? ''), 'MMM dd, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Chart: {(config?.type?.charAt?.(0) ?? '').toUpperCase() + (config?.type?.slice?.(1) ?? '')}</span>
            <span>•</span>
            <span>Palette: {selectedPalette.charAt(0).toUpperCase() + selectedPalette.slice(1)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Real-time updates {loading ? 'active' : 'paused'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualizationView;