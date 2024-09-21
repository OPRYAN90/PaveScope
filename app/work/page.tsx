'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Login/ui/card";
import { Button } from "../../components/Login/ui/button";
import { Input } from "../../components/Login/ui/input";
import { Label } from "../../components/Login/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Upload, BarChart2, Map, FileSpreadsheet, HelpCircle, Image, DollarSign, Box } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { FollowingSidebar } from '../../components/FollowingSidebar';
import { useNavigateOrScrollTop } from '../../utils/navigation';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-blue-600" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const pageRef = useRef<HTMLDivElement>(null);
  const handlePaveScopeClick = useNavigateOrScrollTop('/work', pageRef);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (pageRef.current) {
      pageRef.current.scrollTop = 0;
    }
  }, []);

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div ref={pageRef} className="flex min-h-screen bg-blue-50 overflow-hidden">
      <FollowingSidebar onLogoClick={handlePaveScopeClick} onCollapse={handleSidebarCollapse} />
      <main className={`flex-1 ${isSidebarCollapsed ? 'ml-16' : 'ml-56'} p-8 transition-all duration-300 ease-in-out`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-blue-600">John Doe</span>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40&text=JD" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MetricCard title="Total Images" value="1,234" icon={Image} />
          <MetricCard title="Detections" value="567" icon={BarChart2} />
          <MetricCard title="Estimated Cost" value="$12,345" icon={DollarSign} />
          <MetricCard title="Volume of Materials" value="890 m³" icon={Box} />
        </div>

        {/* Main content areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Maps */}
          <Card className="col-span-1 lg:col-span-1">
            <CardHeader>
              <CardTitle>Maps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-200 flex items-center justify-center text-gray-500">
                Map API Placeholder
              </div>
            </CardContent>
          </Card>

          {/* Gallery */}
          <Card className="col-span-1 lg:col-span-1">
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Spreadsheet */}
          <Card className="col-span-1 lg:col-span-1">
            <CardHeader>
              <CardTitle>Spreadsheet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Column 1</th>
                      <th className="px-4 py-2 text-left">Column 2</th>
                      <th className="px-4 py-2 text-left">Column 3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-4 py-2">Data {i+1}</td>
                        <td className="px-4 py-2">Data {i+1}</td>
                        <td className="px-4 py-2">Data {i+1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Model Parameters */}
          <Card className="col-span-1 lg:col-span-1">
            <CardHeader>
              <CardTitle>Model Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select>
                    <SelectTrigger id="model">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="model1">Model 1</SelectItem>
                      <SelectItem value="model2">Model 2</SelectItem>
                      <SelectItem value="model3">Model 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parameter1">Parameter 1</Label>
                  <Input id="parameter1" type="number" placeholder="Enter value" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parameter2">Parameter 2</Label>
                  <Input id="parameter2" type="number" placeholder="Enter value" />
                </div>
                <Button type="submit" className="w-full">Apply</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}