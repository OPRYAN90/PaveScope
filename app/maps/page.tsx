'use client'

import React, { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import DashboardLayout from '../dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Login/ui/card"
import { Button } from "../../components/Login/ui/button"
import { Input } from "../../components/Login/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select"
import { Slider } from "../../components/ui/slider"
import { Switch } from "../../components/ui/switch"
import { MapPin, Layers, Filter, Search, ChevronUp, ChevronDown, X } from 'lucide-react'
import { Label } from "../../components/Login/ui/label"
import Script from 'next/script'
import { useAuth } from '../../components/AuthProvider'
import { db } from '../../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

export default function MapsPage() {
  const [selectedArea, setSelectedArea] = useState('')
  const [filterType, setFilterType] = useState('')
  const [zoomLevel, setZoomLevel] = useState(2)
  const [showControls, setShowControls] = useState(true)
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const pathname = usePathname()
  const [userImages, setUserImages] = useState<Array<{url: string, gps: {lat: number, lng: number}}>>([])
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState<{url: string, gps: {lat: number, lng: number}} | null>(null)

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
    if (map) {
      map.setZoom(zoomLevel)
    }
  }, [zoomLevel, map])

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
        setSelectedImage(image)
      })
    })
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyAtRjdZYF7O3721qyEjn1c6d47hvJDe4sc&libraries=places`}
        onLoad={() => setMapLoaded(true)}
      />
      <DashboardLayout>
        <div className="p-6 bg-gray-100 min-h-screen">
          <h1 className="text-3xl font-bold mb-6 text-blue-800">Maps & Filters</h1>
          
          <div className="grid grid-cols-1 gap-6">
            <Card className="overflow-hidden">
              <CardContent className="p-0 relative">
                <div ref={mapRef} className="h-[600px] w-full" />
                {selectedImage && (
                  <Card className="absolute top-4 right-4 w-64 bg-white shadow-xl z-10">
                    <CardHeader className="p-2 relative">
                      <CardTitle className="text-sm font-semibold text-blue-700">Image Details</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-1 right-1 p-1 h-auto"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-2">
                      <img src={selectedImage.url} alt="Selected location" className="w-full h-32 object-cover rounded-md mb-2" />
                      <p className="text-xs text-gray-600">
                        Lat: {selectedImage.gps.lat.toFixed(6)}, Lng: {selectedImage.gps.lng.toFixed(6)}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowControls(!showControls)}
                className="w-full py-3 flex items-center justify-center"
              >
                {showControls ? (
                  <>
                    <ChevronUp className="h-6 w-6 mr-2" /> Hide Controls
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-6 w-6 mr-2" /> Show Controls
                  </>
                )}
              </Button>
              
              {showControls && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-blue-700">Area and Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="area-select">Select Area</Label>
                        <Select value={selectedArea} onValueChange={handleAreaChange}>
                          <SelectTrigger id="area-select">
                            <SelectValue placeholder="Choose an area" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="downtown">Downtown</SelectItem>
                            <SelectItem value="suburbs">Suburbs</SelectItem>
                            <SelectItem value="highway">Highway</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="filter-select">Filter By</Label>
                        <Select value={filterType} onValueChange={handleFilterChange}>
                          <SelectTrigger id="filter-select">
                            <SelectValue placeholder="All issues" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="potholes">Potholes</SelectItem>
                            <SelectItem value="cracks">Cracks</SelectItem>
                            <SelectItem value="degradation">Surface Degradation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full">
                        <Filter className="mr-2 h-4 w-4" /> Apply Filters
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-blue-700">Search and Zoom</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Search Location</Label>
                        <div className="flex space-x-2">
                          <Input type="text" placeholder="Enter address or coordinates" />
                          <Button size="icon">
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
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
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-blue-700">Map Layers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}