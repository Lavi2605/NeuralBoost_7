import React from 'react';
import { motion } from 'framer-motion';

export default function Input({
  label,
  error,
  className = '',
  ...props
}) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-dim mb-2">
          {label}
        </label>
      )}
      <motion.input
        className={`w-full bg-subtle border border-border rounded-md px-4 py-2.5 text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${error ? 'border-danger' : ''} ${className}`}
        whileFocus={!prefersReducedMotion ? { scale: 1.01 } : {}}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  );
}

