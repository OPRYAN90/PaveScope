'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../dashboard-layout'
import { Card, CardContent } from "../../components/Login/ui/card"
import { Button } from "../../components/Login/ui/button"
import { Upload, X, ZoomIn, ZoomOut, Trash2 } from 'lucide-react'
import { useAuth } from '../../components/AuthProvider'
import { db } from '../../firebase'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import Link from 'next/link'
import { toast } from "../../components/ui/use-toast"

interface Detection {
  id: string;
  imageUrl: string;
  fileName: string;
  gps: {
    lat: number;
    lng: number;
    alt?: number;
  };
  detections: any[]; // Update this type based on the actual structure of your detections
  timestamp: any; // Firebase Timestamp
}

export default function DetectionsPage() {
  const [detections, setDetections] = useState<Detection[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'users', user.uid, 'detections'), orderBy('timestamp', 'desc'))
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const detectionData: Detection[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Detection))
        setDetections(detectionData)
      })

      return () => unsubscribe()
    }
  }, [user])

  const openFullScreen = (imageUrl: string) => {
    setSelectedImage(imageUrl)
  }

  const closeFullScreen = () => {
    setSelectedImage(null)
  }

  const deleteDetection = async (detectionId: string, imageUrl: string) => {
    if (!user) return
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'detections', detectionId))
      toast({
        title: "Detection deleted",
        description: "The detection has been removed and the image is available for inference again.",
      })
      // The onSnapshot listener will automatically update the UI
    } catch (error) {
      console.error("Error deleting detection:", error)
      toast({
        title: "Error",
        description: "Failed to delete the detection. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <main className="p-6 bg-blue-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Detections</h1>
        {/* <p className="text-gray-600 mb-6">This page displays the results of AI detections on processed images.</p> */}

        {detections && detections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {detections.map((detection) => (
              <Card key={detection.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <img
                    src={detection.imageUrl}
                    alt={detection.fileName}
                    className="w-full h-48 object-cover mb-4 rounded"
                  />
                  <h2 className="text-lg font-semibold text-blue-700 mb-2">{detection.fileName}</h2>
                  <p className="text-gray-600 mb-2">
                    GPS: {detection.gps.lat.toFixed(6)}, {detection.gps.lng.toFixed(6)}
                    {detection.gps.alt !== undefined ? `, ${detection.gps.alt.toFixed(1)}m` : ''}
                  </p>
                  <p className="text-gray-600 mb-4">
                    Detections: {detection.detections ? detection.detections.length : 0}
                  </p>
                  <div className="flex justify-between mt-4">
                    <Button onClick={() => openFullScreen(detection.imageUrl)} className="flex-1 mr-2">
                      <ZoomIn className="mr-2 h-4 w-4" /> View Full Screen
                    </Button>
                    <Button 
                      onClick={() => deleteDetection(detection.id, detection.imageUrl)} 
                      variant="destructive"
                      className="flex-1 ml-2"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-8">
            <Upload className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <h2 className="text-2xl font-semibold text-blue-700 mb-2">No detections yet</h2>
            <p className="text-gray-600 mb-4">Run inference on images to see AI detections here.</p>
            <Link href="/model">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Go to Model Page
              </Button>
            </Link>
          </Card>
        )}

        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="max-w-4xl w-full p-4">
              <img
                src={selectedImage}
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