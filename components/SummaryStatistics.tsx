import React from 'react';

interface DataItem {
  volume?: number | 'N/A';
  cost?: number | 'N/A';
  detections?: number | 'N/A';
}

const SummaryStatistics = ({ data }: { data: DataItem[] }) => {
  const totalVolume = data.reduce((sum, item) => {
    const volume = typeof item.volume === 'number' ? item.volume : 0;
    return sum + volume;
  }, 0);

  const totalCost = data.reduce((sum, item) => {
    const cost = typeof item.cost === 'number' ? item.cost : 0;
    return sum + cost;
  }, 0);

  const totalDetections = data.reduce((sum, item) => {
    const detections = typeof item.detections === 'number' ? item.detections : 0;
    return sum + detections;
  }, 0);

  return (
    <div className="flex items-center space-x-11 text-sm px-11">
      <div className="font-medium text-gray-500">Volume: <span className="text-blue-600">{totalVolume.toFixed(2)} m³</span></div>
      <div className="font-medium text-gray-500">Cost: <span className="text-green-600">${totalCost.toFixed(2)}</span></div>
      <div className="font-medium text-gray-500">Detections: <span className="text-purple-600">{totalDetections}</span></div>
    </div>
  );
};

export default SummaryStatistics;
