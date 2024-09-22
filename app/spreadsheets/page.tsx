'use client'

import React, { useState } from 'react'
import DashboardLayout from '../dashboard-layout'
import { Button } from "../../components/Login/ui/button"
import { Input } from "../../components/Login/ui/input"
import { Select } from "../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/HomePage/ui/table"
import { Plus, Download, Upload, Save, Trash2 } from 'lucide-react'

const COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const ROWS = 20

export default function SpreadsheetsPage() {
  const [activeCell, setActiveCell] = useState<string | null>(null)

  const handleCellFocus = (cellId: string) => {
    setActiveCell(cellId)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen bg-blue-50">
        <div className="flex justify-between items-center p-4 bg-white border-b">
          <h1 className="text-2xl font-bold text-blue-800">Spreadsheets</h1>
          <div className="flex space-x-2">
            <Select defaultValue="sheet1">
              <option value="sheet1">Sheet 1</option>
              <option value="sheet2">Sheet 2</option>
              <option value="sheet3">Sheet 3</option>
            </Select>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                {COLUMNS.map((column) => (
                  <TableHead key={column} className="w-32 text-center">{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: ROWS }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell className="font-medium text-center">{rowIndex + 1}</TableCell>
                  {COLUMNS.map((column) => (
                    <TableCell key={`${column}${rowIndex + 1}`} className="p-0">
                      <Input
                        className="w-full h-full border-0 focus:ring-2 focus:ring-blue-500"
                        onFocus={() => handleCellFocus(`${column}${rowIndex + 1}`)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between items-center p-4 bg-white border-t">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <div>
            {activeCell && <span className="text-sm text-gray-500 mr-4">Selected: {activeCell}</span>}
            <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}