'use client';

import React, { useState } from 'react';
import { FollowingSidebar } from '../../components/FollowingSidebar';
import { useNavigateOrScrollTop } from '../../utils/navigation';

export default function MapLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  const handleLogoClick = useNavigateOrScrollTop('/dashboard');

  return (
    <div className="flex h-screen overflow-hidden">
      <FollowingSidebar 
        onCollapse={handleSidebarCollapse} 
        onLogoClick={handleLogoClick}
        onHover={setIsSidebarHovered}
      />
      <main 
        className={`flex-1 ${
          isSidebarCollapsed 
            ? isSidebarHovered ? 'ml-52' : 'ml-14'
            : 'ml-52'
        } transition-all duration-300 ease-in-out overflow-hidden`}
      >
        {children}
      </main>
    </div>
  );
}