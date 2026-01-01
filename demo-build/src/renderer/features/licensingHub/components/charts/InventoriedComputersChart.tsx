import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InventoriedComputersChartProps {
  data: Array<{
    month: string;
    count: number;
  }>;
}

export const InventoriedComputersChart: React.FC<InventoriedComputersChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="text-sm">No inventory data available</div>
          <div className="text-xs mt-1">Run device discovery to populate this chart</div>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
        <XAxis
          dataKey="month"
          className="text-gray-600 dark:text-gray-400"
          angle={-45}
          textAnchor="end"
          height={80}
          fontSize={12}
        />
        <YAxis
          className="text-gray-600 dark:text-gray-400"
          fontSize={12}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '12px'
          }}
          formatter={(value: number) => [value.toLocaleString(), 'Devices']}
          labelFormatter={(label: string) => `Month: ${label}`}
        />
        <Bar
          dataKey="count"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};