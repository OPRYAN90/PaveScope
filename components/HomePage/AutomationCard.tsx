import React from 'react';
import FadingImage from './ui/FadedImage';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/table";

const images = [
  '/placeholder.svg?height=250&width=400',
  '/placeholder.svg?height=250&width=400&text=Image+2',
  '/placeholder.svg?height=250&width=400&text=Image+3',
];

const segmentationImages = [
  '/placeholder.svg?height=250&width=400&text=Segmentation+1',
  '/placeholder.svg?height=250&width=400&text=Segmentation+2',
];

const mapImage = '/placeholder.svg?height=250&width=400&text=Map';

export default function AnalysisCards() {
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto mt-12">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-6 text-blue-500">Infrastructural Image</h3>
            <FadingImage images={images} height="250px" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-6 text-blue-500">Get Precise Segmentations</h3>
            <FadingImage images={segmentationImages} interval={5000} height="250px" />
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-6 text-blue-600">Depth Segmentation</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Depth (cm)</TableHead>
                    <TableHead>Cost ($)</TableHead>
                    <TableHead>Est. Volume (cm³)</TableHead>
                    <TableHead>Degree (1-4)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>(40.7128, -74.0060)</TableCell>
                    <TableCell>15</TableCell>
                    <TableCell>500</TableCell>
                    <TableCell>1000</TableCell>
                    <TableCell>2</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>(40.7129, -74.0061)</TableCell>
                    <TableCell>20</TableCell>
                    <TableCell>750</TableCell>
                    <TableCell>1500</TableCell>
                    <TableCell>3</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-6 text-blue-500">Mapping</h3>
            <img src={mapImage} alt="Map" className="w-full h-[250px] object-cover rounded-lg shadow-md" />
          </div>
        </div>
      </div>
    </div>
  );
}