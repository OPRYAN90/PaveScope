'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "./Login/ui/button";
import { Upload, BarChart2, Map, FileSpreadsheet, HelpCircle, Image, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface FollowingSidebarProps {
  onLogoClick: () => void;
  onCollapse: (isCollapsed: boolean) => void;
  onHover?: (isHovered: boolean) => void;
}

export const FollowingSidebar: React.FC<FollowingSidebarProps> = ({ onLogoClick, onCollapse, onHover }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showText, setShowText] = useState(true);

  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState) {
      setIsCollapsed(JSON.parse(savedState));
      onCollapse(JSON.parse(savedState));
    }
  }, [onCollapse]);

  function toggleSidebar() {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapse(newCollapsedState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsedState));
    if (newCollapsedState) {
      setShowText(false);
    } else {
      setTimeout(() => setShowText(true), 150);
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onHover) onHover(true);
    if (isCollapsed) {
      setTimeout(() => setShowText(true), 150);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onHover) onHover(false);
    if (isCollapsed) {
      setShowText(false);
    }
  };

  const navItems = [
    { name: 'Upload', icon: Upload, href: '/upload' },
    { name: 'Model', icon: BarChart2, href: '/model' },
    { name: 'Detections', icon: Image, href: '/detections' },
    { name: 'Maps', icon: Map, href: '/maps' },
    { name: 'Spreadsheets', icon: FileSpreadsheet, href: '/spreadsheets' },
    { name: 'Help', icon: HelpCircle, href: '/help' },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 ${isCollapsed && !isHovered ? 'w-14' : 'w-52'} h-screen bg-gradient-to-b from-blue-600 to-blue-800 text-white flex flex-col transition-all duration-300 ease-in-out z-10`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`py-2 px-3 flex items-center ${isCollapsed && !isHovered ? 'justify-center' : 'justify-start'} cursor-pointer h-[72px]`} onClick={onLogoClick}>
        {!isCollapsed || isHovered ? (
          <>
            <div className="w-16 h-16 flex-shrink-0 mr-3 flex items-center justify-center ml-[-10px] mt-[4px]">
              <img src="/images/logo.png" alt="PaveScope Logo" className="w-full h-full object-contain" />
            </div>
            {showText && (
              <h2 className="text-xl font-bold text-left ml-[-20px] transition-opacity duration-200 ease-in-out">
                PaveScope
              </h2>
            )}
          </>
        ) : (
          <div className="w-8 h-8">
            <img src="/images/logo-icon.png" alt="PaveScope Icon" className="w-full h-full object-contain" />
          </div>
        )}
      </div>
      <nav className="flex-grow overflow-y-auto pt-1 pb-2">
        {navItems.map((item) => (
          <Link href={item.href} key={item.name}>
            <Button 
              variant="ghost" 
              className={`w-full justify-start hover:bg-blue-700 transition-colors h-[52px] my-1 ${isCollapsed && !isHovered ? 'px-0' : 'px-3'}`}
            >
              <div className={`flex items-center ${isCollapsed && !isHovered ? 'justify-center w-full' : ''}`}>
                <div className={`${isCollapsed && !isHovered ? 'w-6' : 'w-6'} flex-shrink-0`}>
                  {React.createElement(item.icon, { className: "h-6 w-6" })}
                </div>
                {(!isCollapsed || isHovered) && showText && (
                  <span className="ml-3 text-base transition-opacity duration-200 ease-in-out">
                    {item.name}
                  </span>
                )}
              </div>
            </Button>
          </Link>
        ))}
      </nav>
      <Button variant="ghost" className="w-full justify-center hover:bg-blue-700 transition-colors h-[48px]" onClick={toggleSidebar}>
        {isCollapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
      </Button>
    </aside>
  );
};