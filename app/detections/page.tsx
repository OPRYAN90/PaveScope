'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ZoomIn, Trash2, Upload, MapPin, Calendar, Image as ImageIcon, ChevronLeft, ChevronRight, X, Loader, Check } from 'lucide-react'
import DashboardLayout from '../dashboard-layout'
import { Button } from "../../components/Login/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/Login/ui/card"
import { useAuth } from '../../components/AuthProvider'
import { db } from '../../firebase'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, where, getDocs } from 'firebase/firestore'
import Link from 'next/link'
import { useToast } from "../../components/ui/use-toast"
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { calculateVolume } from './volumeCalculation'

interface Detection {
  id: string;
  imageUrl: string;
  fileName: string;
  gps: {
    lat: number;
    lng: number;
    alt?: number;
  };
  detections: any[];
  timestamp: any;
}

const drawBoundingBoxes = (imgElement: HTMLImageElement, detections: any[]): string => {
  const canvas = document.createElement('canvas')
  canvas.width = imgElement.naturalWidth
  canvas.height = imgElement.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return imgElement.src

  ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height)

  const scaleFactor = Math.min(canvas.width, canvas.height) / 1000
  const fontSize = Math.max(12, Math.round(16 * scaleFactor))
  const padding = Math.round(4 * scaleFactor)
  const labelHeight = fontSize + padding * 2

  detections.forEach((detection) => {
    const { box, score } = detection
    const { xmin, ymin, xmax, ymax } = box

    ctx.strokeStyle = 'red'
    ctx.lineWidth = Math.max(2, Math.round(2 * scaleFactor))
    ctx.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin)

    const scoreText = score.toFixed(2)
    ctx.font = `bold ${fontSize}px Arial`
    const textWidth = ctx.measureText(scoreText).width

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.fillRect(xmin, ymin - labelHeight, textWidth + padding * 2, labelHeight)

    ctx.fillStyle = 'red'
    ctx.fillText(scoreText, xmin + padding, ymin - padding)
  })

  return canvas.toDataURL()
}

const DetectionImage: React.FC<{ detection: Detection; onClick: () => void; onSelect: (id: string, selected: boolean) => void; isSelected: boolean; isSelectMode: boolean }> = ({ detection, onClick, onSelect, isSelected, isSelectMode }) => {
  const [imageSrc, setImageSrc] = useState(detection.imageUrl)
  const [isLoading, setIsLoading] = useState(true)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setIsLoading(true)
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      if (detection.detections && detection.detections.length > 0) {
        const newSrc = drawBoundingBoxes(img, detection.detections)
        setImageSrc(newSrc)
      }
      setIsLoading(false)
    }
    img.src = detection.imageUrl
  }, [detection])

  const detectionCount = detection.detections?.length || 0;
  const badgeColor = detectionCount === 0 ? 'bg-green-600' : 'bg-red-600';
  const textColor = detectionCount === 0 ? 'text-green-600' : 'text-red-600';

  const handleClick = () => {
    if (isSelectMode) {
      // Only allow selection if there are detections
      if (detectionCount > 0) {
        onSelect(detection.id, !isSelected)
      }
    } else {
      onClick()
    }
  }

  return (
    <div className="relative w-full h-48 cursor-pointer" onClick={handleClick}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={detection.fileName}
        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
      <Badge className={`absolute top-2 right-2 ${badgeColor} text-white`}>
        {detectionCount} Detection{detectionCount !== 1 ? 's' : ''}
      </Badge>
      {isSelectMode && detectionCount > 0 && (
        <div className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-white'} flex items-center justify-center`}>
          {isSelected && <Check className="text-white" size={16} />}
        </div>
      )}
    </div>
  )
}

const DetailedView: React.FC<{ detection: Detection; onClose: () => void; onPrev: () => void; onNext: () => void }> = ({ detection, onClose, onPrev, onNext }) => {
  const [imageSrc, setImageSrc] = useState(detection.imageUrl)
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [isBoundingBoxLoading, setIsBoundingBoxLoading] = useState(true)
  const [showControls, setShowControls] = useState(false)

  useEffect(() => {
    setIsImageLoading(true)
    setIsBoundingBoxLoading(true)

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      setIsImageLoading(false)
      if (detection.detections && detection.detections.length > 0) {
        setTimeout(() => {
          const newSrc = drawBoundingBoxes(img, detection.detections)
          setImageSrc(newSrc)
          setIsBoundingBoxLoading(false)
        }, 0)
      } else {
        setIsBoundingBoxLoading(false)
      }
    }
    img.src = detection.imageUrl
  }, [detection])

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-2xl font-bold text-gray-800">{detection.fileName}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex-grow overflow-auto">
          <div 
            className="relative"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            {(isImageLoading || isBoundingBoxLoading) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <div className="text-center">
                  <Loader className="w-12 h-12 animate-spin text-blue-600 mb-2" />
                  <p className="text-sm text-gray-600 font-medium">
                    {isImageLoading ? "Loading image..." : "Rendering detections..."}
                  </p>
                </div>
              </div>
            )}
            <img 
              src={imageSrc} 
              alt={detection.fileName} 
              className={`w-full h-auto ${(isImageLoading || isBoundingBoxLoading) ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            />
            <AnimatePresence>
              {showControls && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white/80 hover:bg-white"
                      onClick={onPrev}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white/80 hover:bg-white"
                      onClick={onNext}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="mr-2 h-4 w-4" />
              <span>
                {detection.gps.lat.toFixed(6)}, {detection.gps.lng.toFixed(6)}
                {detection.gps.alt !== undefined ? `, ${detection.gps.alt.toFixed(1)}m` : ''}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{new Date(detection.timestamp.toDate()).toLocaleString()}</span>
            </div>
            <div className="text-sm text-gray-600">
              <strong>Detections:</strong> {detection.detections?.length || 0}
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Detection Scores</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {detection.detections.map((det, index) => (
                  <div key={index} className="bg-gray-100 rounded p-2 text-sm">
                    Score: {det.score.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function DetectionsPage() {
  const [detections, setDetections] = useState<Detection[]>([])
  const [selectedImage, setSelectedImage] = useState<Detection | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedDetections, setSelectedDetections] = useState<Set<string>>(new Set())
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [showVolumeDialog, setShowVolumeDialog] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState('')
  const [calculatedVolume, setCalculatedVolume] = useState<number | null>(null)

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'users', user.uid, 'detections'), orderBy('timestamp', 'desc'))
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const detectionData: Detection[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Detection))
        setDetections(detectionData)
        setLoading(false)
      })

      return () => unsubscribe()
    }
  }, [user])

  const deleteDetection = async (detectionId: string, imageUrl: string) => {
    if (!user) return
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'detections', detectionId))

      const imageQuery = query(collection(db, 'users', user.uid, 'images'), where('url', '==', imageUrl))
      const imageSnapshot = await getDocs(imageQuery)
      
      if (!imageSnapshot.empty) {
        const imageDoc = imageSnapshot.docs[0]
        await updateDoc(imageDoc.ref, {
          processed: false
        })
      }

      toast({
        title: "Detection deleted",
        description: "The detection has been removed and the image is available for inference again.",
      })
    } catch (error) {
      console.error("Error deleting detection:", error)
      toast({
        title: "Error",
        description: "Failed to delete the detection. Please try again.",
        variant: "destructive",
      })
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % detections.length)
    setSelectedImage(detections[(currentImageIndex + 1) % detections.length])
  }

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + detections.length) % detections.length)
    setSelectedImage(detections[(currentImageIndex - 1 + detections.length) % detections.length])
  }

  const handleImageClick = (detection: Detection) => {
    setSelectedImage(detection)
    setCurrentImageIndex(detections.indexOf(detection))
  }

  const handleSelectDetection = (id: string, selected: boolean) => {
    const detection = detections.find(d => d.id === id);
    if (detection && detection.detections && detection.detections.length > 0) {
      setSelectedDetections(prev => {
        const newSet = new Set(prev)
        if (selected) {
          newSet.add(id)
        } else {
          newSet.delete(id)
        }
        return newSet
      })
    }
  }

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode)
    if (isSelectMode) {
      setSelectedDetections(new Set())
    }
  }

  const handleCalculateVolume = async () => {
    if (selectedDevice && selectedDetections.size > 0) {
      const selectedDetectionObjects = detections.filter(d => selectedDetections.has(d.id))
      const phoneHeight = 1.5 // meters, adjust as needed
      const imageWidth = 4032 // pixels, adjust based on device
      const imageHeight = 3024 // pixels, adjust based on device
      
      const volume = await calculateVolume(
        selectedDetectionObjects.filter(d => d.gps.alt !== undefined) as import("./types").Detection[],
        phoneHeight,
        imageWidth,
        imageHeight
      )      
      setCalculatedVolume(volume)
      
      toast({
        title: "Volume Calculated",
        description: `The total volume of selected potholes is ${volume.toFixed(2)} cubic meters.`,
      })
      setShowVolumeDialog(false)
    } else {
      toast({
        title: "Error",
        description: "Please select a device and at least one image.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 tracking-tight">Detections Gallery</h1>
          <div className="space-x-4">
            <Button
              onClick={toggleSelectMode}
              variant={isSelectMode ? "secondary" : "outline"}
              className="transition-all duration-300"
            >
              {isSelectMode ? "Cancel Selection" : "Select Images"}
            </Button>
            {isSelectMode && (
              <Button
                onClick={() => setShowVolumeDialog(true)}
                disabled={selectedDetections.size === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
              >
                Calculate Volume ({selectedDetections.size})
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="overflow-hidden shadow-lg">
                  <CardContent className="p-0">
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <Loader className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  </CardContent>
                  <CardContent className="p-4">
                    <Skeleton className="w-3/4 h-6 mb-2" />
                    <Skeleton className="w-full h-4 mb-2" />
                    <Skeleton className="w-1/2 h-4 mb-4" />
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Skeleton className="w-2/5 h-10" />
                    <Skeleton className="w-2/5 h-10" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : detections.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ staggerChildren: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {detections.map((detection) => {
                const detectionCount = detection.detections?.length || 0;
                const textColor = detectionCount === 0 ? 'text-green-600' : 'text-red-600';

                return (
                  <motion.div
                    key={detection.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg">
                      <CardHeader className="p-0">
                        <DetectionImage 
                          detection={detection} 
                          onClick={() => !isSelectMode && handleImageClick(detection)}
                          onSelect={handleSelectDetection}
                          isSelected={selectedDetections.has(detection.id)}
                          isSelectMode={isSelectMode}
                        />
                      </CardHeader>
                      <CardContent className="p-4">
                        <CardTitle className="text-lg font-semibold text-blue-700 mb-2 truncate">
                          {detection.fileName}
                        </CardTitle>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span className="truncate">
                            {detection.gps.lat.toFixed(6)}, {detection.gps.lng.toFixed(6)}
                            {detection.gps.alt !== undefined ? `, ${detection.gps.alt.toFixed(1)}m` : ''}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>{new Date(detection.timestamp.toDate()).toLocaleString()}</span>
                        </div>
                        <div className={`flex items-center text-sm ${textColor} mt-2`}>
                          <ImageIcon className="mr-2 h-4 w-4" />
                          <span>{detectionCount} Detection{detectionCount !== 1 ? 's' : ''}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <Button 
                          variant="outline" 
                          onClick={() => handleImageClick(detection)} 
                          className="w-full mr-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 hover:border-blue-300 transition-all duration-300"
                        >
                          <ZoomIn className="mr-2 h-4 w-4" /> View Details
                        </Button>
                        <Button 
                          onClick={() => deleteDetection(detection.id, detection.imageUrl)} 
                          variant="destructive"
                          className="w-full ml-2 bg-red-50 hover:bg-red-100 text-red-600 border-red-200 hover:border-red-300 transition-all duration-300"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="text-center p-8 shadow-lg hover:shadow-xl transition-all duration-300 bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg">
                <ImageIcon className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                <CardTitle className="text-2xl font-semibold text-blue-700 mb-2">No detections yet</CardTitle>
                <p className="text-gray-600 mb-6">Run inference on images to see AI detections here.</p>
                <Link href="/model">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300 rounded-full px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl">
                    Go to Model Page
                  </Button>
                </Link>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {selectedImage && (
        <DetailedView
          detection={selectedImage}
          onClose={() => setSelectedImage(null)}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}

      <Dialog open={showVolumeDialog} onOpenChange={setShowVolumeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calculate Volume</DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <p>Select your device:</p>
            <Select onValueChange={setSelectedDevice}>
              <SelectTrigger>
                <SelectValue placeholder="Select device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iphone14pro">iPhone 14 Pro (Main Camera, 4:3)</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleCalculateVolume}>
              Calculate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}