import React from 'react';
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

const random: (min: number, max: number) => number = (min, max) => Math.random() * (max - min) + min;

export const data = {
  datasets: [
    {
      label: 'A dataset',
      data: Array.from({ length: 100 }, () => ({
        x: random(-100, 100),
        y: random(-100, 100),
      })),
      backgroundColor: 'rgba(255, 99, 132, 1)',
    },
  ],
};

// TODO: connect to backend and receive tSNE results
export const TSNEGraph = () => {
  return <Scatter options={options} data={data} />;
};
