'use client'

import React, { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import MapLayout from './maplayout'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Login/ui/card"
import { Button } from "../../components/Login/ui/button"
import { Input } from "../../components/Login/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select"
import { Slider } from "../../components/ui/slider"
import { Switch } from "../../components/ui/switch"
import { MapPin, Layers, Filter, Search, ChevronUp, ChevronDown, X, Loader2, Menu, Maximize2 } from 'lucide-react'
import { Label } from "../../components/Login/ui/label"
import Script from 'next/script'
import { useAuth } from '../../components/AuthProvider'
import { db } from '../../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

export default function MapsPage() {
  const [selectedArea, setSelectedArea] = useState('')
  const [filterType, setFilterType] = useState('')
  const [zoomLevel, setZoomLevel] = useState(2)
  const [showControls, setShowControls] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const pathname = usePathname()
  const [userImages, setUserImages] = useState<Array<{url: string, gps: {lat: number, lng: number}}>>([])
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState<{url: string, gps: {lat: number, lng: number}} | null>(null)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)

  const handleAreaChange = (value: string) => {
    setSelectedArea(value)
  }

  const handleFilterChange = (value: string) => {
    setFilterType(value)
  }

  useEffect(() => {
    if (mapLoaded && mapRef.current && !map) {
      const newMap = new google.maps.Map(mapRef.current, {
        center: { lat: 0, lng: 0 },
        zoom: zoomLevel,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
      })
      setMap(newMap)
    }

    return () => {
      if (map) {
        google.maps.event.clearInstanceListeners(map)
        setMap(null)
      }
    }
  }, [mapLoaded, zoomLevel, map, pathname])

  useEffect(() => {
    if (user && map) {
      fetchUserImages()
    }
  }, [user, map])

  const fetchUserImages = async () => {
    if (!user) return

    try {
      const q = query(collection(db, 'users', user.uid, 'images'))
      const querySnapshot = await getDocs(q)
      const images = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          url: data.url,
          gps: data.gps
        }
      })
      setUserImages(images)
      addMarkersToMap(images)
    } catch (error) {
      console.error('Error fetching user images:', error)
    }
  }

  const addMarkersToMap = (images: Array<{url: string, gps: {lat: number, lng: number}}>) => {
    if (!map) return

    images.forEach((image) => {
      const marker = new google.maps.Marker({
        position: { lat: image.gps.lat, lng: image.gps.lng },
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#808080',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 8,
        }
      })

      marker.addListener('click', () => {
        setIsImageLoading(true)
        setSelectedImage(image)
      })
    })
  }

  return (
    <MapLayout>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyAtRjdZYF7O3721qyEjn1c6d47hvJDe4sc&libraries=places`}
        onLoad={() => setMapLoaded(true)}
      />
      <div className="w-full h-full relative">
        <div ref={mapRef} className="w-full h-full absolute inset-0 overflow-hidden" />
        
        {/* Menu button */}
        <div className={`absolute bottom-4 right-4 z-20 transition-all duration-300 ${showControls ? 'opacity-0 pointer-events-none' : ''}`}>
          <Button 
            variant="secondary"
            size="icon"
            onClick={() => setShowControls(true)}
            className="bg-white shadow-lg"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Advanced Controls Card */}
        <div className={`absolute bottom-4 right-4 z-10 transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <Card className="w-80 bg-white shadow-xl overflow-auto max-h-[calc(100vh-5rem)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-blue-700">Advanced Controls</CardTitle>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowControls(false)}
                className="h-8 w-8"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Search and Zoom</h3>
                <div className="flex space-x-2">
                  <Input type="text" placeholder="Enter address or coordinates" />
                  <Button size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Zoom Level: {zoomLevel}</Label>
                  <Slider
                    min={1}
                    max={20}
                    step={1}
                    value={[zoomLevel]}
                    onValueChange={(value) => setZoomLevel(value[0])}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Map Layers</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="potholes" className="cursor-pointer">Show Potholes</Label>
                    <Switch id="potholes" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cracks" className="cursor-pointer">Show Cracks</Label>
                    <Switch id="cracks" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="degradation" className="cursor-pointer">Show Surface Degradation</Label>
                    <Switch id="degradation" />
                  </div>
                </div>
                <Button className="w-full">
                  <Layers className="mr-2 h-4 w-4" /> Update Layers
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedImage && (
          <Card className="absolute top-4 right-4 w-72 bg-white shadow-xl z-10 overflow-hidden transition-all duration-300 ease-in-out transform translate-y-0 opacity-100">
            <CardHeader className="p-3 relative flex items-center justify-between bg-blue-600">
              <CardTitle className="text-sm font-semibold text-white leading-none">
                Image Details
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSelectedImage(null)
                  setIsImageLoading(false)
                  setShowFullImage(false)
                }}
                className="absolute top-2 right-2 p-1 h-auto text-white hover:bg-blue-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <div className="w-full h-40 relative rounded-md overflow-hidden mb-3 group">
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                )}
                <img 
                  src={selectedImage.url} 
                  alt="Selected location" 
                  className={`w-full h-full object-cover ${isImageLoading ? 'invisible' : 'visible'}`}
                  onLoad={() => setIsImageLoading(false)}
                />
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
              <div className="text-center">
                <p className="text-sm text-gray-700 font-medium mb-1">Location Coordinates</p>
                <p className="text-xs text-gray-600">
                  Latitude: {selectedImage.gps.lat.toFixed(6)}
                </p>
                <p className="text-xs text-gray-600">
                  Longitude: {selectedImage.gps.lng.toFixed(6)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {showFullImage && selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-[90vw] max-h-[90vh] bg-white shadow-lg">
              <img 
                src={selectedImage.url} 
                alt="Full size image" 
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setShowFullImage(false)}
                className="absolute top-2 right-2 bg-white bg-opacity-75 hover:bg-opacity-100 shadow-md z-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </MapLayout>
  )
}