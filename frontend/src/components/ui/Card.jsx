import React from 'react';
import { motion } from 'framer-motion';

export default function Card({ 
  children, 
  className = '', 
  hover = true,
  glow = false,
  ...props 
}) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return (
    <motion.div
      className={`bg-surface border border-border rounded-lg p-4 ${glow ? 'shadow-glow' : 'shadow-md'} ${className}`}
      whileHover={hover && !prefersReducedMotion ? { y: -2, transition: { duration: 0.2 } } : {}}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

