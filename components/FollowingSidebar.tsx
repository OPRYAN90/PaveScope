"use client";

import React, { useState } from 'react';
import { Button } from "./Login/ui/button";
import { Upload, BarChart2, Map, FileSpreadsheet, HelpCircle, Image, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface FollowingSidebarProps {
  onLogoClick: () => void;
  onCollapse: (isCollapsed: boolean) => void;
}

export const FollowingSidebar: React.FC<FollowingSidebarProps> = ({ onLogoClick, onCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  function toggleSidebar() {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapse(newCollapsedState);
  }

  const navItems = [
    { name: 'Upload', icon: Upload, href: '/upload' },
    { name: 'Model', icon: BarChart2, href: '/model' },
    { name: 'Detections', icon: Image, href: '/detections' },
    { name: 'Maps', icon: Map, href: '/maps' },
    { name: 'Spreadsheets', icon: FileSpreadsheet, href: '/spreadsheets' },
    { name: 'Help', icon: HelpCircle, href: '/help' },
  ];

  return (
    <aside className={`fixed left-0 top-0 ${isCollapsed ? 'w-16' : 'w-56'} h-screen bg-gradient-to-b from-blue-600 to-blue-800 text-white flex flex-col transition-all duration-300 ease-in-out z-10`}>
      <div className={`py-4 px-3 flex items-center ${isCollapsed ? 'justify-center' : ''} cursor-pointer`} onClick={onLogoClick}>
        {!isCollapsed && (
          <>
            <div className="w-10 h-10 flex-shrink-0 mr-3">
              <img src="/images/logo.png" alt="PaveScope Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-xl font-bold">PaveScope</h2>
          </>
        )}
        {isCollapsed && (
          <div className="w-8 h-8">
            <img src="/images/logo-icon.png" alt="PaveScope Icon" className="w-full h-full object-contain" />
          </div>
        )}
      </div>
      <nav className="flex-grow overflow-y-auto mt-4">
        {navItems.map((item) => (
          <Link href={item.href} key={item.name}>
            <Button variant="ghost" className={`w-full justify-start hover:bg-blue-700 transition-colors ${isCollapsed ? 'px-0 py-4' : 'px-4 py-3 mb-2'}`}>
              <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
                {React.createElement(item.icon, { className: "h-5 w-5" })}
                {!isCollapsed && <span className="ml-3 text-base">{item.name}</span>}
              </div>
            </Button>
          </Link>
        ))}
      </nav>
      <Button variant="ghost" className="w-full justify-center hover:bg-blue-700 transition-colors py-4" onClick={toggleSidebar}>
        {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </Button>
    </aside>
  );
};