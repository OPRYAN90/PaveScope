'use client'

import React, { useState, useEffect } from 'react'
import { Upload, File, X, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react'
import DashboardLayout from '../dashboard-layout'
import { Button } from "../../components/Login/ui/button"
import { Card, CardContent } from "../../components/Login/ui/card"
import { Progress } from "../../components/ui/progress"
import { useAuth } from '../../components/AuthProvider'
import { storage } from '../../firebase'
import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from 'firebase/storage'
import FullScreenImageModal from '../../components/FullScreenImageModal'

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedImages, setUploadedImages] = useState<Array<{url: string, path: string}>>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadUserImages()
    }
  }, [user])

  const loadUserImages = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const imagesRef = ref(storage, `users/${user.uid}/images`)
      const imageList = await listAll(imagesRef)
      const imageData = await Promise.all(
        imageList.items.map(async (item) => {
          const url = await getDownloadURL(item)
          return { url, path: item.fullPath }
        })
      )
      setUploadedImages(imageData)
    } catch (error) {
      console.error("Error loading images:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (!user) return
    setUploading(true)
    setProgress(0)

    const uploadPromises = files.map(file => {
      const storageRef = ref(storage, `users/${user.uid}/images/${file.name}`)
      const uploadTask = uploadBytesResumable(storageRef, file)

      return new Promise<string>((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            setProgress(progress)
          },
          (error) => {
            console.error("Upload error:", error)
            reject(error)
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(downloadURL)
          }
        )
      })
    })

    try {
      const newImageUrls = await Promise.all(uploadPromises)
      setUploadedImages(prev => [
        ...prev,
        ...newImageUrls.map((url, index) => ({
          url,
          path: `users/${user.uid}/images/${files[index].name}`
        }))
      ])
      setFiles([])
      setProgress(0)
    } catch (error) {
      console.error("Error uploading files:", error)
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  const handleDeleteImage = async (imagePath: string) => {
    if (!user) return
    try {
      const imageRef = ref(storage, imagePath)
      await deleteObject(imageRef)
      setUploadedImages(prevImages => prevImages.filter(img => img.path !== imagePath))
    } catch (error) {
      console.error("Error deleting image:", error)
      alert("Failed to delete the image. Please try again.")
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
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <span className="ml-2 text-gray-600">Loading images...</span>
              </div>
            ) : uploadedImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
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
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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