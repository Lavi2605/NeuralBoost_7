import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

export default function GenomeRing({ safe, threats, total }) {
  const svgRef = useRef(null);
  const pathsRef = useRef([]);
  const glowPathsRef = useRef([]);
  const textRef = useRef(null);
  const labelRef = useRef(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Initial render effect - only runs when data changes
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    pathsRef.current = [];
    glowPathsRef.current = [];
    
    const width = 280;
    const height = 280;
    const radius = Math.min(width, height) / 2 - 20;
    const innerRadius = radius * 0.6;
    const outerRadius = radius * 0.9;
    const strokeWidth = outerRadius - innerRadius;
    
    svg.attr('width', width).attr('height', height);
    
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI * 1.5);
    
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(8);
    
    // Hover arc with expanded radius
    const arcHover = d3.arc()
      .innerRadius(innerRadius * 0.95)
      .outerRadius(outerRadius * 1.05)
      .cornerRadius(8);
    
    const data = [
      { name: 'Safe', value: safe, color: '#22c55e' },
      { name: 'Threats', value: threats, color: '#ef4444' }
    ];
    
    // Add filters for glow
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', 4).attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    
    const filterHover = defs.append('filter').attr('id', 'glow-hover');
    filterHover.append('feGaussianBlur').attr('stdDeviation', 8).attr('result', 'coloredBlur');
    const feMergeHover = filterHover.append('feMerge');
    feMergeHover.append('feMergeNode').attr('in', 'coloredBlur');
    feMergeHover.append('feMergeNode').attr('in', 'SourceGraphic');
    
    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .style('cursor', 'pointer');
    
    // Glow layer (behind) - store reference with data
    const glowPaths = arcs.append('path')
      .attr('d', arc)
      .attr('fill', 'none')
      .attr('stroke', d => d.data.color)
      .attr('stroke-width', strokeWidth + 4)
      .attr('opacity', 0.2)
      .attr('filter', 'url(#glow)');
    
    glowPaths.each(function(d) {
      glowPathsRef.current.push({ element: this, data: d.data.name });
    });
    
    // Main arc path - store reference immediately with data
    const paths = arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', '#0f1629')
      .attr('stroke-width', 2)
      .attr('opacity', 0)
      .each(function(d) {
        // Store path element reference with data
        pathsRef.current.push({ element: this, data: d.data.name });
        
        // Add hover handlers
        const pathElement = this;
        const pathData = d.data.name;
        
        d3.select(pathElement)
          .on('mouseenter', function() {
            if (prefersReducedMotion) return;
            setHoveredSegment(pathData);
          })
          .on('mouseleave', function() {
            if (prefersReducedMotion) return;
            setHoveredSegment(null);
          });
      })
      .transition()
      .duration(prefersReducedMotion ? 0 : 1500)
      .ease(d3.easeElasticOut)
      .attr('opacity', 1);
    
    // Center text - store reference
    const safePercentage = total > 0 ? Math.round((safe / total) * 100) : 0;
    const threatsPercentage = total > 0 ? Math.round((threats / total) * 100) : 0;
    
    // Safe percentage (show by default)
    const safeText = g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-8')
      .attr('fill', '#22c55e')
      .attr('font-size', '32px')
      .attr('font-weight', '700')
      .text(`${safePercentage}%`)
      .attr('opacity', 0)
      .transition()
      .duration(prefersReducedMotion ? 0 : 800)
      .delay(500)
      .attr('opacity', 1);
    
    // Safe label
    const safeLabel = g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '16')
      .attr('fill', '#22c55e')
      .attr('font-size', '14px')
      .attr('font-weight', '500')
      .text('Safe')
      .attr('opacity', 0)
      .transition()
      .duration(prefersReducedMotion ? 0 : 800)
      .delay(500)
      .attr('opacity', 0.8);
    
    // Threats percentage (hidden by default)
    const threatsText = g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-8')
      .attr('fill', '#ef4444')
      .attr('font-size', '32px')
      .attr('font-weight', '700')
      .text(`${threatsPercentage}%`)
      .attr('opacity', 0);
    
    // Threats label (hidden by default)
    const threatsLabel = g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '16')
      .attr('fill', '#ef4444')
      .attr('font-size', '14px')
      .attr('font-weight', '500')
      .text('Threats')
      .attr('opacity', 0);
    
    // Store references for hover updates
    textRef.current = { safe: safeText.node(), threats: threatsText.node() };
    labelRef.current = { safe: safeLabel.node(), threats: threatsLabel.node() };
    
  }, [safe, threats, total, prefersReducedMotion]);
  
  // Separate effect for hover state updates
  useEffect(() => {
    if (pathsRef.current.length === 0) return;
    
    const width = 280;
    const height = 280;
    const radius = Math.min(width, height) / 2 - 20;
    const innerRadius = radius * 0.6;
    const outerRadius = radius * 0.9;
    
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(8);
    
    const arcHover = d3.arc()
      .innerRadius(innerRadius * 0.95)
      .outerRadius(outerRadius * 1.05)
      .cornerRadius(8);
    
    // Update center text to show only one percentage at a time
    if (textRef.current && labelRef.current) {
      if (hoveredSegment === 'Safe') {
        // Show Safe percentage only
        d3.select(textRef.current.safe)
          .transition()
          .duration(prefersReducedMotion ? 0 : 200)
          .attr('opacity', 1);
        
        d3.select(labelRef.current.safe)
          .transition()
          .duration(prefersReducedMotion ? 0 : 200)
          .attr('opacity', 0.8);
        
        // Hide Threats
        d3.select(textRef.current.threats)
          .transition()
          .duration(prefersReducedMotion ? 0 : 200)
          .attr('opacity', 0);
        
        d3.select(labelRef.current.threats)
          .transition()
          .duration(prefersReducedMotion ? 0 : 200)
          .attr('opacity', 0);
      } else if (hoveredSegment === 'Threats') {
        // Show Threats percentage only
        d3.select(textRef.current.threats)
          .transition()
          .duration(prefersReducedMotion ? 0 : 200)
          .attr('opacity', 1);
        
        d3.select(labelRef.current.threats)
          .transition()
          .duration(prefersReducedMotion ? 0 : 200)
          .attr('opacity', 0.8);
        
        // Hide Safe
        d3.select(textRef.current.safe)
          .transition()
          .duration(prefersReducedMotion ? 0 : 200)
          .attr('opacity', 0);
        
        d3.select(labelRef.current.safe)
          .transition()
          .duration(prefersReducedMotion ? 0 : 200)
          .attr('opacity', 0);
      } else {
        // No hover - show Safe by default
        d3.select(textRef.current.safe)
          .transition()
          .duration(prefersReducedMotion ? 0 : 200)
          .attr('opacity', 1);
        
        d3.select(labelRef.current.safe)
          .transition()
          .duration(prefersReducedMotion ? 0 : 200)
          .attr('opacity', 0.8);
        
        // Hide Threats
        d3.select(textRef.current.threats)
          .transition()
          .duration(prefersReducedMotion ? 0 : 200)
          .attr('opacity', 0);
        
        d3.select(labelRef.current.threats)
          .transition()
          .duration(prefersReducedMotion ? 0 : 200)
          .attr('opacity', 0);
      }
    }
    
    pathsRef.current.forEach((pathRef) => {
      if (!pathRef.element) return;
      
      const pathSelection = d3.select(pathRef.element);
      const isHovered = hoveredSegment === pathRef.data;
      
      pathSelection
        .transition()
        .duration(prefersReducedMotion ? 0 : 200)
        .attr('d', isHovered ? arcHover : arc)
        .attr('stroke-width', isHovered ? 3 : 2)
        .attr('opacity', isHovered ? 0.95 : 1);
      
      // Update corresponding glow
      const glowRef = glowPathsRef.current.find(g => g.data === pathRef.data);
      if (glowRef && glowRef.element) {
        d3.select(glowRef.element)
          .transition()
          .duration(prefersReducedMotion ? 0 : 200)
          .attr('opacity', isHovered ? 0.5 : 0.2)
          .attr('filter', isHovered ? 'url(#glow-hover)' : 'url(#glow)');
      }
    });
  }, [hoveredSegment, prefersReducedMotion, safe, threats, total]);
  
  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef} className="mb-4" />
      <div className="flex gap-4">
        <motion.div
          className="flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all"
          style={{
            backgroundColor: hoveredSegment === 'Safe' 
              ? 'rgba(34, 197, 94, 0.2)' 
              : 'rgba(34, 197, 94, 0.1)',
            borderColor: hoveredSegment === 'Safe'
              ? 'rgba(34, 197, 94, 0.4)'
              : 'rgba(34, 197, 94, 0.2)',
            boxShadow: hoveredSegment === 'Safe'
              ? '0 0 20px rgba(34, 197, 94, 0.3)'
              : 'none'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: hoveredSegment === 'Safe' ? 1.05 : 1
          }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          onMouseEnter={() => !prefersReducedMotion && setHoveredSegment('Safe')}
          onMouseLeave={() => !prefersReducedMotion && setHoveredSegment(null)}
        >
          <motion.div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: '#22c55e' }}
            animate={{
              scale: hoveredSegment === 'Safe' ? 1.3 : 1
            }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          />
          <span className="text-sm font-semibold text-text">
            Safe: <span style={{ color: '#22c55e' }}>{safe}</span>
          </span>
        </motion.div>
        <motion.div
          className="flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all"
          style={{
            backgroundColor: hoveredSegment === 'Threats'
              ? 'rgba(239, 68, 68, 0.2)'
              : 'rgba(239, 68, 68, 0.1)',
            borderColor: hoveredSegment === 'Threats'
              ? 'rgba(239, 68, 68, 0.4)'
              : 'rgba(239, 68, 68, 0.2)',
            boxShadow: hoveredSegment === 'Threats'
              ? '0 0 20px rgba(239, 68, 68, 0.3)'
              : 'none'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: hoveredSegment === 'Threats' ? 1.05 : 1
          }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          onMouseEnter={() => !prefersReducedMotion && setHoveredSegment('Threats')}
          onMouseLeave={() => !prefersReducedMotion && setHoveredSegment(null)}
        >
          <motion.div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: '#ef4444' }}
            animate={{
              scale: hoveredSegment === 'Threats' ? 1.3 : 1
            }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          />
          <span className="text-sm font-semibold text-text">
            Threats: <span style={{ color: '#ef4444' }}>{threats}</span>
          </span>
        </motion.div>
      </div>
    </div>
  );
}

