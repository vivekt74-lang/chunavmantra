// src/components/charts/TurnoutChart.tsx
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { apiService } from '@/services/api';

interface TurnoutChartProps {
  constituencyId?: number;
}

const TurnoutChart: React.FC<TurnoutChartProps> = ({ constituencyId }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (constituencyId) {
      loadData();
    } else {
      // Sample data
      setData(sampleData);
    }
  }, [constituencyId]);

  const loadData = async () => {
    if (!constituencyId) return;

    setLoading(true);
    try {
      const trendData = await apiService.getTurnoutTrend(constituencyId);

      const formattedData = trendData.map(item => ({
        year: item.year,
        turnout: item.turnout_percentage,
        votes: item.votes_cast,
        voters: item.total_voters
      }));

      setData(formattedData);
    } catch (error) {
      console.error('Failed to load turnout data:', error);
      setData(sampleData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading turnout data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="year"
            stroke="#9ca3af"
            tick={{ fill: '#6b7280' }}
          />
          <YAxis
            stroke="#9ca3af"
            tick={{ fill: '#6b7280' }}
            label={{
              value: 'Turnout %',
              angle: -90,
              position: 'insideLeft',
              fill: '#6b7280'
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'turnout') return [`${value.toFixed(1)}%`, 'Turnout'];
              if (name === 'votes') return [value.toLocaleString(), 'Votes Cast'];
              if (name === 'voters') return [value.toLocaleString(), 'Total Voters'];
              return [value, name];
            }}
          />
          <Legend />
          <Bar
            dataKey="turnout"
            fill="#3b82f6"
            name="Turnout %"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Sample data for fallback/demo
const sampleData = [
  { year: 2012, turnout: 58.2, votes: 245632, voters: 421891 },
  { year: 2017, turnout: 61.8, votes: 284512, voters: 460376 },
  { year: 2022, turnout: 64.3, votes: 325891, voters: 506987 }
];

export default TurnoutChart;