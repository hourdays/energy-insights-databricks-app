
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { Annotation } from '@/pages/Index';

interface EnergyChartProps {
  data: Array<{
    timestamp: number;
    consumption: number;
    time: string;
  }>;
  annotations: Annotation[];
  onAnnotationClick: (annotation: Annotation) => void;
  onAddAnnotation: (annotation: Omit<Annotation, 'id'>) => void;
}

export const EnergyChart = ({ data, annotations, onAnnotationClick, onAddAnnotation }: EnergyChartProps) => {
  const handleChartClick = (event: any) => {
    if (event && event.activeLabel) {
      const clickedTime = event.activeLabel;
      const clickedData = data.find(d => d.time === clickedTime);
      
      if (clickedData) {
        const consumption = clickedData.consumption;
        const avgConsumption = data.reduce((sum, d) => sum + d.consumption, 0) / data.length;
        
        let type: 'peak' | 'drop' | 'note' = 'note';
        let title = 'Manual Annotation';
        let description = `Energy consumption at ${clickedTime}`;
        
        if (consumption > avgConsumption * 1.2) {
          type = 'peak';
          title = 'Consumption Peak';
          description = `High energy consumption detected: ${consumption.toFixed(1)} MW (${((consumption / avgConsumption - 1) * 100).toFixed(1)}% above average)`;
        } else if (consumption < avgConsumption * 0.8) {
          type = 'drop';
          title = 'Consumption Drop';
          description = `Low energy consumption detected: ${consumption.toFixed(1)} MW (${((1 - consumption / avgConsumption) * 100).toFixed(1)}% below average)`;
        }
        
        onAddAnnotation({
          timestamp: clickedData.timestamp,
          type,
          title,
          description,
          color: type === 'peak' ? '#ef4444' : type === 'drop' ? '#22c55e' : '#3b82f6'
        });
      }
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const annotation = annotations.find(ann => {
        const dataTime = data.find(d => d.time === label)?.timestamp;
        return dataTime && Math.abs(ann.timestamp - dataTime) < 30 * 60 * 1000; // Within 30 minutes
      });

      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Time: ${label}`}</p>
          <p className="text-blue-600">{`Consumption: ${payload[0].value.toFixed(1)} MW`}</p>
          {annotation && (
            <div className="mt-2 p-2 bg-gray-50 rounded border-l-4" style={{ borderLeftColor: annotation.color }}>
              <p className="text-xs font-medium text-gray-700">{annotation.title}</p>
              <p className="text-xs text-gray-600">{annotation.description}</p>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">Click to add annotation</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data} 
          onClick={handleChartClick}
          className="cursor-pointer"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="time" 
            stroke="#64748b"
            fontSize={12}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            label={{ value: 'MW', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Render range annotations as areas */}
          {annotations
            .filter(ann => ann.type === 'range' && ann.endTimestamp)
            .map(annotation => {
              const startData = data.find(d => Math.abs(d.timestamp - annotation.timestamp) < 30 * 60 * 1000);
              const endData = data.find(d => Math.abs(d.timestamp - annotation.endTimestamp!) < 30 * 60 * 1000);
              
              if (startData && endData) {
                return (
                  <ReferenceArea
                    key={annotation.id}
                    x1={startData.time}
                    x2={endData.time}
                    fill={annotation.color}
                    fillOpacity={0.1}
                    stroke={annotation.color}
                    strokeOpacity={0.3}
                  />
                );
              }
              return null;
            })}
          
          {/* Render point annotations as reference lines */}
          {annotations
            .filter(ann => ann.type !== 'range')
            .map(annotation => {
              const matchingData = data.find(d => Math.abs(d.timestamp - annotation.timestamp) < 30 * 60 * 1000);
              
              if (matchingData) {
                return (
                  <ReferenceLine
                    key={annotation.id}
                    x={matchingData.time}
                    stroke={annotation.color}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                );
              }
              return null;
            })}
          
          <Line 
            type="monotone" 
            dataKey="consumption" 
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
