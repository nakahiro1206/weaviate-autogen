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
import { useGetPaperById } from '@/hooks/paper';

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
  const [selectedPoint, setSelectedPoint] = useState<TSNEPoint | null>(null);
  const [rectangle, setRectangle] = useState<{
    start: {
      x: number;
      y: number;
    };
    end: {
      x: number;
      y: number;
    };
  } | null>(null);

  const addHyphenToUuid = (uuid: string) => {
    return uuid.slice(0, 8) + '-' + uuid.slice(8, 12) + '-' + uuid.slice(12, 16) + '-' + uuid.slice(16, 20) + '-' + uuid.slice(20, 32);
  }
  const { paper, isLoading: isPaperLoading } = useGetPaperById(addHyphenToUuid(selectedPoint?.id || ''));

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

  return (<>
  <Scatter options={{
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
    interaction: {
      mode: 'point',
    },
    events: ['click', 'touchstart', 'touchmove', 'touchend'],
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const element = elements[0];
        const point = data.datasets[0].data[element.index];
        setSelectedPoint(point);
      }
    },
  }} data={data} />

  {selectedPoint ? <div>Selected point: {selectedPoint.id}</div> : null}
  {paper && !isPaperLoading ? <div>Paper: {paper.info.title}</div> : null}
  </>
  );
};
