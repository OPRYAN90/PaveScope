'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { useRouter } from 'next/navigation';
import { signOutUser } from '../../lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Login/ui/card";
import { Button } from "../../components/Login/ui/button";
import { Input } from "../../components/Login/ui/input";
import { Label } from "../../components/Login/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Upload, BarChart2, Map, FileSpreadsheet, HelpCircle, Image, DollarSign, Box } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { useNavigateOrScrollTop } from '../../utils/navigation';
import DashboardLayout from '../dashboard-layout';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';

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
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-gray-600" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default function WorkPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const handlePaveScopeClick = useNavigateOrScrollTop('/dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
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
            <div className="absolute right-0 mt-2 w-56 bg-gray-50 border border-gray-200 rounded-md shadow-lg z-20 py-1">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-700">{user?.displayName || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition-colors duration-150"
                onClick={() => {/* Add profile action */}}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition-colors duration-150"
                onClick={() => {/* Add settings action */}}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-100 transition-colors duration-150"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          )}
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
              <Button type="submit" className="w-full bg-gray-700 hover:bg-gray-800 text-white">Apply</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}