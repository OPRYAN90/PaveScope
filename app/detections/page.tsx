'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ZoomIn, Trash2, Upload, MapPin, Calendar, Image as ImageIcon, ChevronLeft, ChevronRight, X, Loader, Check, DollarSign, Box, Layers, BarChart2 } from 'lucide-react'
import DashboardLayout from '../dashboard-layout'
import { Button } from "../../components/Login/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/Login/ui/card"
import { useAuth } from '../../components/AuthProvider'
import { db } from '../../firebase'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, where, getDocs, writeBatch } from 'firebase/firestore'
import Link from 'next/link'
import { useToast } from "../../components/ui/use-toast"
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { calculateVolume } from './volumeCalculation'
import { Separator } from "../../components/ui/seperator"
import { Input } from "../../components/Login/ui/input"

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
  volume?: number;
  material?: string;
  cost?: number;
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
      // Only allow selection if there are detections and volume hasn't been calculated yet
      if (detectionCount > 0 && detection.volume === undefined) {
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
      {isSelectMode && detectionCount > 0 && detection.volume === undefined && (
        <div className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-white'} flex items-center justify-center`}>
          {isSelected && <Check className="text-white" size={16} />}
        </div>
      )}
      {detection.volume !== undefined && (
        <Badge className="absolute bottom-2 right-2 bg-purple-600 text-white">
          Volume: {detection.volume.toFixed(2)} m³
        </Badge>
      )}
      {detection.cost !== undefined && (
        <Badge className="absolute bottom-2 left-2 bg-green-600 text-white">
          Cost: ${detection.cost.toFixed(2)}
        </Badge>
      )}
    </div>
  )
}

const MaterialOptions = [
  { name: "Hot Mix Asphalt", price: 70 },  // Average of $55 and $85
  { name: "Warm Mix Asphalt", price: 75 }, // Average of $60 and $90
  { name: "Cold Mix Asphalt", price: 37.5 }, // Average of $25 and $50
  { name: "Porous Asphalt", price: 92.5 }, // Average of $75 and $110
  { name: "Custom", price: 0 }, // Custom option with default price 0
];

const DetailedView: React.FC<{ detection: Detection; onClose: () => void; onPrev: () => void; onNext: () => void }> = ({ detection, onClose, onPrev, onNext }) => {
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [isBoundingBoxLoading, setIsBoundingBoxLoading] = useState(true)
  const [showControls, setShowControls] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [nextImage, setNextImage] = useState<string | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState(detection.material || '')
  const [customMaterial, setCustomMaterial] = useState('')
  const [customPrice, setCustomPrice] = useState(0)

  useEffect(() => {
    setIsImageLoading(true)
    setIsBoundingBoxLoading(true)

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      setIsImageLoading(false)
      if (detection.detections && detection.detections.length > 0) {
        const newSrc = drawBoundingBoxes(img, detection.detections)
        setNextImage(newSrc)
      } else {
        setNextImage(detection.imageUrl)
      }
      setIsBoundingBoxLoading(false)
    }
    img.src = detection.imageUrl
  }, [detection])

  useEffect(() => {
    if (nextImage) {
      setTimeout(() => {
        setCurrentImage(nextImage)
        setNextImage(null)
      }, 50) // Small delay to ensure smooth transition
    }
  }, [nextImage])

  const handlePrev = () => {
    setCurrentImage(null)
    setNextImage(null)
    setIsImageLoading(true)
    setIsBoundingBoxLoading(true)
    onPrev()
  }

  const handleNext = () => {
    setCurrentImage(null)
    setNextImage(null)
    setIsImageLoading(true)
    setIsBoundingBoxLoading(true)
    onNext()
  }

  const handleMaterialChange = (value: string) => {
    setSelectedMaterial(value)
    if (value !== 'Custom') {
      const selectedOption = MaterialOptions.find(option => option.name === value)
      if (selectedOption && detection.volume) {
        const newCost = selectedOption.price * detection.volume
        // Here you would update the detection's cost in your state and database
        // For example:
        // updateDetectionCost(detection.id, newCost)
      }
    }
  }

  const handleCustomMaterialChange = (value: string) => {
    setCustomMaterial(value)
  }

  const handleCustomPriceChange = (value: string) => {
    const price = parseFloat(value)
    setCustomPrice(isNaN(price) ? 0 : price)
    if (!isNaN(price) && detection.volume) {
      const newCost = price * detection.volume
      // Update the detection's cost in your state and database
      // updateDetectionCost(detection.id, newCost)
    }
  }

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
            className="relative w-full"
            style={{ paddingBottom: '75%' }} // 4:3 aspect ratio
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
            <div className="absolute inset-0">
              {currentImage && (
                <motion.img 
                  key={currentImage}
                  src={currentImage} 
                  alt={detection.fileName} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-contain"
                />
              )}
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
                        onClick={handlePrev}
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
                        onClick={handleNext}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                  <span>
                    {detection.gps.lat.toFixed(6)}, {detection.gps.lng.toFixed(6)}
                    {detection.gps.alt !== undefined ? `, ${detection.gps.alt.toFixed(1)}m` : ''}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4 text-green-500" />
                  <span>{new Date(detection.timestamp.toDate()).toLocaleString()}</span>
                </div>
                {detection.cost !== undefined && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                    <span><strong>Estimated Cost:</strong> ${detection.cost.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <ImageIcon className="mr-2 h-4 w-4 text-purple-500" />
                  <span><strong>Detections:</strong> {detection.detections?.length || 0}</span>
                </div>
                {detection.volume !== undefined && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Box className="mr-2 h-4 w-4 text-orange-500" />
                    <span><strong>Volume:</strong> {detection.volume.toFixed(2)} m³</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Layers className="mr-2 h-4 w-4 text-yellow-500" />
                  <span><strong>Material:</strong></span>
                  <Select value={selectedMaterial} onValueChange={handleMaterialChange}>
                    <SelectTrigger className="w-[180px] ml-2">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {MaterialOptions.map((option) => (
                        <SelectItem key={option.name} value={option.name}>
                          {option.name} {option.name !== 'Custom' && `($${option.price}/ton)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedMaterial === 'Custom' && (
                  <div className="flex items-center text-sm text-gray-600 mt-2">
                    <Input
                      type="text"
                      placeholder="Custom material name"
                      value={customMaterial}
                      onChange={(e) => handleCustomMaterialChange(e.target.value)}
                      className="w-[180px] mr-2"
                    />
                    <Input
                      type="number"
                      placeholder="Price per ton"
                      value={customPrice.toString()}
                      onChange={(e) => handleCustomPriceChange(e.target.value)}
                      className="w-[120px]"
                    />
                  </div>
                )}
                {detection.volume !== undefined && selectedMaterial && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                    <span>
                      <strong>Estimated Cost:</strong> $
                      {(detection.volume * (selectedMaterial === 'Custom' ? customPrice : (MaterialOptions.find(o => o.name === selectedMaterial)?.price || 0))).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Separator className="my-2" />
            <div>
              <div className="flex items-center mb-2">
                <BarChart2 className="mr-2 h-4 w-4 text-indigo-500" />
                <h3 className="text-sm font-semibold text-gray-700">Detection Scores</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="grid grid-cols-3 gap-2">
                  {detection.detections.map((det, index) => (
                    <div key={index} className="bg-white rounded shadow-sm p-2 text-center">
                      <div className="text-xs text-gray-500 mb-1">Detection {index + 1}</div>
                      <div className="text-sm font-semibold text-indigo-600">{det.score.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
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
  const [selectedDevice, setSelectedDevice] = useState('iphone14pro') // Set default device
  const [calculatedVolume, setCalculatedVolume] = useState<number | null>(null)
  const [totalVolume, setTotalVolume] = useState<number>(0)
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [customMaterial, setCustomMaterial] = useState('')
  const [customPrice, setCustomPrice] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)

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

  const handleCalculateVolumeAndCost = async () => {
    if (selectedMaterial && selectedDetections.size > 0) {
      setIsCalculating(true)
      const selectedDetectionObjects = detections.filter(d => selectedDetections.has(d.id))
      const phoneHeight = 1.5 // meters, adjust as needed
      const imageWidth = 4032 // pixels, adjust based on device
      const imageHeight = 3024 // pixels, adjust based on device
      
      try {
        const volumes = await Promise.all(selectedDetectionObjects.map(async (detection) => {
          if (detection.gps.alt !== undefined) {
            const volume = await calculateVolume(
              [detection] as import("./types").Detection[],
              phoneHeight,
              imageWidth,
              imageHeight
            )
            const materialPrice = selectedMaterial === 'Custom' ? customPrice : MaterialOptions.find(o => o.name === selectedMaterial)?.price || 0
            const cost = volume * materialPrice
            return { id: detection.id, volume, cost }
          }
          return { id: detection.id, volume: 0, cost: 0 }
        }))

        const totalVolume = volumes.reduce((sum, { volume }) => sum + volume, 0)
        const totalCost = volumes.reduce((sum, { cost }) => sum + cost, 0)
        setTotalVolume(totalVolume)

        // Update detections with calculated volumes and costs
        const updatedDetections = detections.map(detection => {
          const calculated = volumes.find(v => v.id === detection.id)
          return calculated ? { ...detection, volume: calculated.volume, material: selectedMaterial === 'Custom' ? customMaterial : selectedMaterial, cost: calculated.cost } : detection
        })
        setDetections(updatedDetections)

        // Update volumes, materials, and costs in Firestore
        const batch = writeBatch(db)
        volumes.forEach(({ id, volume, cost }) => {
          const detectionRef = doc(db, 'users', user!.uid, 'detections', id)
          batch.update(detectionRef, { 
            volume, 
            material: selectedMaterial === 'Custom' ? customMaterial : selectedMaterial, 
            cost 
          })
        })
        await batch.commit()

        toast({
          title: "Volume and Cost Calculated",
          description: `Total volume: ${totalVolume.toFixed(2)} m³. Total cost: $${totalCost.toFixed(2)}`,
        })
        setShowVolumeDialog(false)
      } catch (error) {
        console.error("Error calculating volume and cost:", error)
        toast({
          title: "Error",
          description: "An error occurred while calculating volume and cost. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsCalculating(false)
      }
    } else {
      toast({
        title: "Error",
        description: "Please select a material and at least one image.",
        variant: "destructive",
      })
    }
  }

  const prepareCSVData = () => {
    return detections.map(detection => ({
      'File Name': detection.fileName,
      'Latitude': detection.gps.lat,
      'Longitude': detection.gps.lng,
      'Altitude': detection.gps.alt || 'N/A',
      'Timestamp': new Date(detection.timestamp.toDate()).toLocaleString(),
      'Number of Detections': detection.detections?.length || 0,
      'Volume (m³)': detection.volume?.toFixed(2) || 'N/A',
      'Material': detection.material || 'N/A',
      'Cost': detection.cost?.toFixed(2) || 'N/A'
    }));
  };

  const exportToCSV = () => {
    const csvContent = [
      Object.keys(prepareCSVData()[0]).join(','), // Header
      ...prepareCSVData().map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "detections_export.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
                Calculate Volume & Cost ({selectedDetections.size})
              </Button>
            )}
            {totalVolume > 0 && (
              <span className="text-lg font-semibold text-purple-600">
                Total Volume: {totalVolume.toFixed(2)} m³
              </span>
            )}
            {detections.length > 0 && (
              <Button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Upload className="mr-2 h-4 w-4" />
                Export CSV
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
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white bg-opacity-80 border-2 border-transparent hover:border-blue-300 cursor-pointer">
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
        <DialogContent className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-800 mb-4">Calculate Volume and Cost</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Device:</label>
              <Select value="iPhone 14 Pro (Main Camera, 4:3)">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iPhone 14 Pro (Main Camera, 4:3)">iPhone 14 Pro (Main Camera, 4:3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select material:</label>
              <Select onValueChange={setSelectedMaterial}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {MaterialOptions.map((option) => (
                    <SelectItem key={option.name} value={option.name}>
                      {option.name} {option.name !== 'Custom' && `($${option.price}/m³)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedMaterial === 'Custom' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Custom Material Details:</label>
                <Input
                  type="text"
                  placeholder="Enter custom material name"
                  value={customMaterial}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomMaterial(e.target.value)}
                  className="w-full"
                />
                <Input
                  type="number"
                  placeholder="Enter price per cubic meter ($/m³)"
                  value={customPrice === 0 ? '' : customPrice.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomPrice(parseFloat(e.target.value) || 0)}
                  className="w-full"
                />
              </div>
            )}
            <Button 
              onClick={handleCalculateVolumeAndCost} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isCalculating}
            >
              {isCalculating ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                'Calculate Volume and Cost'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}