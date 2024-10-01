'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../dashboard-layout'
import { Button } from "../../components/Login/ui/button"
import { Input } from "../../components/Login/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/HomePage/ui/table"
import { Plus, Download, Upload, Save, Trash2, Search, Filter, RefreshCw } from 'lucide-react'
import { useAuth } from '../../components/AuthProvider'
import { db } from '../../firebase'
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Login/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Label } from "../../components/Login/ui/label"

const COLUMNS = ['File Name', 'URL', 'Latitude', 'Longitude', 'Altitude', 'Uploaded At', 'Actions']

export default function SpreadsheetsPage() {
  const [activeCell, setActiveCell] = useState<string | null>(null)
  const [imageData, setImageData] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState('uploadedAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'users', user.uid, 'images'), orderBy(sortColumn, sortDirection))
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const images = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setImageData(images)
      })

      return () => unsubscribe()
    }
  }, [user, sortColumn, sortDirection])

  const handleCellFocus = (cellId: string) => {
    setActiveCell(cellId)
  }

  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredData = imageData.filter(image =>
    image.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.gps.lat.toString().includes(searchTerm) ||
    image.gps.lng.toString().includes(searchTerm)
  )

  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen bg-gray-100">
        <Card className="m-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-800">Image Data Spreadsheet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Images</SelectItem>
                    <SelectItem value="recent">Recently Uploaded</SelectItem>
                    <SelectItem value="highAltitude">High Altitude</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Data</DialogTitle>
                      <DialogDescription>
                        Upload a CSV file to import data into your spreadsheet.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="file" className="text-right">
                          File
                        </Label>
                        <Input id="file" type="file" className="col-span-3" />
                      </div>
                    </div>
                    <Button type="submit">Upload and Import</Button>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {COLUMNS.map((column) => (
                      <TableHead key={column} className="text-center cursor-pointer" onClick={() => handleSort(column.toLowerCase())}>
                        {column}
                        {sortColumn === column.toLowerCase() && (
                          <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((image) => (
                    <TableRow key={image.id}>
                      <TableCell>{image.fileName}</TableCell>
                      <TableCell>
                        <a href={image.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View Image
                        </a>
                      </TableCell>
                      <TableCell>{image.gps.lat.toFixed(6)}</TableCell>
                      <TableCell>{image.gps.lng.toFixed(6)}</TableCell>
                      <TableCell>{image.gps.alt ? image.gps.alt.toFixed(2) : 'N/A'}</TableCell>
                      <TableCell>{new Date(image.uploadedAt.toDate()).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
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