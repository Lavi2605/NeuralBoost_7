import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Maximize2, Calendar } from 'lucide-react';
import Modal from '../ui/Modal';

export default function ChartCard({ 
  title, 
  subtitle, 
  children, 
  onExport, 
  onTimeframeChange,
  timeframe = '30d',
  className = '',
  ...props 
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };
  
  const timeframes = [
    { value: '7d', label: 'Last 7d' },
    { value: '30d', label: 'Last 30d' },
    { value: '90d', label: 'Last 90d' },
    { value: '1y', label: '1 Year' }
  ];
  
  const cardContent = (
    <motion.div
      className={`bg-surface/60 backdrop-blur-md border border-border/80 rounded-xl p-6 shadow-lg hover:shadow-glow transition-all ${className}`}
      whileHover={!prefersReducedMotion ? { y: -4, transition: { duration: 0.2 } } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
      {...props}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text tracking-tight mb-1">{title}</h3>
          {subtitle && (
            <p className="text-sm text-text-dim">{subtitle}</p>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          {onTimeframeChange && (
            <div className="relative">
              <select
                value={timeframe}
                onChange={(e) => onTimeframeChange(e.target.value)}
                className="appearance-none bg-subtle border border-border rounded-md px-3 py-1.5 text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer pr-8"
              >
                {timeframes.map(tf => (
                  <option key={tf.value} value={tf.value}>{tf.label}</option>
                ))}
              </select>
              <Calendar size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
            </div>
          )}
          
          {/* Export Button */}
          {onExport && (
            <button
              onClick={handleExport}
              className="p-2 rounded-md text-text-dim hover:text-text hover:bg-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Export chart"
            >
              <Download size={16} />
            </button>
          )}
          
          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 rounded-md text-text-dim hover:text-text hover:bg-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="View fullscreen"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
      
      {/* Chart Content */}
      <div className="relative">
        {children}
      </div>
    </motion.div>
  );
  
  return (
    <>
      {cardContent}
      <Modal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        title={title}
        size="xl"
      >
        <div className="h-[600px]">
          {children}
        </div>
      </Modal>
    </>
  );
}

