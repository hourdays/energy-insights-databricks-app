
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Calendar, Clock } from 'lucide-react';
import { Annotation } from '@/pages/Index';

interface AnnotationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (annotation: Omit<Annotation, 'id'>) => void;
  energyData: Array<{
    timestamp: number;
    consumption: number;
    time: string;
  }>;
}

export const AnnotationPanel = ({ isOpen, onClose, onSave, energyData }: AnnotationPanelProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'peak' | 'drop' | 'range' | 'note'>('note');
  const [selectedTime, setSelectedTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleSave = () => {
    if (!title.trim() || !selectedTime) return;

    const selectedData = energyData.find(d => d.time === selectedTime);
    if (!selectedData) return;

    const endData = endTime ? energyData.find(d => d.time === endTime) : null;

    const colorMap = {
      peak: '#ef4444',
      drop: '#22c55e',
      range: '#f59e0b',
      note: '#3b82f6'
    };

    onSave({
      timestamp: selectedData.timestamp,
      endTimestamp: endData?.timestamp,
      type,
      title: title.trim(),
      description: description.trim() || `${type} annotation for ${selectedTime}`,
      color: colorMap[type]
    });

    // Reset form
    setTitle('');
    setDescription('');
    setType('note');
    setSelectedTime('');
    setEndTime('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full bg-white max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Add Annotation</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="type">Annotation Type</Label>
            <Select value={type} onValueChange={(value: any) => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="peak">Peak Event</SelectItem>
                <SelectItem value="drop">Consumption Drop</SelectItem>
                <SelectItem value="range">Time Range</SelectItem>
                <SelectItem value="note">General Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter annotation title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add context or explanation..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="time" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Start Time
            </Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time point" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {energyData.map((data) => (
                  <SelectItem key={data.timestamp} value={data.time}>
                    {data.time} - {data.consumption.toFixed(1)} MW
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === 'range' && (
            <div>
              <Label htmlFor="endTime" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                End Time
              </Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {energyData
                    .filter(data => selectedTime ? data.timestamp > energyData.find(d => d.time === selectedTime)!.timestamp : true)
                    .map((data) => (
                      <SelectItem key={data.timestamp} value={data.time}>
                        {data.time} - {data.consumption.toFixed(1)} MW
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSave}
              disabled={!title.trim() || !selectedTime}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Save Annotation
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
