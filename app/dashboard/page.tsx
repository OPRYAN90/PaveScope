'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { useRouter } from 'next/navigation';
import { signOutUser } from '../../lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Login/ui/card";
import { Button } from "../../components/Login/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import DashboardLayout from '../dashboard-layout';
import Link from 'next/link';
import { db } from '../../firebase';
import { collection, query, getDocs, limit, orderBy, where } from 'firebase/firestore';
import { Skeleton } from "../../components/ui/skeleton";
import { Upload, BarChart2, Map, FileSpreadsheet, HelpCircle, Image, DollarSign, Box, ChevronDown, LogOut, Settings, User, Table, Sliders, MapPin, ChevronRight, Loader } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip"

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}


interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon }) => (
  <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <Icon className="h-4 w-4 text-gray-400" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </CardContent>
  </Card>
);

interface Detection {
  id: string;
  gps?: {
    lat: number;
    lng: number;
  };
  detections?: any[];
  // Add other properties as needed
}

const GoogleMapPreview: React.FC<{ detections: Detection[]; isLoading: boolean }> = ({ detections, isLoading }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<{ [key: string]: google.maps.Marker }>({});
  const [isMapLoading, setIsMapLoading] = useState(true);

  const initializeMap = useCallback(() => {
    if (window.google && mapRef.current && !map) {
      setIsMapLoading(false);
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 0, lng: 0 },
        zoom: 2,
        disableDefaultUI: true,
        styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
      });
      setMap(newMap);
    }
  }, [map]);

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
    if (map && detections.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      const newMarkers: { [key: string]: google.maps.Marker } = {};

      detections.forEach((detection: Detection) => {
        if (detection.gps) {
          const position = new window.google.maps.LatLng(detection.gps.lat, detection.gps.lng);
          
          let fillColor = '#FF0000'; // Red for detections
          if (detection.detections && detection.detections.length === 0) {
            fillColor = '#00FF00'; // Green for no detections
          } else if (!detection.detections) {
            fillColor = '#808080'; // Gray for unprocessed images
          }

          const marker = new window.google.maps.Marker({
            position: position,
            map: map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: fillColor,
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 8,
            }
          });


          newMarkers[detection.id] = marker;
          bounds.extend(position);
        }
      });


      setMarkers(newMarkers);
      map.fitBounds(bounds);
    }
  }, [map, detections]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

const LoadingAnimation: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <Loader className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
      <p className="text-gray-600 font-semibold">Loading your dashboard...</p>
    </div>
  </div>
);

export default function WorkPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentDetections, setRecentDetections] = useState<any[]>([]);
  const [recentImages, setRecentImages] = useState<any[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoadingDetections, setIsLoadingDetections] = useState(true);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [totalImages, setTotalImages] = useState(0);
  const [totalDetections, setTotalDetections] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        await Promise.all([
          fetchRecentDetections(),
          fetchRecentImages(),
          fetchMetrics()
        ]);
        setIsPageLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const fetchRecentDetections = async () => {
    setIsLoadingDetections(true);
    if (user) {
      const q = query(collection(db, 'users', user.uid, 'detections'), limit(5));
      const querySnapshot = await getDocs(q);
      const detections = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentDetections(detections);
    }
    setIsLoadingDetections(false);
  };

  const fetchRecentImages = async () => {
    setIsLoadingImages(true);
    if (user) {
      const q = query(
        collection(db, 'users', user.uid, 'images'),
        orderBy('uploadedAt', 'desc'),
        limit(6)
      );
      const querySnapshot = await getDocs(q);
      const images = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentImages(images);
    }
    setIsLoadingImages(false);
  };

  const fetchMetrics = async () => {
    setIsLoadingMetrics(true);
    if (user) {
      try {
        // Fetch total images
        const imagesQuery = query(collection(db, 'users', user.uid, 'images'));
        const imagesSnapshot = await getDocs(imagesQuery);
        setTotalImages(imagesSnapshot.size);

        // Fetch detections, cost, and volume
        const detectionsQuery = query(collection(db, 'users', user.uid, 'detections'));
        const detectionsSnapshot = await getDocs(detectionsQuery);
        let detections = 0;
        let cost = 0;
        let volume = 0;
        detectionsSnapshot.forEach(doc => {
          const data = doc.data();
          detections += data.detections?.length || 0;
          cost += data.cost || 0;
          volume += data.volume || 0;
        });
        setTotalDetections(detections);
        setTotalCost(cost);
        setTotalVolume(volume);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    }
    setIsLoadingMetrics(false);
  };

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <DashboardLayout><LoadingAnimation /></DashboardLayout>;
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      {isPageLoading ? (
        <LoadingAnimation />
      ) : (
        <div className="flex flex-col min-h-screen p-2">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Work Dashboard</h1>
            <div className="relative">
              <div 
                className="flex items-center space-x-2 bg-gray-100 rounded-full pl-2 pr-4 py-2 shadow-sm cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || `/placeholder.svg?height=32&width=32&text=${user?.displayName?.charAt(0) || 'A'}`} alt={user?.displayName || 'User'} />
                  <AvatarFallback>{user?.displayName?.charAt(0) || 'A'}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{user?.displayName || user?.email}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-700">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                          onClick={() => {/* Add profile action */}}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left" align="end" className="bg-yellow-100 text-yellow-800 border border-yellow-200">
                        <p>Not supported yet</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                          onClick={() => {/* Add settings action */}}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left" align="end" className="bg-yellow-100 text-yellow-800 border border-yellow-200">
                        <p>Not supported yet</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {isLoadingMetrics ? (
              <>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </>
            ) : (
              <>
                <div onClick={() => router.push('/upload')}>
                  <MetricCard title="Total Images" value={totalImages.toString()} icon={Image} />
                </div>
                <div onClick={() => router.push('/detections')}>
                  <MetricCard title="Detections" value={totalDetections.toString()} icon={BarChart2} />
                </div>
                <div onClick={() => router.push('/spreadsheets')}>
                  <MetricCard title="Estimated Cost" value={`$${totalCost.toFixed(2)}`} icon={DollarSign} />
                </div>
                <div onClick={() => router.push('/spreadsheets')}>
                  <MetricCard title="Volume of Materials" value={`${totalVolume.toFixed(2)} m³`} icon={Box} />
                </div>
              </>
            )}
          </div>

          {/* Main content areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Maps */}
            <Link href="/maps" className="block h-full">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <CardHeader className="bg-blue-100 text-blue-800 py-3">
                  <CardTitle className="flex items-center text-lg">
                    <Map className="h-5 w-5 mr-2" />
                    Maps
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-0 overflow-hidden">
                  <div className="w-full h-full relative">
                    <GoogleMapPreview detections={recentDetections} isLoading={isLoadingDetections} />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Gallery */}
            <Link href="/upload" className="block h-full">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <CardHeader className="bg-green-100 text-green-800 py-3">
                  <CardTitle className="flex items-center text-lg">
                    <Image className="h-5 w-5 mr-2" />
                    Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-4 relative">
                  <div className="w-full pb-[66.67%] relative"> {/* 2:3 aspect ratio */}
                    <div className="absolute inset-0">
                      {isLoadingImages ? (
                        <div className="grid grid-cols-3 gap-4 h-full">
                          {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="w-full h-full rounded-lg" />
                          ))}
                        </div>
                      ) : recentImages.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4 h-full">
                          {recentImages.slice(0, 5).map((image, i) => (
                            <div key={image.id} className="aspect-square bg-gray-200 relative overflow-hidden rounded-lg">
                              <img 
                                src={image.url || `/placeholder.svg?height=100&width=100&text=Image+${i+1}`} 
                                alt={`Recent image ${i+1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          <div className="aspect-square bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          {[...Array(Math.max(0, 6 - recentImages.length - 1))].map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square bg-gray-100 rounded-lg" />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <Image className="h-16 w-16 mb-4 text-gray-400" />
                          <p className="text-center">No images uploaded yet.</p>
                          <p className="text-center text-sm mt-2">Click here to upload your first image.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Spreadsheet */}
            <Link href="/spreadsheets" className="block h-full">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <CardHeader className="bg-purple-100 text-purple-800 py-3">
                  <CardTitle className="flex items-center text-lg">
                    <Table className="h-5 w-5 mr-2" />
                    Spreadsheet
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-0">
                  {isLoadingDetections ? (
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ) : recentDetections.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">File Name</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Detections</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Uploaded At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentDetections.slice(0, 5).map((detection, i) => (
                            <tr key={detection.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-2">{detection.fileName || `File ${i+1}`}</td>
                              <td className="px-4 py-2">{detection.detections?.length || 0}</td>
                              <td className="px-4 py-2">{new Date(detection.timestamp?.toDate()).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                      <FileSpreadsheet className="h-16 w-16 mb-4 text-gray-400" />
                      <p className="text-center">No data available yet.</p>
                      <p className="text-center text-sm mt-2">Upload images to generate spreadsheet data.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>

            {/* Model Parameters */}
            <Link href="/model" className="block h-full">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <CardHeader className="bg-yellow-100 text-yellow-800 py-3">
                  <CardTitle className="flex items-center text-lg">
                    <Sliders className="h-5 w-5 mr-2" />
                    Model Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-4">
                  {isLoadingMetrics ? (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span className="font-medium text-gray-700">Model Type</span>
                        <span className="text-blue-600">YOLOv8</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span className="font-medium text-gray-700">Confidence Threshold</span>
                        <span className="text-blue-600">0.5</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span className="font-medium text-gray-700">GPU Acceleration</span>
                        <span className="text-red-600">Disabled</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span className="font-medium text-gray-700">Selected Images</span>
                        <span className="text-blue-600">{recentDetections.length}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Help Section */}
          <Link href="/help" className="block w-full mt-2">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gray-100 text-gray-800 py-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2" />
                    Help Center
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-semibold text-blue-700 mb-2">How do I upload images?</h3>
                    <p className="text-gray-600 text-sm">Navigate to the Upload page and follow the instructions to upload your images for analysis.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-700 mb-2">Supported file formats</h3>
                    <p className="text-gray-600 text-sm">PaveScope supports JPG, PNG, and TIFF formats. Use high-resolution images for best results.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-700 mb-2">Need more help?</h3>
                    <p className="text-gray-600 text-sm">Visit our Help Center for FAQs, tutorials, and contact information for our support team.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
}