'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Login/ui/card"
import { Button } from "../../components/Login/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select"
import { Slider } from "../../components/ui/slider"
import { Switch } from "../../components/ui/switch"
import { Label } from "../../components/Login/ui/label"
import { Save, RefreshCw, Play, AlertCircle, X, Image as ImageIcon, Upload } from 'lucide-react'
import { Alert, AlertDescription } from "../../components/ui/alert"
import { ScrollArea } from "../../components/ui/scroll-area"

export default function ModelPage() {
  const [modelType, setModelType] = useState('yolov8')
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5)
  const [useGPU, setUseGPU] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [showConfidenceWarning, setShowConfidenceWarning] = useState(false)
  const [showGPUWarning, setShowGPUWarning] = useState(false)

  useEffect(() => {
    let confidenceTimer: NodeJS.Timeout
    let gpuTimer: NodeJS.Timeout

    if (showConfidenceWarning) {
      confidenceTimer = setTimeout(() => {
        setShowConfidenceWarning(false)
      }, 3000)
    }

    if (showGPUWarning) {
      gpuTimer = setTimeout(() => {
        setShowGPUWarning(false)
      }, 3000)
    }

    return () => {
      clearTimeout(confidenceTimer)
      clearTimeout(gpuTimer)
    }
  }, [showConfidenceWarning, showGPUWarning])

  const handleConfidenceChange = (value: number[]) => {
    setShowConfidenceWarning(true)
  }

  const handleGPUChange = () => {
    setShowGPUWarning(true)
  }

  const handleSaveChanges = () => {
    console.log('Saving inference settings...')
  }

  const handleResetDefaults = () => {
    setModelType('yolov8')
    setConfidenceThreshold(0.5)
    setUseGPU(false)
    setSelectedImages([])
  }

  const handleRunInference = () => {
    console.log('Running inference...')
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file))
      setSelectedImages(prev => [...prev, ...newImages])
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen bg-blue-50">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6 text-blue-800">Model Inference Settings</h1>
          <p className="text-gray-600 mb-6">Adjust the AI model parameters for inference on road images.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-blue-700">Model Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-grow">
                <div>
                  <Label htmlFor="model-type">Model Type</Label>
                  <Select value={modelType} onValueChange={setModelType}>
                    <SelectTrigger id="model-type">
                      <SelectValue placeholder="Select model type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yolov8">YOLOv8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
                  <Slider
                    id="confidence-threshold"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[confidenceThreshold]}
                    onValueChange={handleConfidenceChange}
                    className="my-4"
                  />
                  <span className="text-sm text-gray-500">{confidenceThreshold.toFixed(2)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-gpu"
                    checked={useGPU}
                    onCheckedChange={handleGPUChange}
                  />
                  <Label htmlFor="use-gpu" className="text-sm text-gray-700">Use GPU Acceleration</Label>
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-blue-700">Inference Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 flex-grow flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Selected Images: {selectedImages.length}</span>
                  <Button variant="outline" size="sm" onClick={() => setSelectedImages([])}>
                    Clear Selection
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4 flex-grow">
                  <Button 
                    onClick={handleSaveChanges} 
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full h-full rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center justify-center"
                  >
                    <Save className="w-6 h-6 mb-2" />
                    <span>Save Settings</span>
                  </Button>
                  <Button 
                    onClick={handleResetDefaults} 
                    variant="outline" 
                    className="w-full h-full rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center justify-center"
                  >
                    <RefreshCw className="w-6 h-6 mb-2" />
                    <span>Reset Defaults</span>
                  </Button>
                  <Button 
                    onClick={handleRunInference} 
                    className="bg-green-600 hover:bg-green-700 text-white w-full h-full rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center justify-center"
                  >
                    <Play className="w-6 h-6 mb-2" />
                    <span>Run Inference</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="flex-grow overflow-hidden m-6 mt-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold text-blue-700">Image Gallery</CardTitle>
            <div>
              <input
                type="file"
                id="image-upload"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button variant="outline" as="span" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Images
                </Button>
              </label>
            </div>
          </CardHeader>
          <CardContent className="h-full">
            <ScrollArea className="h-[calc(100vh-400px)]">
              {selectedImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedImages.map((image, index) => (
                    <img key={index} src={image} alt={`Selected image ${index + 1}`} className="w-full h-48 object-cover rounded-lg shadow-md" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ImageIcon className="w-16 h-16 mb-4" />
                  <p className="text-lg font-semibold">No images selected</p>
                  <p className="text-sm">Upload images to view them here</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="fixed bottom-4 right-4 space-y-2">
          {showConfidenceWarning && (
            <Alert variant="destructive" className="w-96 bg-yellow-100 border-yellow-500 text-yellow-800 transition-all duration-300 ease-in-out">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Changing the confidence threshold is not supported yet.
              </AlertDescription>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setShowConfidenceWarning(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          )}

          {showGPUWarning && (
            <Alert variant="default" className="w-96 bg-yellow-100 border-yellow-500 text-yellow-800 transition-all duration-300 ease-in-out">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                GPU support is not enabled yet.
              </AlertDescription>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setShowGPUWarning(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}