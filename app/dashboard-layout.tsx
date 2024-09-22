'use client';

import React, { useState, useEffect } from 'react';
import { FollowingSidebar } from '../components/FollowingSidebar';
import { useNavigateOrScrollTop } from '../utils/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  const handleLogoClick = useNavigateOrScrollTop('/dashboard');

  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-blue-50 overflow-hidden">
      <FollowingSidebar 
        onCollapse={handleSidebarCollapse} 
        onLogoClick={handleLogoClick}
      />
      <main className={`flex-1 ${isSidebarCollapsed ? 'ml-16' : 'ml-56'} p-8 transition-all duration-300 ease-in-out overflow-y-auto`}>
        {children}
      </main>
    </div>
  );
}