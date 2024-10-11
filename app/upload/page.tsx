'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Upload, File, Loader2, Trash2, MapPin, ImageIcon, Compass, AlertCircle, X, Eye } from 'lucide-react'
import DashboardLayout from '../dashboard-layout'
import { Button } from "../../components/Login/ui/button"
import { Card, CardContent } from "../../components/Login/ui/card"
import { Progress } from "../../components/ui/progress"
import { useAuth } from '../../components/AuthProvider'
import { storage, db } from '../../firebase'
import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject, getMetadata } from 'firebase/storage'
import { collection, addDoc, deleteDoc, doc, query, where, getDocs, orderBy, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore'
import FullScreenImageModal from '../../components/FullScreenImageModal'
import { Input } from "../../components/Login/ui/input"
import { useToast } from "../../components/ui/use-toast"
import EXIF from 'exif-js'
import { toast as hotToast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Badge } from "../../components/ui/badge"
import { Label } from "../../components/Login/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip"
import { AnimatePresence, motion } from 'framer-motion'

interface GPSData {
  lat: number;
  lng: number;
  alt: number;
}

interface ImageData {
  id: string;
  url: string;
  path: string;
  gps: GPSData;
  isLoading?: boolean;
}

export default function UploadPage() {
  const [filesToUpload, setFilesToUpload] = useState<Array<{id: string, file: File, gps?: {lat: number, lng: number, alt?: number}}>>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [gpsInput, setGpsInput] = useState<{[key: string]: {lat: string, lng: string, alt: string}}>({})
  const { toast } = useToast()
  const [key, setKey] = useState(0)
  const [duplicateImages, setDuplicateImages] = useState<string[]>([])
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [showDeleteWarning, setShowDeleteWarning] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      loadUserImages()
    }
  }, [user])

  useEffect(() => {
    if (user) {
      console.log("Setting up Firestore listener")
      try {
        const q = query(collection(db, 'users', user.uid, 'images'), orderBy('uploadedAt', 'desc'))
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
          console.log("Firestore snapshot received")
          const images = await Promise.all(querySnapshot.docs.map(async (doc) => {
            const data = doc.data()
            const storageRef = ref(storage, `users/${user.uid}/images/${data.fileName}`)
            const metadata = await getMetadata(storageRef)
            const gps = {
              lat: parseFloat(metadata.customMetadata?.gpsLat || '0'),
              lng: parseFloat(metadata.customMetadata?.gpsLng || '0'),
              alt: metadata.customMetadata?.gpsAlt ? parseFloat(metadata.customMetadata.gpsAlt) : undefined
            }
            return {
              id: doc.id,
              url: data.url,
              path: `users/${user.uid}/images/${data.fileName}`,
              gps: gps
            }
          }))
          setUploadedImages(images.map(img => ({
            ...img,
            gps: {
              ...img.gps,
              alt: img.gps.alt ?? 0 // Use 0 as default if alt is undefined
            }
          })))
        }, (error) => {
          console.error("Firestore listener error:", error)
        })

        return () => unsubscribe()
      } catch (error) {
        console.error("Error setting up Firestore listener:", error)
      }
    }
  }, [user])

  const loadUserImages = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      console.log("Loading user images from Storage")
      const imagesRef = ref(storage, `users/${user.uid}/images`)
      const imageList = await listAll(imagesRef)
      const imageData = await Promise.all(
        imageList.items.map(async (item) => {
          const url = await getDownloadURL(item)
          const metadata = await getMetadata(item)
          const gps = {
            lat: parseFloat(metadata.customMetadata?.gpsLat || '0'),
            lng: parseFloat(metadata.customMetadata?.gpsLng || '0'),
            alt: metadata.customMetadata?.gpsAlt ? parseFloat(metadata.customMetadata.gpsAlt) : undefined
          }
          return { url, path: item.fullPath, gps }
        })
      )
      const imageDataWithIds = imageData.map((img, index) => ({
        ...img,
        id: `img-${index}`
      }))
      setUploadedImages(imageDataWithIds.map(img => ({
        ...img,
        gps: { ...img.gps, alt: img.gps.alt ?? 0 }
      })))
      console.log("Images loaded successfully")
    } catch (error) {
      console.error("Error loading images:", error)
      toast({
        title: 'Error',
        description: 'Failed to load images. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const extractGpsData = useCallback((file: File): Promise<{ lat: number; lng: number; alt?: number } | undefined> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const exif = EXIF.readFromBinaryFile(e.target?.result as ArrayBuffer)
        if (exif && exif.GPSLatitude && exif.GPSLongitude) {
          const latDegrees = exif.GPSLatitude[0].numerator / exif.GPSLatitude[0].denominator
          const latMinutes = exif.GPSLatitude[1].numerator / exif.GPSLatitude[1].denominator
          const latSeconds = exif.GPSLatitude[2].numerator / exif.GPSLatitude[2].denominator
          const latDirection = exif.GPSLatitudeRef || "N"
          
          const lngDegrees = exif.GPSLongitude[0].numerator / exif.GPSLongitude[0].denominator
          const lngMinutes = exif.GPSLongitude[1].numerator / exif.GPSLongitude[1].denominator
          const lngSeconds = exif.GPSLongitude[2].numerator / exif.GPSLongitude[2].denominator
          const lngDirection = exif.GPSLongitudeRef || "E"
          
          let lat = latDegrees + latMinutes / 60 + latSeconds / 3600
          let lng = lngDegrees + lngMinutes / 60 + lngSeconds / 3600
          
          if (latDirection === "S") lat = -lat
          if (lngDirection === "W") lng = -lng
          
          const alt = exif.GPSAltitude ? exif.GPSAltitude.numerator / exif.GPSAltitude.denominator : undefined
          resolve({ lat, lng, alt })
        } else {
          resolve(undefined)
        }
      }
      reader.readAsArrayBuffer(file)
    })
  }, [])

  const processFiles = useCallback(async (files: Array<{id: string, file: File, gps?: {lat: number, lng: number, alt?: number}}>) => {
    const processedFiles = await Promise.all(
      files.map(async (fileObj) => {
        if (!fileObj.gps) {
          const gps = await extractGpsData(fileObj.file)
          return { ...fileObj, gps }
        }
        return fileObj
      })
    )
    return processedFiles
  }, [extractGpsData])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({ 
        id: Math.random().toString(36).substr(2, 9),
        file 
      }))
      const processedFiles = await processFiles(newFiles)
      
      // Check for duplicates
      const duplicates = processedFiles.filter(file => 
        uploadedImages.some(img => img.path.endsWith(file.file.name))
      ).map(file => file.file.name);
      
      setDuplicateImages(duplicates);

      setFilesToUpload((prev) => {
        const updated = [...prev, ...processedFiles]
        console.log('Updated filesToUpload:', updated)
        return updated
      })
    }
  }, [processFiles, uploadedImages])

  const handleGpsInput = useCallback((fileId: string, coord: 'lat' | 'lng' | 'alt', value: string) => {
    setGpsInput((prev) => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        [coord]: value,
      },
    }))
  }, [])

  const validateGpsData = useCallback(() => {
    for (const fileObj of filesToUpload) {
      const { id, gps } = fileObj;
      const manualGps = gpsInput[id];

      if (!gps && (!manualGps || !manualGps.lat || !manualGps.lng || !manualGps.alt)) {
        return false;
      }
    }
    return true;
  }, [filesToUpload, gpsInput]);

  const handleUpload = useCallback(async () => {
    if (!user) return;
    
    if (!validateGpsData()) {
      toast({
        title: 'GPS Data Missing',
        description: 'Please ensure all images have GPS data (either from the image or manually entered).',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const uploadPromises = filesToUpload.map(async (fileObj) => {
        const { id, file, gps } = fileObj
        const fileName = file.name
        const manualGps = gpsInput[id]

        if (!gps && (!manualGps || !manualGps.lat || !manualGps.lng || !manualGps.alt)) {
          hotToast.error('Please insert complete GPS data (lat, lng, alt) to upload')
          return null
        }

        const finalGps = gps || { 
          lat: parseFloat(manualGps.lat), 
          lng: parseFloat(manualGps.lng),
          alt: parseFloat(manualGps.alt)
        }
        const metadata = {
          customMetadata: {
            gpsLat: finalGps.lat.toString(),
            gpsLng: finalGps.lng.toString(),
            gpsAlt: finalGps.alt?.toString() ?? "0",
          },
        }

        // Check if an image with the same name already exists
        const existingImage = uploadedImages.find(img => img.path.endsWith(fileName))
        if (existingImage) {
          toast({
            title: 'Duplicate Image',
            description: `An image with the name "${fileName}" already exists.`,
            variant: 'destructive',
          });
          return null;
        }

        // Add a placeholder for the uploading image at the beginning of the array
        const placeholderId = Math.random().toString(36).substr(2, 9)
        setUploadedImages(prev => [{
          id: placeholderId,
          url: '',
          path: `users/${user.uid}/images/${fileName}`,
          gps: finalGps,
          isLoading: true
        } as ImageData, ...prev])

        const storageRef = ref(storage, `users/${user.uid}/images/${fileName}`)
        const uploadTask = uploadBytesResumable(storageRef, file, metadata)

        return new Promise<{ url: string; fileName: string; gps: typeof finalGps; placeholderId: string } | null>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              setProgress(progress)
            },
            (error) => {
              console.error('Upload error:', error)
              reject(error)
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
                console.log("File uploaded successfully:", fileName)

                // Add metadata to Firestore
                try {
                  await addDoc(collection(db, "users", user.uid, "images"), {
                    fileName: fileName,
                    url: downloadURL,
                    gps: {
                      lat: finalGps.lat,
                      lng: finalGps.lng,
                      alt: finalGps.alt
                    },
                    uploadedAt: serverTimestamp(),
                    detections: "N/A", // Initialize detections as "NA"
                  })
                  console.log("Metadata added to Firestore:", fileName)
                } catch (firestoreError) {
                  console.error("Error adding metadata to Firestore:", firestoreError)
                  throw firestoreError
                }

                resolve({ url: downloadURL, fileName, gps: finalGps, placeholderId })
              } catch (error) {
                console.error("Upload error:", error)
                reject(error)
              }
            }
          )
        })
      })

      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter(result => result !== null) as Array<{ url: string; fileName: string; gps: { lat: number; lng: number; alt: number }; placeholderId: string }>
      
      // Update uploaded images
      setUploadedImages(prev => prev.map(img => {
        const upload = successfulUploads.find(u => u.placeholderId === img.id)
        if (upload) {
          return {
            ...img,
            url: upload.url,
            isLoading: false
          }
        }
        return img
      }))

      // Clear all uploaded files and GPS inputs
      setFilesToUpload([])
      setGpsInput({})
      setKey(prevKey => prevKey + 1)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      toast({
        title: 'Upload Successful',
        description: `Successfully uploaded ${successfulUploads.length} file(s)`,
        variant: 'default',
      })

      setProgress(0)
    } catch (error) {
      console.error('Error uploading files:', error)
      toast({
        title: 'Upload Error',
        description: 'An error occurred while uploading files',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }, [user, filesToUpload, gpsInput, toast, validateGpsData, uploadedImages])

  const removeFile = useCallback((id: string) => {
    setFilesToUpload((prev) => {
      const updated = prev.filter((file) => file.id !== id)
      console.log('After removing file - filesToUpload:', updated)
      
      // Update duplicateImages
      const remainingDuplicates = duplicateImages.filter(fileName => 
        updated.some(file => file.file.name === fileName)
      );
      setDuplicateImages(remainingDuplicates);
      
      return updated
    })
    setGpsInput((prev) => {
      const newInput = { ...prev }
      delete newInput[id]
      console.log('After removing file - gpsInput:', newInput)
      return newInput
    })
  }, [duplicateImages])

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  const handleDeleteImage = async (imagePath: string) => {
    if (!user) return
    try {
      const storageRef = ref(storage, imagePath)
      await deleteObject(storageRef)

      // Delete from Firestore
      const fileName = imagePath.split('/').pop() ?? '';
      const q = query(collection(db, 'users', user.uid, 'images'), where('fileName', '==', fileName))
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach(async (doc) => {
        try {
          await deleteDoc(doc.ref)
          console.log("Deleted Firestore document for:", fileName)
        } catch (error) {
          console.error("Error deleting Firestore document:", error)
        }
      })

      // Check if the image is in the detections collection and delete it if present
      const detectionsQuery = query(collection(db, 'users', user.uid, 'detections'), where('fileName', '==', fileName))
      const detectionsSnapshot = await getDocs(detectionsQuery)
      detectionsSnapshot.forEach(async (doc) => {
        try {
          await deleteDoc(doc.ref)
          console.log("Deleted detection document for:", fileName)
        } catch (error) {
          console.error("Error deleting detection document:", error)
        }
      })

      // Update local state immediately
      setUploadedImages((prevImages) => prevImages.filter((img) => img.path !== imagePath))

      // Remove the deleted image from localStorage
      const savedImages = JSON.parse(localStorage.getItem('selectedImages') ?? '[]')
      const updatedSavedImages = savedImages.filter((img: string) => !img.endsWith(fileName ?? ''));
      localStorage.setItem('selectedImages', JSON.stringify(updatedSavedImages))

      toast({
        title: 'Image Deleted',
        description: 'The image has been successfully deleted from the database.',
        variant: 'default',
      })

      // Force a refresh of the model page
      router.refresh()
    } catch (error) {
      console.error('Error deleting image:', error)
      toast({
        title: 'Delete Error',
        description: 'Failed to delete the image. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map((file) => ({ 
        id: Math.random().toString(36).substr(2, 9),
        file 
      }))
      processFiles(newFiles).then(processedFiles => {
        setFilesToUpload((prev) => {
          const updated = [...prev, ...processedFiles]
          console.log('Updated filesToUpload:', updated)
          return updated
        })

        // Check for duplicates
        const duplicates = processedFiles.filter(file => 
          uploadedImages.some(img => img.path.endsWith(file.file.name))
        ).map(file => file.file.name);
        
        setDuplicateImages(duplicates);
      })
    }
  }, [processFiles, uploadedImages])

  return (
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-b from-blue-50 to-white min-h-screen">
        <h1 className="text-4xl font-bold mb-8 text-blue-800">Upload Image Data</h1>
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-6 text-blue-700">Select Files</h2>
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center mb-8 transition-all duration-300 ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-blue-300 hover:border-blue-500'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                ref={fileInputRef}
                key={key}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className={`mx-auto h-16 w-16 mb-4 transition-colors duration-300 ${
                  isDragging ? 'text-blue-600' : 'text-blue-500'
                }`} />
                <p className={`font-semibold text-lg mb-2 transition-colors duration-300 ${
                  isDragging ? 'text-blue-700' : 'text-blue-600'
                }`}>
                  {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </label>
            </div>
            {filesToUpload.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-blue-700">Selected Files</h3>
                <ul className="space-y-4">
                  {filesToUpload.map((fileObj) => (
                    <li key={fileObj.id} className="bg-blue-50 p-4 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-grow">
                          <File className="h-8 w-8 text-blue-500 flex-shrink-0" />
                          <div className="flex-grow">
                            <p className="font-medium text-gray-800">{fileObj.file.name}</p>
                            <p className="text-sm text-gray-500">{(fileObj.file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        {fileObj.gps ? (
                          <Badge variant="secondary" className="text-green-700 bg-green-100 ml-2">
                            <MapPin className="h-3 w-3 mr-1" />
                            GPS Data Available
                          </Badge>
                        ) : (
                          <div className="flex space-x-2">
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="Latitude"
                              value={gpsInput[fileObj.id]?.lat || ''}
                              onChange={(e) => handleGpsInput(fileObj.id, 'lat', e.target.value)}
                              className="w-43 text-xs"
                            />
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="Longitude"
                              value={gpsInput[fileObj.id]?.lng || ''}
                              onChange={(e) => handleGpsInput(fileObj.id, 'lng', e.target.value)}
                              className="w-43 text-xs"
                            />
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="Altitude"
                              value={gpsInput[fileObj.id]?.alt || ''}
                              onChange={(e) => handleGpsInput(fileObj.id, 'alt', e.target.value)}
                              className="w-43 text-xs"
                            />
                          </div>
                        )}
                        <button onClick={() => removeFile(fileObj.id)} className="text-red-500 hover:text-red-700 transition-colors duration-300 ml-2">
                          <Trash2 className="h-6 w-6" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {uploading && (
              <div className="mb-6">
                <Progress value={progress} className="w-full h-2" />
                <p className="text-sm text-gray-600 mt-2 text-center">Uploading... {progress.toFixed(0)}%</p>
              </div>
            )}
            <Button
              onClick={handleUpload}
              disabled={filesToUpload.length === 0 || uploading || !validateGpsData()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Files
                </span>
              )}
            </Button>
            {duplicateImages.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center text-yellow-700">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">
                    {duplicateImages.length === 1
                      ? "An image has already been uploaded to the gallery."
                      : `${duplicateImages.length} images have already been uploaded to the gallery.`}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-6 text-blue-700">Image Gallery</h2>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                <span className="ml-4 text-lg text-gray-600">Loading images...</span>
              </div>
            ) : uploadedImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square overflow-hidden rounded-lg shadow-md">
                      {image.isLoading ? (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        </div>
                      ) : (
                        <img 
                          src={image.url} 
                          alt={`Uploaded image ${image.id}`} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onClick={() => handleImageClick(image.url)}
                        />
                      )}
                    </div>
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent text-white text-xs p-2">
                      <div className="flex items-center">
                        <MapPin className="inline-block w-3 h-3 mr-1" />
                        <span className="truncate">
                          {image.gps ? 
                            `${image.gps.lat.toFixed(6)}, ${image.gps.lng.toFixed(6)}${image.gps.alt !== undefined ? `, ${image.gps.alt.toFixed(1)}m` : ''}` 
                            : 'No GPS data'
                          }
                        </span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 bg-white bg-opacity-25 hover:bg-opacity-100 text-black transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(image.url);
                        }}
                        disabled={image.isLoading}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive"
                        size="sm"
                        className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 bg-white bg-opacity-25 hover:bg-opacity-100 text-red-600 hover:text-red-700 transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(image.path);
                        }}
                        disabled={image.isLoading}
                        onMouseEnter={() => setShowDeleteWarning(true)}
                        onMouseLeave={() => setShowDeleteWarning(false)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-xl font-medium text-gray-600">No images uploaded yet</p>
                <p className="text-gray-500 mt-2">Upload some images to see them here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {showDeleteWarning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 bg-red-100 text-red-800 border border-red-300 p-3 rounded-lg shadow-lg max-w-xs z-50"
          >
            <p className="text-sm">
              Warning: Deleting an image will remove it from the entire database
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedImage && (
        <FullScreenImageModal imageUrl={selectedImage} onClose={closeModal} />
      )}
    </DashboardLayout>
  )
}