import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ParticleCanvas from '../Shared/ParticleCanvas';

export default function AppShell({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Listen for sidebar collapse state (could be managed via context if needed)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const sidebarWidth = sidebarCollapsed ? 88 : 280;
  
  // Update TopBar when sidebar width changes
  const [topBarLeft, setTopBarLeft] = useState(sidebarWidth);
  
  useEffect(() => {
    setTopBarLeft(sidebarWidth);
  }, [sidebarWidth]);
  
  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Background Layers */}
      {/* Gradient Backdrop */}
      <div 
        className="fixed inset-0 z-background pointer-events-none"
        style={{
          background: `
            radial-gradient(1200px 380px at 10% -10%, rgba(18, 179, 255, 0.15) 0, transparent 60%),
            radial-gradient(900px 300px at 90% 0%, rgba(22, 242, 179, 0.15) 0, transparent 60%),
            linear-gradient(180deg, #0b1220 0%, #0b1226 100%)
          `
        }}
        aria-hidden="true"
      />
      
      {/* Network Grid Underlay (optional polish) */}
      <div 
        className="fixed inset-0 z-background pointer-events-none opacity-20"
        aria-hidden="true"
      >
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(18, 179, 255, 0.1)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Particle Background - Preserved exactly as is */}
      <ParticleCanvas />
      
      {/* App Chrome */}
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      <TopBar sidebarWidth={topBarLeft} />
      
      {/* Main Content */}
      <main 
        className="relative z-base pt-16 transition-all duration-200"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

