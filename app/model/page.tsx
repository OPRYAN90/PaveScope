'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Login/ui/card"
import { Button } from "../../components/Login/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select"
import { Slider } from "../../components/ui/slider"
import { Switch } from "../../components/ui/switch"
import { Label } from "../../components/Login/ui/label"
import { Save, RefreshCw, Play, AlertCircle, X, Image as ImageIcon, Upload, Settings, Trash2, Loader2, MapPin } from 'lucide-react'
import { Alert, AlertDescription } from "../../components/ui/alert"
import { ScrollArea } from "../../components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog"
import { Checkbox } from "../../components/ui/checkbox"
import { useAuth } from '../../components/AuthProvider'
import { storage, db } from '../../firebase'
import { collection, query, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, getDownloadURL } from 'firebase/storage'
import { runInference } from '../../lib/huggingface'
import { useToast } from "../../components/ui/use-toast"
import { useRouter } from 'next/navigation'

// Update the interface for image data
interface ImageData {
  url: string;
  path: string;
  gps: {
    lat: number;
    lng: number;
    alt?: number;
  };
}

export default function ModelPage() {
  const [modelType, setModelType] = useState('yolov8')
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5)
  const [useGPU, setUseGPU] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedImages')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [showConfidenceWarning, setShowConfidenceWarning] = useState(false)
  const [showGPUWarning, setShowGPUWarning] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [availableImages, setAvailableImages] = useState<string[]>([])
  const [selectedGalleryImages, setSelectedGalleryImages] = useState<string[]>([])
  const [userImages, setUserImages] = useState<ImageData[]>([])
  const [isLoadingImages, setIsLoadingImages] = useState(true)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const { user } = useAuth()
  const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({})
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserImages()
    }
  }, [user])

  useEffect(() => {
    // This effect will run whenever userImages changes
    if (userImages.length > 0) {
      // Filter out any selected images that are no longer in userImages
      setSelectedImages(prevSelected => 
        prevSelected.filter(selectedImg => 
          userImages.some(userImg => userImg.url === selectedImg)
        )
      )
    }
  }, [userImages])

  const fetchUserImages = async () => {
    if (!user) return
    setIsLoadingImages(true)
    try {
      const q = query(collection(db, 'users', user.uid, 'images'), orderBy('uploadedAt', 'desc'))
      const querySnapshot = await getDocs(q)
      const images = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const data = doc.data()
        const storageRef = ref(storage, `users/${user.uid}/images/${data.fileName}`)
        const url = await getDownloadURL(storageRef)
        return {
          url,
          path: `users/${user.uid}/images/${data.fileName}`,
          gps: {
            lat: data.gps.lat,
            lng: data.gps.lng,
            alt: data.gps.alt
          }
        }
      }))
      setUserImages(images)
      setAvailableImages(images.map(img => img.url))
      // Initialize loading state for each image
      const initialLoadingState = images.reduce((acc, img) => {
        acc[img.url] = true
        return acc
      }, {} as { [key: string]: boolean })
      setLoadingImages(initialLoadingState)
    } catch (error) {
      console.error('Error fetching user images:', error)
    } finally {
      setIsLoadingImages(false)
    }
  }

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

  // Add this useEffect to save selectedImages to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedImages', JSON.stringify(selectedImages))
  }, [selectedImages])

  const handleConfidenceChange = (value: number[]) => {
    // Don't update the actual value
    // setConfidenceThreshold(value[0])
    setShowConfidenceWarning(true)
  }

  const handleGPUChange = (checked: boolean) => {
    // Don't update the actual value
    // setUseGPU(checked)
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

  const handleRunInference = async () => {
    if (selectedImages.length === 0) {
      toast({
        title: 'No images selected',
        description: 'Please select at least one image for inference.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const results = await Promise.all(
        selectedImages.map(async (imageUrl) => {
          const result = await runInference(imageUrl)
          return { imageUrl, result }
        })
      )

      // Process and save results
      for (const { imageUrl, result } of results) {
        const imageData = userImages.find(img => img.url === imageUrl)
        if (imageData && user) {
          await addDoc(collection(db, 'users', user.uid, 'detections'), {
            imageUrl: imageUrl,
            fileName: imageData.path.split('/').pop(),
            gps: imageData.gps,
            detections: result,
            timestamp: serverTimestamp(),
          })
        }
      }

      toast({
        title: 'Inference completed',
        description: `Processed ${results.length} image(s) successfully.`,
        variant: 'default',
      })

      // Optionally, navigate to the detections page
      router.push('/detections')
    } catch (error) {
      console.error('Error running inference:', error)
      toast({
        title: 'Inference failed',
        description: 'An error occurred while processing the images.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openGallery = () => {
    setIsGalleryOpen(true)
  }

  const handleImageSelection = (image: string) => {
    setSelectedGalleryImages(prev => 
      prev.includes(image) 
        ? prev.filter(img => img !== image)
        : [...prev, image]
    )
  }

  const handleUploadSelectedImages = () => {
    setIsUploadingImages(true)
    // Simulate an upload delay
    setTimeout(() => {
      setSelectedImages(prev => {
        const newSelectedImages = [...prev, ...selectedGalleryImages]
        localStorage.setItem('selectedImages', JSON.stringify(newSelectedImages))
        return newSelectedImages
      })
      setSelectedGalleryImages([])
      setIsGalleryOpen(false)
      setIsUploadingImages(false)
    }, 1000)
  }

  const removeSelectedImage = (imageToRemove: string) => {
    setSelectedImages(prev => {
      const newSelectedImages = prev.filter(img => img !== imageToRemove)
      localStorage.setItem('selectedImages', JSON.stringify(newSelectedImages))
      return newSelectedImages
    })
  }

  const handleImageLoad = (imageUrl: string) => {
    setLoadingImages(prev => ({ ...prev, [imageUrl]: false }))
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen bg-blue-50">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6 text-blue-800">Model Inference Settings</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-blue-700">Model Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 flex-grow flex flex-col justify-between">
                <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <Settings className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Model Type:</span>
                      <span className="text-sm font-bold text-blue-800">{modelType}</span>
                    </div>
                    <Select value={modelType} onValueChange={setModelType}>
                      <SelectTrigger id="model-type" className="w-[180px]">
                        <SelectValue placeholder="Select model type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yolov8">YOLOv8</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="confidence-threshold" className="text-sm font-medium text-blue-700">Confidence Threshold</Label>
                      <span className="text-sm font-bold text-blue-800">{confidenceThreshold.toFixed(2)}</span>
                    </div>
                    <Slider
                      id="confidence-threshold"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[confidenceThreshold]}
                      onValueChange={handleConfidenceChange}
                      className="my-4"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <Label htmlFor="use-gpu" className="text-sm font-medium text-blue-700">Use GPU Acceleration</Label>
                    <Switch
                      id="use-gpu"
                      checked={useGPU}
                      onCheckedChange={handleGPUChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-blue-700">Inference Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 flex-grow flex flex-col justify-between">
                <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Selected Images:</span>
                      <span className="text-sm font-bold text-blue-800">{selectedImages.length}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedImages([])}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-grow">
                  <Button 
                    onClick={handleSaveChanges} 
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full h-full rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center justify-center p-4"
                  >
                    <Save className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Save Settings</span>
                  </Button>
                  <Button 
                    onClick={handleResetDefaults} 
                    variant="outline" 
                    className="w-full h-full rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center justify-center p-4 border-blue-300 hover:bg-blue-50"
                  >
                    <RefreshCw className="w-6 h-6 mb-2 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Reset Defaults</span>
                  </Button>
                  <Button 
                    onClick={handleRunInference} 
                    className="bg-green-600 hover:bg-green-700 text-white w-full h-full rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center justify-center p-4"
                  >
                    <Play className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Run Inference</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="flex-grow overflow-hidden m-6 mt-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold text-blue-700">Selected Image Gallery</CardTitle>
            <div>
              <Button variant="outline" onClick={openGallery}>
                <span className="flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Select Images
                </span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-full">
            <ScrollArea className="h-[calc(100vh-400px)]">
              {selectedImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {selectedImages.map((imageUrl, index) => {
                    const imageData = userImages.find(img => img.url === imageUrl)
                    return (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={imageUrl}
                          alt={`Selected image ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg shadow-md"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"></div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900"
                            onClick={() => removeSelectedImage(imageUrl)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {imageData && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate z-10">
                            <MapPin className="inline-block w-3 h-3 mr-1" />
                            {`${imageData.gps.lat.toFixed(6)}, ${imageData.gps.lng.toFixed(6)}${imageData.gps.alt !== undefined ? `, ${imageData.gps.alt.toFixed(1)}m` : ''}`}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div 
                  className="flex flex-col items-center justify-center h-full text-gray-500 cursor-pointer transition-opacity duration-200"
                  onClick={openGallery}
                >
                  <ImageIcon className="w-16 h-16 mb-4" />
                  <p className="text-lg font-semibold">No images selected</p>
                  <p className="text-sm">Click here to select images</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogContent className="max-w-7xl w-full max-h-[90vh] p-0 overflow-hidden flex flex-col">
            <DialogHeader className="p-6 pb-4 bg-gray-100 border-b border-gray-200 flex-shrink-0">
              <DialogTitle className="text-3xl font-bold text-blue-800 flex items-center">
                <ImageIcon className="w-8 h-8 mr-3 text-blue-600" />
                Select Images
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Choose images for model inference
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-grow p-6 overflow-auto">
              {isLoadingImages ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {userImages
                    .filter(image => !selectedImages.includes(image.url))
                    .map((image, index) => (
                      <div key={index} className="relative group aspect-square">
                        {loadingImages[image.url] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                          </div>
                        )}
                        <img 
                          src={image.url} 
                          alt={`Gallery image ${index + 1}`} 
                          className={`w-full h-full object-cover rounded-lg shadow-md cursor-pointer transition-transform duration-200 ease-in-out transform hover:scale-105 ${loadingImages[image.url] ? 'opacity-0' : 'opacity-100'}`}
                          onLoad={() => handleImageLoad(image.url)}
                        />
                        <div 
                          className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"
                          onClick={() => handleImageSelection(image.url)}
                        ></div>
                        <div className="absolute top-2 right-2">
                          <Checkbox
                            checked={selectedGalleryImages.includes(image.url)}
                            onCheckedChange={() => handleImageSelection(image.url)}
                            className="h-5 w-5 border-2 border-white bg-blue-600 text-white"
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate z-10">
                          <MapPin className="inline-block w-3 h-3 mr-1" />
                          {`${image.gps.lat.toFixed(6)}, ${image.gps.lng.toFixed(6)}${image.gps.alt !== undefined ? `, ${image.gps.alt.toFixed(1)}m` : ''}`}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </ScrollArea>
            <div className="flex justify-between items-center p-6 bg-gray-100 border-t border-gray-200 flex-shrink-0">
              <Button variant="outline" onClick={() => setIsGalleryOpen(false)} className="flex items-center">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleUploadSelectedImages} 
                disabled={selectedGalleryImages.length === 0 || isUploadingImages} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUploadingImages ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>Select Images ({selectedGalleryImages.length})</>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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