'use client'

import React, { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import MapLayout from './maplayout'
import { Button } from "../../components/Login/ui/button"
import { Input } from "../../components/Login/ui/input"
import { Slider } from "../../components/ui/slider"
import { Switch } from "../../components/ui/switch"
import { MapPin, Layers, Search, Menu } from 'lucide-react'
import { Label } from "../../components/Login/ui/label"
import Script from 'next/script'
import { useAuth } from '../../components/AuthProvider'
import { db } from '../../firebase'
import { collection, query, getDocs } from 'firebase/firestore'
import ImagePopup from './ImagePopup'  // We'll create this component next
import AdvancedControls from './AdvancedControls'  // We'll create this component next

interface ImageData {
  url: string;
  gps: { lat: number; lng: number };
  detectionCount: number;
  detectionImageUrl?: string;
  detections?: any[]; // Add this line
}

export default function MapsPage() {
  const [zoomLevel, setZoomLevel] = useState(2)
  const [showControls, setShowControls] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [userImages, setUserImages] = useState<ImageData[]>([])
  const { user } = useAuth()
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [markers, setMarkers] = useState<{ [key: string]: google.maps.Marker }>({})

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
  }, [mapLoaded, zoomLevel, map])

  useEffect(() => {
    if (user && map) {
      fetchUserImagesAndDetections()
    }
  }, [user, map])

  const fetchUserImagesAndDetections = async () => {
    if (!user) return

    try {
      const imagesQuery = query(collection(db, 'users', user.uid, 'images'))
      const detectionsQuery = query(collection(db, 'users', user.uid, 'detections'))

      const [imagesSnapshot, detectionsSnapshot] = await Promise.all([
        getDocs(imagesQuery),
        getDocs(detectionsQuery)
      ])

      const detections = detectionsSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data()
        acc[data.imageUrl] = {
          detectionCount: data.detections ? data.detections.length : 0,
          detectionImageUrl: data.imageUrl,
          detections: data.detections || []
        }
        return acc
      }, {} as { [key: string]: { detectionCount: number; detectionImageUrl: string; detections: any[] } })

      const images = imagesSnapshot.docs.map(doc => {
        const data = doc.data()
        const detection = detections[data.url] || { detectionCount: 0, detectionImageUrl: undefined, detections: [] }
        return {
          url: data.url,
          gps: data.gps,
          detectionCount: detection.detectionCount,
          detectionImageUrl: detection.detectionImageUrl,
          detections: detection.detections
        }
      })

      setUserImages(images)
      addMarkersToMap(images)
    } catch (error) {
      console.error('Error fetching user images and detections:', error)
    }
  }

  const addMarkersToMap = (images: ImageData[]) => {
    if (!map) return

    const newMarkers: { [key: string]: google.maps.Marker } = {}

    images.forEach((image) => {
      let fillColor
      if (image.detectionCount > 0) {
        fillColor = '#FF0000' // Red for detections
      } else if (image.detectionImageUrl === undefined) {
        fillColor = '#808080' // Gray for unprocessed images
      } else {
        fillColor = '#00FF00' // Green for no detections
      }

      const marker = new google.maps.Marker({
        position: { lat: image.gps.lat, lng: image.gps.lng },
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: fillColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 8,
        }
      })

      marker.addListener('click', () => {
        setSelectedImageUrl(prevUrl => prevUrl === image.url ? null : image.url)
      })

      newMarkers[image.url] = marker
    })

    setMarkers(newMarkers)
  }

  useEffect(() => {
    const handleMapClick = (e: google.maps.MapMouseEvent) => {
      if (e.latLng && selectedImageUrl) {
        const clickedMarker = markers[selectedImageUrl]
        if (clickedMarker && e.latLng !== clickedMarker.getPosition()) {
          setSelectedImageUrl(null)
        }
      }
    }

    if (map) {
      map.addListener('click', handleMapClick)
    }

    return () => {
      if (map) {
        google.maps.event.clearListeners(map, 'click')
      }
    }
  }, [map, selectedImageUrl, markers])

  return (
    <MapLayout>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyAtRjdZYF7O3721qyEjn1c6d47hvJDe4sc&libraries=places`}
        onLoad={() => setMapLoaded(true)}
      />
      <div className="w-full h-full relative">
        <div ref={mapRef} className="w-full h-full absolute inset-0 overflow-hidden" />
        
        <Button 
          variant="secondary"
          size="icon"
          onClick={() => setShowControls(!showControls)}
          className="absolute bottom-4 right-4 z-20 bg-white shadow-lg"
        >
          <Menu className="h-6 w-6" />
        </Button>

        {showControls && (
          <AdvancedControls
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            onClose={() => setShowControls(false)}
          />
        )}

        {selectedImageUrl && (
          <ImagePopup
            imageUrl={selectedImageUrl}
            onClose={() => setSelectedImageUrl(null)}
            imageData={userImages.find(img => img.url === selectedImageUrl)}
          />
        )}
      </div>
    </MapLayout>
  )
}