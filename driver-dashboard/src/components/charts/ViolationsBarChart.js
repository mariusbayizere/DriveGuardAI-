import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, Chip, ChartTooltip } from '../ui';

/**
 * Bar chart showing incident counts by violation type.
 *
 * @param {{ name: string, value: number }[]} data
 * @param {boolean} isMobile
 * @param {number}  [delay=0] - CSS animation delay (seconds)
 */
const ViolationsBarChart = ({ data, isMobile, delay = 0 }) => {
  const chartHeight = isMobile ? 200 : 250;

  return (
    <Card delay={delay}>
      <CardHeader
        title="Violations by Type"
        subtitle="Incident frequency breakdown"
        right={<Chip label="Bar Chart" color="#16a34a" bg="#f0fdf4" border="#bbf7d0" />}
      />
      <div style={{ padding: isMobile ? '12px 4px 10px' : '20px 12px 16px' }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            barSize={isMobile ? 20 : 32}
            margin={{ top: 4, right: 8, left: isMobile ? -20 : -16, bottom: isMobile ? 20 : 0 }}
          >
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#84CC16" />
                <stop offset="100%" stopColor="#d9f99d" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="0"
              horizontal
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="name"
              tick={{
                fill: '#9ca3af',
                fontSize: isMobile ? 9 : 11,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={isMobile ? -30 : 0}
              textAnchor={isMobile ? 'end' : 'middle'}
            />
            <YAxis
              tick={{
                fill: '#9ca3af',
                fontSize: isMobile ? 9 : 11,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f9fafb' }} />
            <Bar dataKey="value" name="Count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ViolationsBarChart;
