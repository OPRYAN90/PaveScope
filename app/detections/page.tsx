'use client'

import React, { useState } from 'react'
import DashboardLayout from '../dashboard-layout'
import { Card, CardContent } from "../../components/Login/ui/card"
import { Button } from "../../components/Login/ui/button"
import { Upload, X, ZoomIn, ZoomOut } from 'lucide-react'
import Link from 'next/link'

// Mock data for detections (replace with actual data in production)
const mockDetections = [
  { id: 1, imageUrl: '/placeholder.svg?height=300&width=300', title: 'Pothole Detection 1', description: 'Severity: High' },
  { id: 2, imageUrl: '/placeholder.svg?height=300&width=300', title: 'Crack Analysis 1', description: 'Length: 2.5m' },
  { id: 3, imageUrl: '/placeholder.svg?height=300&width=300', title: 'Surface Degradation', description: 'Area: 5 sq.m' },
  // Add more mock data as needed
]

export default function DetectionsPage() {
  const [detections, setDetections] = useState(mockDetections)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const openFullScreen = (id: number) => {
    setSelectedImage(id)
  }

  const closeFullScreen = () => {
    setSelectedImage(null)
  }

  return (
    <DashboardLayout>
      <main className="p-6 bg-blue-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Detections</h1>
        <p className="text-gray-600 mb-6">This page displays the results of AI detections on processed images.</p>

        {detections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {detections.map((detection) => (
              <Card key={detection.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <img
                    src={detection.imageUrl}
                    alt={detection.title}
                    className="w-full h-48 object-cover mb-4 rounded"
                  />
                  <h2 className="text-lg font-semibold text-blue-700 mb-2">{detection.title}</h2>
                  <p className="text-gray-600 mb-4">{detection.description}</p>
                  <Button onClick={() => openFullScreen(detection.id)} className="w-full">
                    <ZoomIn className="mr-2 h-4 w-4" /> View Full Screen
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-8">
            <Upload className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <h2 className="text-2xl font-semibold text-blue-700 mb-2">No detections yet</h2>
            <p className="text-gray-600 mb-4">Upload images to see AI detections here.</p>
            <Link href="/upload">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Go to Upload Page
              </Button>
            </Link>
          </Card>
        )}

        {selectedImage !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="max-w-4xl w-full p-4">
              <img
                src={detections.find(d => d.id === selectedImage)?.imageUrl}
                alt="Full screen view"
                className="w-full h-auto"
              />
              <Button
                onClick={closeFullScreen}
                className="mt-4 bg-white text-blue-600 hover:bg-blue-100"
              >
                <ZoomOut className="mr-2 h-4 w-4" /> Close Full Screen
              </Button>
            </div>
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}