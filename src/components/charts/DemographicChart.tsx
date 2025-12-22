// src/components/charts/DemographicChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DemographicChartProps {
  data: any;
  type: 'caste' | 'urbanRural' | 'gender';
}

const DemographicChart: React.FC<DemographicChartProps> = ({ data, type }) => {
  if (!data) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No demographic data available
      </div>
    );
  }

  let chartData = [];
  let colors: string[] = [];

  switch (type) {
    case 'caste':
      chartData = [
        { name: 'SC', value: data.sc || 0 },
        { name: 'ST', value: data.st || 0 },
        { name: 'OBC', value: data.obc || 0 },
        { name: 'General', value: data.general || 0 }
      ];
      colors = ['#3b82f6', '#10b981', '#f59e0b', '#6b7280'];
      break;

    case 'urbanRural':
      chartData = [
        { name: 'Urban', value: data.urban || 0 },
        { name: 'Rural', value: data.rural || 0 }
      ];
      colors = ['#8b5cf6', '#84cc16'];
      break;

    case 'gender':
      chartData = [
        { name: 'Male', value: data.male || 0 },
        { name: 'Female', value: data.female || 0 },
        { name: 'Other', value: data.other || 0 }
      ];
      colors = ['#0ea5e9', '#ec4899', '#f97316'];
      break;
  }
  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No demographic data available
      </div>
    );
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const formattedData = chartData.map(item => ({
    ...item,
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
              name
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DemographicChart;