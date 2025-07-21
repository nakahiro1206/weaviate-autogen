import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

export const options = {
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

type TSNEPoint = {
  id: string;
  x: number;
  y: number;
};

export const TSNEGraph = () => {
  const [points, setPoints] = useState<TSNEPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8002/api/v1/tsne/papers')
      .then((res) => res.json())
      .then((data: TSNEPoint[]) => {
        setPoints(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const data = {
    datasets: [
      {
        label: 'tSNE Papers',
        data: points,
        backgroundColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };

  if (loading) return <div>Loading...</div>;

  return <Scatter options={{
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            return `ID: ${context.dataset.data[context.dataIndex]?.id || 'Unknown'}, X: ${context.parsed.x}, Y: ${context.parsed.y}`;
          },
        },
      },
    },
  }} data={data} />;
};
