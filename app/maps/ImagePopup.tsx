"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Login/ui/card"
import { Button } from "../../components/HomePage/ui/button"
import { Loader2, X, Maximize2, MapPin, Image as ImageIcon, DollarSign, Box } from 'lucide-react'
import { drawBoundingBoxes } from '../detections/utils'
import { db } from '../../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useAuth } from '../../components/AuthProvider'
interface ImageData {
  url: string;
  gps: { lat: number; lng: number };
  detectionCount: number;
  detectionImageUrl?: string;
  detections?: any[];
}

interface DetectionData {
  volume?: number;
  cost?: number;
  material?: string;
}

interface ImagePopupProps {
  imageUrl: string;
  onClose: () => void;
  imageData: ImageData | undefined;
}

export default function ImagePopup({ imageUrl, onClose, imageData }: ImagePopupProps) {
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [showFullImage, setShowFullImage] = useState(false)
  const [imageSrc, setImageSrc] = useState('')
  const [detectionData, setDetectionData] = useState<DetectionData | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (imageData && user) {
      setIsImageLoading(true)
      setImageSrc('') // Clear the previous image

      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        if (imageData.detections && imageData.detections.length > 0) {
          try {
            const newSrc = drawBoundingBoxes(img, imageData.detections)
            setImageSrc(newSrc)
          } catch (error) {
            console.error('Error drawing bounding boxes:', error)
            setImageSrc(imageData.url) // Fallback to original image
          }
        } else {
          setImageSrc(imageData.url)
        }
        setIsImageLoading(false)
      }
      img.onerror = () => {
        console.error('Error loading image:', imageData.url)
        setIsImageLoading(false)
      }
      img.src = imageData.url

      // Fetch detection data
      const fetchDetectionData = async () => {
        const detectionsRef = collection(db, 'users', user.uid, 'detections')
        const q = query(detectionsRef, where('imageUrl', '==', imageData.url))
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          const detectionDoc = querySnapshot.docs[0].data() as DetectionData
          setDetectionData(detectionDoc)
        } else {
          setDetectionData(null) // Reset detection data if not found
        }
      }
      fetchDetectionData()
    }
  }, [imageData, user])

  if (!imageData) return null

  return (
    <>
      <Card className="absolute top-4 right-4 w-72 bg-white shadow-xl z-10 overflow-hidden">
        <CardHeader className="p-4 relative flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700">
          <CardTitle className="text-lg font-semibold text-white leading-none flex items-center">
            <ImageIcon className="mr-2 h-5 w-5" />
            Image Details
          </CardTitle>
          <Button 
            variant="ghost"
            // @ts-ignore 
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:bg-blue-700/50"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </CardHeader>
        <CardContent className="p-3">
          <div className="w-full h-40 relative rounded-md overflow-hidden group mb-1.5">
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            )}
            {imageSrc && (
              <img 
                src={imageSrc} 
                alt="Selected location" 
                className={`w-full h-full object-cover ${isImageLoading ? 'invisible' : 'visible'}`}
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFullImage(true)}
                className="text-white bg-opacity-75 hover:bg-opacity-100"
              >
                <Maximize2 className="mr-2 h-4 w-4" />
                View Full Image
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1.5 text-blue-500 flex-shrink-0" />
              <div>
                <span className="font-medium">Lat:</span>
                <span className="ml-1">{imageData.gps.lat.toFixed(6)}</span>
              </div>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1.5 text-blue-500 flex-shrink-0" />
              <div>
                <span className="font-medium">Lng:</span>
                <span className="ml-1">{imageData.gps.lng.toFixed(6)}</span>
              </div>
            </div>
            <div className="flex items-center">
              <ImageIcon className="h-4 w-4 mr-1.5 text-blue-500 flex-shrink-0" />
              <div>
                <span className="font-medium">Status:</span>
                <span className="ml-1">
                  {imageData.detectionCount > 0 
                    ? `${imageData.detectionCount} Pothole${imageData.detectionCount === 1 ? '' : 's'}`
                    : (imageData.detectionImageUrl === undefined ? 'Not Processed' : 'No Potholes')}
                </span>
              </div>
            </div>
            {detectionData?.volume !== undefined && (
              <div className="flex items-center">
                <Box className="h-4 w-4 mr-1.5 text-blue-500 flex-shrink-0" />
                <div>
                  <span className="font-medium">Volume:</span>
                  <span className="ml-1">{detectionData.volume.toFixed(2)} m³</span>
                </div>
              </div>
            )}
            {detectionData?.cost !== undefined && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1.5 text-green-500 flex-shrink-0" />
                <div>
                  <span className="font-medium">Cost:</span>
                  <span className="ml-1">${detectionData.cost.toFixed(2)}</span>
                </div>
              </div>
            )}
            {detectionData?.material && (
              <div className="flex items-center">
                <Box className="h-4 w-4 mr-1.5 text-amber-500 flex-shrink-0" />
                <div>
                  <span className="font-medium">Material:</span>
                  <span className="ml-1">{detectionData.material}</span>
                </div>
              </div>
            )}
          </div>
          
        </CardContent>
      </Card>

      {showFullImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-[90vw] max-h-[90vh] bg-white shadow-lg rounded-lg overflow-hidden">
            {imageSrc && (
              <img 
                src={imageSrc} 
                alt="Full size image" 
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
            )}
            <Button
              variant="secondary"
              // @ts-ignore
              size="icon"
              onClick={() => setShowFullImage(false)}
              className="absolute top-2 right-2 bg-white bg-opacity-75 hover:bg-opacity-100 shadow-md z-10"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close full image view</span>
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
