'use client'

import React, { useState } from 'react'
import DashboardLayout from '../dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Login/ui/card"
import { Button } from "../../components/Login/ui/button"
import { Input } from "../../components/Login/ui/input"
import { Select } from "../../components/ui/select"
import { Slider } from "../../components/ui/slider"
import { Switch } from "../../components/ui/switch"
import { Label } from "../../components/Login/ui/label"
import { Save, RefreshCw, Play } from 'lucide-react'

export default function ModelPage() {
  const [modelType, setModelType] = useState('cnn')
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5)
  const [batchSize, setBatchSize] = useState(32)
  const [useGPU, setUseGPU] = useState(true)
  const [nmsThreshold, setNmsThreshold] = useState(0.4)

  const handleSaveChanges = () => {
    // Implement save functionality here
    console.log('Saving inference settings...')
  }

  const handleResetDefaults = () => {
    setModelType('cnn')
    setConfidenceThreshold(0.5)
    setBatchSize(32)
    setUseGPU(true)
    setNmsThreshold(0.4)
  }

  const handleRunInference = () => {
    // Implement inference functionality here
    console.log('Running inference...')
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-blue-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Model Inference Settings</h1>
        <p className="text-gray-600 mb-6">Adjust the AI model parameters for inference on road images.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-blue-700">Model Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="model-type">Model Type</Label>
                <Select id="model-type" value={modelType} onChange={(e) => setModelType(e.target.value)}>
                  <option value="cnn">Convolutional Neural Network (CNN)</option>
                  <option value="resnet">ResNet</option>
                  <option value="yolo">YOLO</option>
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
                  onValueChange={(value) => setConfidenceThreshold(value[0])}
                  className="my-4"
                />
                <span className="text-sm text-gray-500">{confidenceThreshold.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-gpu"
                  checked={useGPU}
                  onCheckedChange={setUseGPU}
                />
                <Label htmlFor="use-gpu" className="text-sm text-gray-700">Use GPU Acceleration</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-blue-700">Inference Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="batch-size">Inference Batch Size</Label>
                <Input
                  id="batch-size"
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  min={1}
                  max={256}
                />
              </div>
              <div>
                <Label htmlFor="nms-threshold">NMS Threshold</Label>
                <Slider
                  id="nms-threshold"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[nmsThreshold]}
                  onValueChange={(value) => setNmsThreshold(value[0])}
                  className="my-4"
                />
                <span className="text-sm text-gray-500">{nmsThreshold.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-between">
          <div>
            <Button onClick={handleSaveChanges} className="mr-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
            <Button onClick={handleResetDefaults} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
          <Button onClick={handleRunInference} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Play className="w-4 h-4 mr-2" />
            Run Inference
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}