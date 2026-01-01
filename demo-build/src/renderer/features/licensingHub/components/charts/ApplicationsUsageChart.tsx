import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ApplicationsUsageChartProps {
  data: Array<{
    product: string;
    usage: number;
    color: string;
  }>;
}

export const ApplicationsUsageChart: React.FC<ApplicationsUsageChartProps> = ({ data }) => {
  if (data.length === 0 || data.every(item => item.usage === 0)) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="text-sm">No application usage data</div>
          <div className="text-xs mt-1">Run application discovery to see usage statistics</div>
        </div>
      </div>
    );
  }

  const renderCustomizedLabel = (entry: any) => {
    const total = data.reduce((sum, item) => sum + item.usage, 0);
    const percent = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
    return entry.value > 0 ? `${percent}%` : '';
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="usage"
          label={renderCustomizedLabel}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '12px'
          }}
          formatter={(value: number) => [value.toLocaleString(), 'Usage']}
          labelFormatter={(label: string) => label}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value: string) => <span className="text-sm">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};