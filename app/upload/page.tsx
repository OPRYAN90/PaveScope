'use client'

import React, { useState } from 'react'
import { Upload, File, X, Image as ImageIcon } from 'lucide-react'
import DashboardLayout from '../dashboard-layout'
import { Button } from "../../components/Login/ui/button"
import { Card, CardContent } from "../../components/Login/ui/card"
import { Progress } from "../../components/ui/progress"

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    setUploading(true)
    // Simulating upload progress
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    // Simulating adding uploaded files to the gallery
    const newImages = files.map(file => URL.createObjectURL(file))
    setUploadedImages(prev => [...prev, ...newImages])
    setUploading(false)
    setFiles([])
    setProgress(0)
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-blue-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Upload Image Data</h1>
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
          <CardContent className="p-6">
            <p className="text-gray-600 mb-6">Upload new images or data files for processing.</p>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center mb-6">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                <p className="text-blue-600 font-semibold">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
              </label>
            </div>
            {files.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 text-blue-800">Selected Files:</h2>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                      <div className="flex items-center">
                        <File className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                      </div>
                      <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                        <X className="h-5 w-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {uploading && (
              <div className="mb-4">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-600 mt-2">Uploading... {progress}%</p>
              </div>
            )}
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">Image Gallery</h2>
            {uploadedImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img src={image} alt={`Uploaded image ${index + 1}`} className="w-full h-40 object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button variant="secondary" size="sm">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto h-12 w-12 text-blue-300 mb-4" />
                <p className="text-gray-500">Upload images to see them in the gallery</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}