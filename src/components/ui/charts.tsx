// components/ui/charts.tsx
'use client';

import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export function PieChart({ data }: { data: any }) {
  return (
    <div className="h-[300px]">
      <Pie 
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
            },
          },
        }}
      />
    </div>
  );
}

export function BarChart({ data }: { data: any }) {
  return (
    <div className="h-[300px]">
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
}