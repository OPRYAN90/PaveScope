'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { useRouter } from 'next/navigation';
import { signOutUser } from '../../lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Login/ui/card";
import { Button } from "../../components/Login/ui/button";
import { Input } from "../../components/Login/ui/input";
import { Label } from "../../components/Login/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Upload, BarChart2, Map, FileSpreadsheet, HelpCircle, Image, DollarSign, Box, ChevronDown, LogOut, Settings, User, Table, Sliders, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { useNavigateOrScrollTop } from '../../utils/navigation';
import DashboardLayout from '../dashboard-layout';
import Link from 'next/link';
import { db } from '../../firebase';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import Script from 'next/script';

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
  <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <Icon className="h-4 w-4 text-gray-400" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </CardContent>
  </Card>
);

const GoogleMapPreview = ({ detections }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<{ [key: string]: google.maps.Marker }>({});

  useEffect(() => {
    if (window.google && mapRef.current && !map) {
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
    if (map && detections.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      const newMarkers: { [key: string]: google.maps.Marker } = {};

      detections.forEach((detection) => {
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

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default function WorkPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const handlePaveScopeClick = useNavigateOrScrollTop('/dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentDetections, setRecentDetections] = useState<any[]>([]);
  const [isMapScriptLoaded, setIsMapScriptLoaded] = useState(false);

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
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    useNavigateOrScrollTop.setScrollableElement(window);
  }, []);

  useEffect(() => {
    const fetchRecentDetections = async () => {
      if (user) {
        const q = query(collection(db, 'users', user.uid, 'detections'), limit(5));
        const querySnapshot = await getDocs(q);
        const detections = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentDetections(detections);
      }
    };

    fetchRecentDetections();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyAtRjdZYF7O3721qyEjn1c6d47hvJDe4sc&libraries=places`}
        onLoad={() => setIsMapScriptLoaded(true)}
      />
      <DashboardLayout>
        <div className="flex flex-col min-h-screen p-6">
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
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => {/* Add profile action */}}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => {/* Add settings action */}}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </button>
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
            <MetricCard title="Total Images" value="1,234" icon={Image} />
            <MetricCard title="Detections" value="567" icon={BarChart2} />
            <MetricCard title="Estimated Cost" value="$12,345" icon={DollarSign} />
            <MetricCard title="Volume of Materials" value="890 m³" icon={Box} />
          </div>

          {/* Main content areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Maps */}
            <Link href="/maps" className="block h-full">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <CardHeader className="bg-blue-100 text-blue-800">
                  <CardTitle className="flex items-center text-lg">
                    <Map className="h-5 w-5 mr-2" />
                    Maps
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-0 overflow-hidden">
                  <div className="w-full h-full relative">
                    {isMapScriptLoaded && recentDetections.length > 0 ? (
                      <GoogleMapPreview detections={recentDetections} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <span>{isMapScriptLoaded ? 'No recent detections' : 'Loading map...'}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Gallery */}
            <Link href="/upload" className="block h-full">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <CardHeader className="bg-green-100 text-green-800">
                  <CardTitle className="flex items-center text-lg">
                    <Image className="h-5 w-5 mr-2" />
                    Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-4">
                  <div className="grid grid-cols-3 gap-4">
                    {recentDetections.slice(0, 5).map((detection, i) => (
                      <div key={detection.id} className="aspect-square bg-gray-200 relative overflow-hidden rounded-lg">
                        <img 
                          src={detection.imageUrl || `/placeholder.svg?height=100&width=100&text=Image+${i+1}`} 
                          alt={`Recent detection ${i+1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {[...Array(Math.max(0, 5 - recentDetections.length))].map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
                    ))}
                    <div className="aspect-square bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Spreadsheet */}
            <Link href="/spreadsheets" className="block h-full">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <CardHeader className="bg-purple-100 text-purple-800">
                  <CardTitle className="flex items-center text-lg">
                    <Table className="h-5 w-5 mr-2" />
                    Spreadsheet
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-0">
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
                </CardContent>
              </Card>
            </Link>

            {/* Model Parameters */}
            <Link href="/model" className="block h-full">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <CardHeader className="bg-yellow-100 text-yellow-800">
                  <CardTitle className="flex items-center text-lg">
                    <Sliders className="h-5 w-5 mr-2" />
                    Model Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-4">
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
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}