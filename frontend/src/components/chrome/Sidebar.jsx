import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Search, 
  Shield, 
  BarChart3, 
  Settings,
  Menu,
  X,
  PlayCircle
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/analyze', label: 'Analyze', icon: Search },
  { path: '/awareness', label: 'Awareness', icon: Shield },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
];

export default function Sidebar({ onCollapseChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useCompany();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const sidebarWidth = collapsed ? '88px' : '280px';
  
  const handleToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onCollapseChange) {
      onCollapseChange(newCollapsed);
    }
  };
  
  return (
    <motion.aside
      className="fixed left-0 top-0 h-full bg-surface border-r border-border z-elevated flex flex-col"
      style={{ width: sidebarWidth }}
      initial={false}
      animate={{ width: sidebarWidth }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-text tracking-tight">TRACE</span>
          </motion.div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
            <Shield size={18} className="text-white" />
          </div>
        )}
        <button
          onClick={handleToggle}
          className="p-2 rounded-md text-text-dim hover:text-text hover:bg-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive: active }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md transition-all group ${
                  active || isActive
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-text-dim hover:text-text hover:bg-subtle'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium text-sm"
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          );
        })}
        
        {isAuthenticated && (
          <NavLink
            to="/simulate"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-md transition-all group ${
                isActive
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-text-dim hover:text-text hover:bg-subtle'
              }`
            }
            title={collapsed ? 'Simulation' : undefined}
          >
            <PlayCircle size={20} className="flex-shrink-0" />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium text-sm"
              >
                Simulation
              </motion.span>
            )}
          </NavLink>
        )}
      </nav>
      
      {/* Footer */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 border-t border-border text-xs text-text-dim"
        >
          <p>© {new Date().getFullYear()} TRACE</p>
        </motion.div>
      )}
    </motion.aside>
  );
}

