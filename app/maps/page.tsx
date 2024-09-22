'use client'

import React, { useState } from 'react'
import DashboardLayout from '../dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Login/ui/card"
import { Button } from "../../components/Login/ui/button"
import { Input } from "../../components/Login/ui/input"
import { Select } from "../../components/ui/select"
import { MapPin, Layers, Filter, Search } from 'lucide-react'

export default function MapsPage() {
  const [selectedArea, setSelectedArea] = useState('')
  const [filterType, setFilterType] = useState('')

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedArea(e.target.value)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value)
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-blue-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Maps</h1>
        <p className="text-gray-600 mb-6">View geographical representations of your data and detections here.</p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-blue-700">Interactive Map</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Placeholder for the map */}
              <div className="bg-gray-200 h-[500px] rounded-lg flex items-center justify-center">
                <MapPin className="h-16 w-16 text-blue-500" />
                <span className="ml-2 text-lg text-gray-600">Map Placeholder</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-700">Map Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="area-select" className="block text-sm font-medium text-gray-700 mb-1">Select Area</label>
                  <Select id="area-select" value={selectedArea} onChange={handleAreaChange}>
                    <option value="">Choose an area</option>
                    <option value="downtown">Downtown</option>
                    <option value="suburbs">Suburbs</option>
                    <option value="highway">Highway</option>
                  </Select>
                </div>
                <div>
                  <label htmlFor="filter-select" className="block text-sm font-medium text-gray-700 mb-1">Filter By</label>
                  <Select id="filter-select" value={filterType} onChange={handleFilterChange}>
                    <option value="">All issues</option>
                    <option value="potholes">Potholes</option>
                    <option value="cracks">Cracks</option>
                    <option value="degradation">Surface Degradation</option>
                  </Select>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Filter className="mr-2 h-4 w-4" /> Apply Filters
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-700">Search Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input type="text" placeholder="Enter address or coordinates" />
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-700">Map Layers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="form-checkbox text-blue-600" />
                    <span>Show Potholes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="form-checkbox text-blue-600" />
                    <span>Show Cracks</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="form-checkbox text-blue-600" />
                    <span>Show Surface Degradation</span>
                  </label>
                </div>
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                  <Layers className="mr-2 h-4 w-4" /> Update Layers
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}