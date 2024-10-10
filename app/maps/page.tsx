'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import MapLayout from './maplayout'
import { Button } from "../../components/Login/ui/button"
import { Menu, Loader } from 'lucide-react'
import { useAuth } from '../../components/AuthProvider'
import { db } from '../../firebase'
import { collection, query, getDocs } from 'firebase/firestore'
import ImagePopup from './ImagePopup'
import AdvancedControls from './AdvancedControls'

interface ImageData {
  url: string;
  gps: { lat: number; lng: number };
  detectionCount: number;
  detectionImageUrl?: string;
  detections?: any[];
}

export default function MapsPage() {
  const [showControls, setShowControls] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [userImages, setUserImages] = useState<ImageData[]>([])
  const { user } = useAuth()
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [markers, setMarkers] = useState<{ [key: string]: google.maps.Marker }>({})
  const [showDetections, setShowDetections] = useState(true)
  const [showNonDetections, setShowNonDetections] = useState(true)
  const [showUnprocessed, setShowUnprocessed] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const initializeMap = useCallback(() => {
    if (window.google && mapRef.current && !map) {
      setIsLoading(false)
      const newMap = new google.maps.Map(mapRef.current, {
        center: { lat: 0, lng: 0 },
        zoom: 2,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
      })
      setMap(newMap)
    }
  }, [map])

  useEffect(() => {
    if (window.google) {
      initializeMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAtRjdZYF7O3721qyEjn1c6d47hvJDe4sc&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    }
  }, [initializeMap]);

  useEffect(() => {
    if (user && map) {
      fetchUserImagesAndDetections()
    }
  }, [user, map])

  useEffect(() => {
    if (map && userImages.length > 0) {
      updateMarkers()
    }
  }, [map, userImages, showDetections, showNonDetections, showUnprocessed])

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
    } catch (error) {
      console.error('Error fetching user images and detections:', error)
    }
  }

  const updateMarkers = () => {
    if (!map) return

    // Clear existing markers
    Object.values(markers).forEach(marker => marker.setMap(null))

    const newMarkers: { [key: string]: google.maps.Marker } = {}

    userImages.forEach((image) => {
      let fillColor
      let shouldShow = false

      if (image.detectionCount > 0) {
        fillColor = '#FF0000' // Red for detections
        shouldShow = showDetections
      } else if (image.detectionImageUrl === undefined) {
        fillColor = '#808080' // Gray for unprocessed images
        shouldShow = showUnprocessed
      } else {
        fillColor = '#00FF00' // Green for no detections
        shouldShow = showNonDetections
      }

      if (shouldShow) {
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
      }
    })

    setMarkers(newMarkers)
  }

  return (
    <MapLayout>
      <div className="w-full h-full relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-50">
            <Loader className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}
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
            onClose={() => setShowControls(false)}
            showDetections={showDetections}
            setShowDetections={setShowDetections}
            showNonDetections={showNonDetections}
            setShowNonDetections={setShowNonDetections}
            showUnprocessed={showUnprocessed}
            setShowUnprocessed={setShowUnprocessed}
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