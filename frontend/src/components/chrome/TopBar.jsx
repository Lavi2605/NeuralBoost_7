import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Bell, 
  User, 
  LogOut,
  Shield
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import Button from '../ui/Button';

const routeLabels = {
  '/': 'Home',
  '/analyze': 'Analyze Email',
  '/awareness': 'Awareness',
  '/dashboard': 'Dashboard',
  '/simulate': 'Simulation',
  '/login': 'Login'
};

export default function TopBar({ sidebarWidth = 280 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { company, logout, isAuthenticated } = useCompany();
  const [searchQuery, setSearchQuery] = useState('');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const currentPage = routeLabels[location.pathname] || 'TRACE';
  
  return (
    <motion.header
      className="fixed top-0 right-0 h-16 bg-surface/80 backdrop-blur-md border-b border-border z-elevated flex items-center justify-between px-6"
      style={{ left: `${sidebarWidth}px` }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1, left: `${sidebarWidth}px` }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
    >
      {/* Left: Breadcrumb & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-primary" />
          <h1 className="text-lg font-semibold text-text tracking-tight">{currentPage}</h1>
        </div>
      </div>
      
      {/* Right: Search, Alerts, User Menu */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 bg-subtle border border-border rounded-md text-sm text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        
        {/* Alerts */}
        <button
          className="p-2 rounded-md text-text-dim hover:text-text hover:bg-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-primary relative"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
        </button>
        
        {/* User Menu */}
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-text">{company?.name || 'Company'}</p>
              <p className="text-xs text-text-dim">Admin</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-danger hover:text-danger hover:bg-danger/10"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        )}
      </div>
    </motion.header>
  );
}

