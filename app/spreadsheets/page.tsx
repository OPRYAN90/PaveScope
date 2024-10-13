'use client'

import React, { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '../dashboard-layout'
import { Button } from "../../components/Login/ui/button"
import { Input } from "../../components/Login/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/HomePage/ui/table"
import { Plus, Download, Upload, Save, Trash2, Search, Filter, RefreshCw, ArrowUpDown } from 'lucide-react'
import { useAuth } from '../../components/AuthProvider'
import { db } from '../../firebase'
import { collection, query, getDocs, orderBy, Timestamp } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Login/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Label } from "../../components/Login/ui/label"
import { useToast } from "../../components/ui/use-toast"

interface ImageData {
  id: string;
  fileName: string;
  url: string;
  gps: {
    lat: number;
    lng: number;
    alt: number;
  };
  uploadedAt: Timestamp;
  detections: number | 'N/A';
  volume: number | 'N/A';
  material: string | 'N/A';
  cost: number | 'N/A';
}

const COLUMNS = [
  { key: 'fileName', label: 'File Name' },
  { key: 'url', label: 'URL' },
  { key: 'lat', label: 'Latitude' },
  { key: 'lng', label: 'Longitude' },
  { key: 'alt', label: 'Altitude' },
  { key: 'uploadedAt', label: 'Uploaded At' },
  { key: 'detections', label: 'Detections' },
  { key: 'volume', label: 'Volume (m³)' },
  { key: 'material', label: 'Material' },
  { key: 'cost', label: 'Cost ($)' },
  { key: 'actions', label: 'Actions' },
]

export default function SpreadsheetsPage() {
  const [imageData, setImageData] = useState<ImageData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'uploadedAt', direction: 'desc' as 'asc' | 'desc' })
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const imagesQuery = query(collection(db, 'users', user!.uid, 'images'))
      const detectionsQuery = query(collection(db, 'users', user!.uid, 'detections'))

      const [imagesSnapshot, detectionsSnapshot] = await Promise.all([
        getDocs(imagesQuery),
        getDocs(detectionsQuery)
      ])

      const imagesData = imagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        detections: 'N/A' as 'N/A',
        volume: 'N/A' as 'N/A',
        material: 'N/A' as 'N/A',
        cost: 'N/A' as 'N/A'
      } as ImageData))

      const detectionsData = detectionsSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data()
        acc[data.imageUrl] = {
          detections: Array.isArray(data.detections) ? data.detections.length : 0,
          volume: data.volume || 'N/A',
          material: data.material || 'N/A',
          cost: data.cost || 'N/A'
        }
        return acc
      }, {} as { [key: string]: { detections: number, volume: number | 'N/A', material: string | 'N/A', cost: number | 'N/A' } })

      const combinedData = imagesData.map(image => ({
        ...image,
        detections: typeof detectionsData[image.url]?.detections === 'number' ? detectionsData[image.url].detections : 'N/A' as 'N/A',
        volume: detectionsData[image.url]?.volume || 'N/A' as 'N/A',
        material: detectionsData[image.url]?.material || 'N/A' as 'N/A',
        cost: detectionsData[image.url]?.cost || 'N/A' as 'N/A'
      }))

      setImageData(combinedData)
      toast({
        title: "Data refreshed",
        description: "The spreadsheet data has been updated.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const filteredAndSortedData = useMemo(() => {
    let filteredData = imageData.filter(image =>
      image.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.gps.lat.toString().includes(searchTerm) ||
      image.gps.lng.toString().includes(searchTerm)
    )

    return filteredData.sort((a, b) => {
      if (sortConfig.key === 'uploadedAt') {
        return sortConfig.direction === 'asc' 
          ? a.uploadedAt.seconds - b.uploadedAt.seconds
          : b.uploadedAt.seconds - a.uploadedAt.seconds
      }
      if (sortConfig.key === 'lat' || sortConfig.key === 'lng' || sortConfig.key === 'alt') {
        return sortConfig.direction === 'asc'
          ? a.gps[sortConfig.key] - b.gps[sortConfig.key]
          : b.gps[sortConfig.key] - a.gps[sortConfig.key]
      }
      if (sortConfig.key === 'detections') {
        const aDetections = a.detections === 'N/A' ? -1 : a.detections;
        const bDetections = b.detections === 'N/A' ? -1 : b.detections;
        return sortConfig.direction === 'asc'
          ? aDetections - bDetections
          : bDetections - aDetections;
      }
      if (sortConfig.key === 'volume' || sortConfig.key === 'cost') {
        const aValue = a[sortConfig.key] === 'N/A' ? -Infinity : a[sortConfig.key] as number;
        const bValue = b[sortConfig.key] === 'N/A' ? -Infinity : b[sortConfig.key] as number;
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
      if (sortConfig.key === 'material') {
        const aValue = a.material === 'N/A' ? '' : a.material;
        const bValue = b.material === 'N/A' ? '' : b.material;
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if ((a as any)[sortConfig.key] < (b as any)[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
      if ((a as any)[sortConfig.key] > (b as any)[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [imageData, searchTerm, sortConfig])

  const formatCellValue = (column: string, value: any) => {
    if (column === 'uploadedAt' && value instanceof Timestamp) {
      return value.toDate().toLocaleString()
    }
    if (column === 'lat' || column === 'lng') {
      return value.toFixed(6)
    }
    if (column === 'alt') {
      return value ? value.toFixed(2) : 'N/A'
    }
    if (column === 'volume' && typeof value === 'number') {
      return value.toFixed(2)
    }
    if (column === 'cost' && typeof value === 'number') {
      return `$${value.toFixed(2)}`
    }
    return value
  }

  const handleExportClick = () => {
    const csvContent = [
      COLUMNS.map(col => col.label).join(','),
      ...filteredAndSortedData.map(item => 
        COLUMNS.map(col => {
          if (col.key === 'uploadedAt') {
            return item[col.key].toDate().toLocaleString()
          } else if (col.key === 'lat') {
            return item.gps.lat.toFixed(6)
          } else if (col.key === 'lng') {
            return item.gps.lng.toFixed(6)
          } else if (col.key === 'alt') {
            return item.gps.alt ? item.gps.alt.toFixed(2) : 'N/A'
          } else if (col.key === 'volume') {
            return typeof item.volume === 'number' ? item.volume.toFixed(2) : 'N/A'
          } else if (col.key === 'cost') {
            return typeof item.cost === 'number' ? `$${item.cost.toFixed(2)}` : 'N/A'
          } else {
            return (item as { [key: string]: any })[col.key]
          }
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'image_data.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    toast({
      title: "Export successful",
      description: "The CSV file has been downloaded.",
      variant: "default",
    })
  }

  const handleSave = () => {
    toast({
      title: "Feature not available",
      description: "The save feature is not enabled yet.",
      // variant: "warning",
    })
  }

  const handleDelete = () => {
    toast({
      title: "Feature not available",
      description: "The delete feature is not enabled yet.",
      // variant: "warning",
    })
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
        <Card className="m-6 flex-grow flex flex-col shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-200">
            <CardTitle className="text-2xl font-bold text-blue-900">Image Data Spreadsheet</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col overflow-hidden p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button variant="outline" size="icon" className="text-blue-600 hover:bg-blue-50">
                  <Search className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">All Images</span>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={fetchData} className="text-green-600 hover:bg-green-50">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportClick} className="text-purple-600 hover:bg-purple-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
            <div className="border rounded-lg overflow-auto flex-grow bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    {COLUMNS.map((column) => (
                      <TableHead
                        key={column.key}
                        className="text-center cursor-pointer sticky top-0 bg-gray-100 text-gray-700"
                        onClick={() => handleSort(column.key)}
                      >
                        {column.label}
                        {sortConfig.key === column.key && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline text-blue-500" />
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedData.map((image) => (
                    <TableRow key={image.id} className="hover:bg-gray-50">
                      <TableCell>{image.fileName}</TableCell>
                      <TableCell>
                        <a href={image.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View Image
                        </a>
                      </TableCell>
                      <TableCell>{formatCellValue('lat', image.gps.lat)}</TableCell>
                      <TableCell>{formatCellValue('lng', image.gps.lng)}</TableCell>
                      <TableCell>{formatCellValue('alt', image.gps.alt)}</TableCell>
                      <TableCell>{formatCellValue('uploadedAt', image.uploadedAt)}</TableCell>
                      <TableCell>{image.detections}</TableCell>
                      <TableCell>{formatCellValue('volume', image.volume)}</TableCell>
                      <TableCell>{image.material}</TableCell>
                      <TableCell>{formatCellValue('cost', image.cost)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={handleSave} className="text-green-600 hover:bg-green-50">
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
