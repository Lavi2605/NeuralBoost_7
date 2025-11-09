import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ThreatMap({ geo, project, labelForCountry }) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const [hover, setHover] = useState(null);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Determine marker color and size based on count
  const getMarkerStyle = (count) => {
    let color = '#12b3ff'; // blue - low
    let size = 8;
    
    if (count > 15) {
      color = '#ef4444'; // red - high
      size = 16;
    } else if (count > 10) {
      color = '#14b8a6'; // teal - medium
      size = 12;
    }
    
    return { color, size };
  };
  
  // Project coordinates to canvas (equirectangular projection)
  const projectToCanvas = (lat, lon, width, height) => {
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return { x, y };
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let raf;
    let animationFrame = 0;
    
    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      
      // Clear canvas
      ctx.fillStyle = '#0b1220';
      ctx.fillRect(0, 0, width, height);
      
      // Draw subtle grid
      ctx.strokeStyle = 'rgba(30, 42, 68, 0.3)';
      ctx.lineWidth = 1;
      const step = Math.max(40, Math.min(80, width / 12));
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Draw world map outline (simplified)
      ctx.strokeStyle = 'rgba(30, 42, 68, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Simple continent outlines
      // This is a simplified representation
      ctx.stroke();
      
      // Draw markers
      geo.forEach((g, idx) => {
        const { x, y } = projectToCanvas(g.lat, g.lon, width, height);
        const { color, size } = getMarkerStyle(g.count);
        
        // Pulse animation for high-severity markers
        const pulse = g.count > 15 && !prefersReducedMotion
          ? (Math.sin(animationFrame / 30) + 1) * 0.5
          : 0;
        const currentSize = size + pulse * 4;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, currentSize * 2);
        gradient.addColorStop(0, `${color}80`);
        gradient.addColorStop(1, `${color}00`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, currentSize * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Marker circle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, currentSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      
      animationFrame++;
      if (!prefersReducedMotion) {
        raf = requestAnimationFrame(draw);
      }
    };
    
    draw();
    
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [geo, prefersReducedMotion]);
  
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    let nearest = null;
    let bestDist2 = Infinity;
    
    geo.forEach((g) => {
      const p = projectToCanvas(g.lat, g.lon, width, height);
      const dx = p.x - x;
      const dy = p.y - y;
      const d2 = dx * dx + dy * dy;
      const { size } = getMarkerStyle(g.count);
      const radius = size + 10; // hover radius
      
      if (d2 < radius * radius && d2 < bestDist2) {
        bestDist2 = d2;
        nearest = { ...g, x: p.x, y: p.y, label: labelForCountry(g) };
      }
    });
    
    setHover(nearest);
  };
  
  const handleMouseLeave = () => {
    setHover(null);
  };
  
  return (
    <div 
      ref={wrapperRef}
      className="relative w-full h-[400px] rounded-lg overflow-hidden bg-subtle"
      style={{
        background: 'radial-gradient(1200px 400px at 20% 0%, rgba(18, 179, 255, 0.1) 0, transparent 60%), radial-gradient(800px 300px at 80% 20%, rgba(139, 92, 246, 0.1) 0, transparent 60%), #0b1220'
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        style={{ display: 'block' }}
      />
      
      {/* Hover Tooltip */}
      {hover && (
        <motion.div
          className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg bg-surface/95 backdrop-blur-sm border border-border shadow-lg"
          style={{
            left: Math.max(8, Math.min(hover.x + 12, (wrapperRef.current?.clientWidth || 0) - 160)),
            top: Math.max(8, hover.y + 12)
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          <div className="font-semibold text-text mb-1 text-sm">{hover.label}</div>
          <div className="text-xs text-text-dim">
            Threats: <span className="text-danger font-semibold">{hover.count}</span>
          </div>
        </motion.div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 z-10">
        {geo.slice(0, 5).map((g, i) => {
          const label = labelForCountry(g);
          return (
            <motion.div
              key={i}
              className="px-3 py-1.5 rounded-lg bg-surface/90 backdrop-blur-sm border border-border text-xs font-medium text-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.5 + i * 0.1 }}
            >
              {label}: {g.count}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

