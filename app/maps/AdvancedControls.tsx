import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Login/ui/card"
import { Button } from "../../components/Login/ui/button"
import { Input } from "../../components/Login/ui/input"
import { Slider } from "../../components/ui/slider"
import { Switch } from "../../components/ui/switch"
import { Layers, Search, Menu } from 'lucide-react'
import { Label } from "../../components/Login/ui/label"

interface AdvancedControlsProps {
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
  onClose: () => void;
  showDetections: boolean;
  setShowDetections: (show: boolean) => void;
  showNonDetections: boolean;
  setShowNonDetections: (show: boolean) => void;
  showUnprocessed: boolean;
  setShowUnprocessed: (show: boolean) => void;
}

const AdvancedControls: React.FC<AdvancedControlsProps> = ({
  zoomLevel,
  setZoomLevel,
  onClose,
  showDetections,
  setShowDetections,
  showNonDetections,
  setShowNonDetections,
  showUnprocessed,
  setShowUnprocessed
}) => {
  return (
    <Card className="absolute bottom-4 right-4 w-80 bg-white shadow-xl overflow-auto max-h-[calc(100vh-5rem)] z-30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-blue-700">Advanced Controls</CardTitle>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium">Search and Zoom</h3>
          <div className="flex space-x-2">
            <Input type="text" placeholder="Enter address or coordinates" />
            <Button size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Zoom Level: {zoomLevel}</Label>
            <Slider
              min={1}
              max={20}
              step={1}
              value={[zoomLevel]}
              onValueChange={(value) => setZoomLevel(value[0])}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Map Layers</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="detections" className="cursor-pointer">Show Detections</Label>
              <Switch 
                id="detections" 
                checked={showDetections}
                onCheckedChange={setShowDetections}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="nonDetections" className="cursor-pointer">Show Non-Detections</Label>
              <Switch 
                id="nonDetections" 
                checked={showNonDetections}
                onCheckedChange={setShowNonDetections}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="unprocessed" className="cursor-pointer">Show Unprocessed Images</Label>
              <Switch 
                id="unprocessed" 
                checked={showUnprocessed}
                onCheckedChange={setShowUnprocessed}
              />
            </div>
          </div>
          <Button className="w-full">
            <Layers className="mr-2 h-4 w-4" /> Update Layers
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AdvancedControls