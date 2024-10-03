import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Login/ui/card"
import { Button } from "../../components/Login/ui/button"
import { Loader2, X, Maximize2 } from 'lucide-react'

interface ImageData {
  url: string;
  gps: { lat: number; lng: number };
  detectionCount: number;
  detectionImageUrl?: string;
}

interface ImagePopupProps {
  imageUrl: string;
  onClose: () => void;
  imageData: ImageData | undefined;
}

const ImagePopup: React.FC<ImagePopupProps> = ({ imageUrl, onClose, imageData }) => {
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [showFullImage, setShowFullImage] = useState(false)

  if (!imageData) return null

  return (
    <>
      <Card className="absolute top-4 right-4 w-72 bg-white shadow-xl z-10 overflow-hidden">
        <CardHeader className="p-3 relative flex items-center justify-between bg-blue-600">
          <CardTitle className="text-sm font-semibold text-white leading-none">
            Image Details
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="absolute top-2 right-2 p-1 h-auto text-white hover:bg-blue-700 -translate-y-[6.9px]"
          >
            <X className="h-4 w-4"/>
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
              src={imageData.detectionImageUrl || imageData.url} 
              alt="Selected location" 
              className={`w-full h-full object-cover ${isImageLoading ? 'invisible' : 'visible'}`}
              onLoad={() => setIsImageLoading(false)}
              onError={() => setIsImageLoading(false)}
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
              Latitude: {imageData.gps.lat.toFixed(6)}
            </p>
            <p className="text-xs text-gray-600">
              Longitude: {imageData.gps.lng.toFixed(6)}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Status: {imageData.detectionCount > 0 
                ? `${imageData.detectionCount} Pothole${imageData.detectionCount === 1 ? '' : 's'} Detected` 
                : (imageData.detectionImageUrl === undefined ? 'Not Processed' : 'No Potholes Detected')}
            </p>
          </div>
        </CardContent>
      </Card>

      {showFullImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-[90vw] max-h-[90vh] bg-white shadow-lg">
            <img 
              src={imageData.url} 
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
    </>
  )
}

export default ImagePopup