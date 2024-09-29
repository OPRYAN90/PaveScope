'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Upload, File, Loader2, Trash2, MapPin, ImageIcon, Compass } from 'lucide-react'
import DashboardLayout from '../dashboard-layout'
import { Button } from "../../components/Login/ui/button"
import { Card, CardContent } from "../../components/Login/ui/card"
import { Progress } from "../../components/ui/progress"
import { useAuth } from '../../components/AuthProvider'
import { storage, db } from '../../firebase'
import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject, getMetadata } from 'firebase/storage'
import { collection, addDoc, deleteDoc, doc, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore'
import FullScreenImageModal from '../../components/FullScreenImageModal'
import { Input } from "../../components/Login/ui/input"
import { useToast } from "../../components/ui/use-toast"
import EXIF from 'exif-js'

export default function UploadPage() {
  const [filesToUpload, setFilesToUpload] = useState<Array<{id: string, file: File, gps?: {lat: number, lng: number, alt?: number}}>>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedImages, setUploadedImages] = useState<Array<{url: string, path: string, gps?: {lat: number, lng: number, alt?: number}}>>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [gpsInput, setGpsInput] = useState<{[key: string]: {lat: string, lng: string, alt: string}}>({})
  const { toast } = useToast()
  const [key, setKey] = useState(0) // Add this line

  // Add this useEffect for debugging
  useEffect(() => {
    console.log('Current filesToUpload:', filesToUpload)
    console.log('Current gpsInput:', gpsInput)
  }, [filesToUpload, gpsInput])

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
          setUploadedImages(images)
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
      setUploadedImages(imageData)
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
          const lat = exif.GPSLatitude[0] + exif.GPSLatitude[1] / 60 + exif.GPSLatitude[2] / 3600
          const lng = exif.GPSLongitude[0] + exif.GPSLongitude[1] / 60 + exif.GPSLongitude[2] / 3600
          const alt = exif.GPSAltitude ? exif.GPSAltitude : undefined
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
      setFilesToUpload((prev) => {
        const updated = [...prev, ...processedFiles]
        console.log('Updated filesToUpload:', updated)
        return updated
      })
    }
  }, [processFiles])

  const handleGpsInput = useCallback((fileId: string, coord: 'lat' | 'lng' | 'alt', value: string) => {
    // Validate input to ensure it's a valid number
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      setGpsInput((prev) => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          [coord]: value,
        },
      }))
    }
  }, [])

  const handleUpload = useCallback(async () => {
    if (!user) return
    setUploading(true)
    setProgress(0)

    try {
      const uploadPromises = filesToUpload.map(async (fileObj) => {
        const { id, file, gps } = fileObj
        const fileName = file.name
        const manualGps = gpsInput[id]

        if (!gps && (!manualGps || !manualGps.lat || !manualGps.lng)) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: `GPS data missing for ${fileName}`,
          })
          return null
        }

        const finalGps = gps || { 
          lat: parseFloat(manualGps.lat), 
          lng: parseFloat(manualGps.lng),
          alt: manualGps.alt ? parseFloat(manualGps.alt) : null
        }
        const metadata = {
          customMetadata: {
            gpsLat: finalGps.lat.toString(),
            gpsLng: finalGps.lng.toString(),
            gpsAlt: finalGps.alt?.toString() ?? '', // Ensure it's a string or empty
          },
        }

        const storageRef = ref(storage, `users/${user.uid}/images/${fileName}`)
        const uploadTask = uploadBytesResumable(storageRef, file, metadata)

        return new Promise<{ url: string; fileName: string; gps: typeof finalGps } | null>((resolve, reject) => {
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
                      alt: finalGps.alt !== null ? Number(finalGps.alt) : null // Ensure it's a primitive number or null
                    },
                    uploadedAt: new Date(),
                  })
                  console.log("Metadata added to Firestore:", fileName)
                } catch (firestoreError) {
                  console.error("Error adding metadata to Firestore:", firestoreError)
                  throw firestoreError
                }

                resolve({ url: downloadURL, fileName, gps: finalGps })
              } catch (error) {
                console.error("Upload error:", error)
                reject(error)
              }
            }
          )
        })
      })

      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter(result => result !== null) as Array<{ url: string; fileName: string; gps: { lat: number; lng: number; alt?: number | null } }>
      
      // Update uploaded images and save metadata to Firestore
      const newUploadedImages = successfulUploads.map(result => ({
        url: result.url,
        path: `users/${user.uid}/images/${result.fileName}`,
        gps: result.gps // Ensure GPS data is included
      }))

      // Remove this line:
      // setUploadedImages((prev) => [...prev, ...newUploadedImages])

      // The Firestore listener will automatically update the state

      // Clear all uploaded files and GPS inputs
      setFilesToUpload([])
      setGpsInput({})
      setKey(prevKey => prevKey + 1) // Force re-render
      if (fileInputRef.current) {
        fileInputRef.current.value = '' // Reset file input
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
  }, [user, filesToUpload, gpsInput, toast])

  const removeFile = useCallback((id: string) => {
    setFilesToUpload((prev) => {
      const updated = prev.filter((file) => file.id !== id)
      console.log('After removing file - filesToUpload:', updated)
      return updated
    })
    setGpsInput((prev) => {
      const newInput = { ...prev }
      delete newInput[id]
      console.log('After removing file - gpsInput:', newInput)
      return newInput
    })
  }, [])

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  const handleDeleteImage = async (imagePath: string) => {
    if (!user) return
    try {
      console.log("Deleting image:", imagePath)
      const imageRef = ref(storage, imagePath)
      await deleteObject(imageRef)

      // Delete from Firestore
      const fileName = imagePath.split('/').pop()
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

      // Update local state immediately
      setUploadedImages((prevImages) => prevImages.filter((img) => img.path !== imagePath))

      toast({
        title: 'Image Deleted',
        description: 'The image has been successfully deleted.',
        variant: 'default',
      })
    } catch (error) {
      console.error('Error deleting image:', error)
      toast({
        title: 'Delete Error',
        description: 'Failed to delete the image. Please try again.',
        variant: 'destructive',
      })
    }
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
                ref={fileInputRef}
                key={key} // Add this line
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                <p className="text-blue-600 font-semibold">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
              </label>
            </div>
            {filesToUpload.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 text-blue-800">Selected Files:</h2>
                <ul className="space-y-4">
                  {filesToUpload.map((fileObj) => (
                    <li key={fileObj.id} className="flex items-center justify-between bg-blue-50 p-4 rounded">
                      <div className="flex-grow">
                        <div className="flex items-center">
                          <File className="h-5 w-5 text-blue-500 mr-2" />
                          <span className="text-sm text-gray-700">{fileObj.file.name}</span>
                        </div>
                        {fileObj.gps ? (
                          <div className="mt-2 text-sm text-green-600">
                            GPS: {fileObj.gps.lat.toFixed(6)}, {fileObj.gps.lng.toFixed(6)}
                            {fileObj.gps.alt !== undefined && `, Alt: ${fileObj.gps.alt.toFixed(2)}m`}
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center space-x-2">
                            <Input
                              type="number"
                              step="any"
                              placeholder="Latitude"
                              value={gpsInput[fileObj.id]?.lat || ''}
                              onChange={(e) => handleGpsInput(fileObj.id, 'lat', e.target.value)}
                              className="w-24 text-sm"
                            />
                            <Input
                              type="number"
                              step="any"
                              placeholder="Longitude"
                              value={gpsInput[fileObj.id]?.lng || ''}
                              onChange={(e) => handleGpsInput(fileObj.id, 'lng', e.target.value)}
                              className="w-24 text-sm"
                            />
                            <Input
                              type="number"
                              step="any"
                              placeholder="Altitude"
                              value={gpsInput[fileObj.id]?.alt || ''}
                              onChange={(e) => handleGpsInput(fileObj.id, 'alt', e.target.value)}
                              className="w-24 text-sm"
                            />
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <Compass className="h-4 w-4 text-blue-500" />
                          </div>
                        )}
                      </div>
                      <button onClick={() => removeFile(fileObj.id)} className="text-red-500 hover:text-red-700 ml-2">
                        <Trash2 className="h-5 w-5" />
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
              disabled={filesToUpload.length === 0 || uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">Image Gallery</h2>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <span className="ml-2 text-gray-600">Loading images...</span>
              </div>
            ) : uploadedImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate z-10">
                      {image.gps ? 
                        `${image.gps.lat.toFixed(6)}, ${image.gps.lng.toFixed(6)}${image.gps.alt !== undefined ? `, ${image.gps.alt.toFixed(1)}m` : ''}` 
                        : 'No GPS data'
                      }
                    </div>
                    <img 
                      src={image.url} 
                      alt={`Uploaded image ${index + 1}`} 
                      className="w-full h-40 object-cover rounded-lg cursor-pointer"
                      onClick={() => handleImageClick(image.url)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="mr-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(image.url);
                        }}
                      >
                        View
                      </Button>
                    </div>
                    <button 
                      className="absolute bottom-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(image.path);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto h-12 w-12 text-blue-300 mb-4" />
                <p className="text-gray-500">No images uploaded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedImage && (
        <FullScreenImageModal imageUrl={selectedImage} onClose={closeModal} />
      )}
    </DashboardLayout>
  )
}