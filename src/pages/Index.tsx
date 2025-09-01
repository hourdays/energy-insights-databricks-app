
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnergyChart } from '@/components/EnergyChart';
import { AnnotationPanel } from '@/components/AnnotationPanel';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Zap, TrendingUp, TrendingDown, Clock } from 'lucide-react';

export interface Annotation {
  id: string;
  timestamp: number;
  endTimestamp?: number;
  type: 'peak' | 'drop' | 'range' | 'note';
  title: string;
  description: string;
  color: string;
}

// Sample energy data for the past 24 hours
const generateEnergyData = () => {
  const data = [];
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = now - (i * oneHour);
    // Simulate realistic energy consumption with peaks during day hours
    const hour = new Date(timestamp).getHours();
    let baseConsumption = 45;
    
    if (hour >= 6 && hour <= 8) baseConsumption = 75; // Morning peak
    else if (hour >= 18 && hour <= 20) baseConsumption = 85; // Evening peak
    else if (hour >= 9 && hour <= 17) baseConsumption = 60; // Day consumption
    else if (hour >= 0 && hour <= 5) baseConsumption = 30; // Night low
    
    const consumption = baseConsumption + Math.random() * 15 - 7.5;
    
    data.push({
      timestamp,
      consumption: Math.max(0, consumption),
      time: new Date(timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    });
  }
  
  return data;
};

const Index = () => {
  const [energyData] = useState(generateEnergyData());
  const [annotations, setAnnotations] = useState<Annotation[]>([
    {
      id: '1',
      timestamp: Date.now() - (6 * 60 * 60 * 1000),
      type: 'peak',
      title: 'Morning Peak',
      description: 'Typical morning consumption spike due to office buildings starting operations',
      color: '#ef4444'
    },
    {
      id: '2',
      timestamp: Date.now() - (18 * 60 * 60 * 1000),
      endTimestamp: Date.now() - (16 * 60 * 60 * 1000),
      type: 'range',
      title: 'Industrial Load',
      description: 'Peak industrial consumption period - manufacturing plants at full capacity',
      color: '#f59e0b'
    }
  ]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false);

  const handleAddAnnotation = (annotation: Omit<Annotation, 'id'>) => {
    const newAnnotation = {
      ...annotation,
      id: Date.now().toString()
    };
    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const handleEditAnnotation = (id: string, updatedAnnotation: Partial<Annotation>) => {
    setAnnotations(prev => 
      prev.map(ann => ann.id === id ? { ...ann, ...updatedAnnotation } : ann)
    );
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    setSelectedAnnotation(null);
  };

  const peakCount = annotations.filter(a => a.type === 'peak').length;
  const dropCount = annotations.filter(a => a.type === 'drop').length;
  const currentConsumption = energyData[energyData.length - 1]?.consumption || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <DashboardHeader />
      
      <div className="container mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Load</p>
                  <p className="text-2xl font-bold text-gray-900">{currentConsumption.toFixed(1)} MW</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Peak Events</p>
                  <p className="text-2xl font-bold text-gray-900">{peakCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Drop Events</p>
                  <p className="text-2xl font-bold text-gray-900">{dropCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Annotations</p>
                  <p className="text-2xl font-bold text-gray-900">{annotations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chart and Annotations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Energy Consumption - Last 24 Hours
                  </CardTitle>
                  <Button 
                    onClick={() => setShowAnnotationPanel(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add Annotation
                  </Button>
                </div>
                <div className="flex gap-2 mt-4">
                  {annotations.slice(0, 3).map(annotation => (
                    <Badge 
                      key={annotation.id}
                      variant="secondary" 
                      className="cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={() => setSelectedAnnotation(annotation)}
                    >
                      {annotation.title}
                    </Badge>
                  ))}
                  {annotations.length > 3 && (
                    <Badge variant="outline">+{annotations.length - 3} more</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <EnergyChart 
                  data={energyData}
                  annotations={annotations}
                  onAnnotationClick={setSelectedAnnotation}
                  onAddAnnotation={handleAddAnnotation}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Recent Annotations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {annotations.slice(-5).reverse().map(annotation => (
                  <div 
                    key={annotation.id}
                    className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedAnnotation(annotation)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: annotation.color }}
                      />
                      <span className="font-medium text-sm">{annotation.title}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          annotation.type === 'peak' ? 'border-red-200 text-red-700' :
                          annotation.type === 'drop' ? 'border-green-200 text-green-700' :
                          annotation.type === 'range' ? 'border-amber-200 text-amber-700' :
                          'border-blue-200 text-blue-700'
                        }`}
                      >
                        {annotation.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{annotation.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(annotation.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AnnotationPanel 
        isOpen={showAnnotationPanel}
        onClose={() => setShowAnnotationPanel(false)}
        onSave={handleAddAnnotation}
        energyData={energyData}
      />

      {selectedAnnotation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedAnnotation.color }}
                />
                {selectedAnnotation.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge variant="outline">{selectedAnnotation.type}</Badge>
              </div>
              <p className="text-gray-700">{selectedAnnotation.description}</p>
              <p className="text-sm text-gray-500">
                {new Date(selectedAnnotation.timestamp).toLocaleString()}
                {selectedAnnotation.endTimestamp && (
                  <> - {new Date(selectedAnnotation.endTimestamp).toLocaleString()}</>
                )}
              </p>
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteAnnotation(selectedAnnotation.id)}
                >
                  Delete
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedAnnotation(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Index;
