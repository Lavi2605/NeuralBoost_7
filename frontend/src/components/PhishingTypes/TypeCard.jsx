import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { Mail, MessageSquare, Phone, Globe, Shield, AlertTriangle, ExternalLink, Play } from 'lucide-react';
import { CHANNEL_COLORS, SEVERITY_LEVELS } from '../../data/phishingTypes';

const CHANNEL_ICONS = {
  email: Mail,
  sms: MessageSquare,
  voice: Phone,
  social: Globe,
  web: Globe
};

export default function TypeCard({ type, onClick, prefersReducedMotion = false }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const Icon = CHANNEL_ICONS[type.channel] || Shield;
  const severity = SEVERITY_LEVELS[type.severity];
  
  // Get glow color based on severity
  const getGlowColor = () => {
    if (type.severity === 'high') return 'rgba(239, 68, 68, 0.3)';
    if (type.severity === 'medium') return 'rgba(245, 158, 11, 0.3)';
    return 'rgba(34, 197, 94, 0.3)';
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.3,
        ease: 'easeOut'
      }
    },
    hover: prefersReducedMotion
      ? {}
      : {
          y: -6,
          scale: 1.02,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20
          }
        }
  };

  const tooltipVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: 0.2,
        duration: prefersReducedMotion ? 0.1 : 0.2
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onHoverStart={() => {
        setIsHovered(true);
        setTimeout(() => setShowTooltip(true), 300);
      }}
      onHoverEnd={() => {
        setIsHovered(false);
        setShowTooltip(false);
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View analytics for ${type.name}`}
      className="relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface rounded-2xl overflow-hidden group"
      style={{
        background: 'rgba(15, 22, 41, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(30, 42, 68, 0.8)',
        boxShadow: isHovered && !prefersReducedMotion
          ? `0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px ${getGlowColor()}, 0 0 40px ${getGlowColor()}`
          : '0 4px 12px rgba(0, 0, 0, 0.2)',
        transition: 'box-shadow 0.2s ease-out'
      }}
    >
      {/* Gradient border glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: isHovered && !prefersReducedMotion
            ? `linear-gradient(135deg, ${getGlowColor()}, transparent)`
            : 'transparent',
          opacity: isHovered ? 0.3 : 0,
          transition: 'opacity 0.2s ease-out'
        }}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="p-3 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${CHANNEL_COLORS[type.channel]}20, ${CHANNEL_COLORS[type.channel]}10)`,
                color: CHANNEL_COLORS[type.channel]
              }}
              animate={isHovered && !prefersReducedMotion ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Icon size={24} />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold text-text mb-1">
                {type.name}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{
                    background: `${CHANNEL_COLORS[type.channel]}20`,
                    color: CHANNEL_COLORS[type.channel],
                    border: `1px solid ${CHANNEL_COLORS[type.channel]}40`
                  }}
                >
                  {type.channel.toUpperCase()}
                </span>
                <motion.span
                  className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{
                    background: severity.bgColor,
                    color: severity.color,
                    border: `1px solid ${severity.color}40`
                  }}
                  animate={
                    type.severity === 'high' && !prefersReducedMotion
                      ? {
                          boxShadow: [
                            `0 0 0 0 ${severity.color}40`,
                            `0 0 0 4px ${severity.color}40`,
                            `0 0 0 0 ${severity.color}40`
                          ]
                        }
                      : {}
                  }
                  transition={
                    type.severity === 'high'
                      ? {
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }
                      : {}
                  }
                >
                  {severity.label}
                </motion.span>
              </div>
            </div>
          </div>
        </div>

        {/* Definition */}
        <p className="text-sm text-text-dim mb-4 line-clamp-2">
          {type.definition}
        </p>

        {/* Enhanced Sparkline with Gradient */}
        <div className="h-20 mb-4 -mx-2 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={type.sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${type.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHANNEL_COLORS[type.channel]} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={CHANNEL_COLORS[type.channel]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={CHANNEL_COLORS[type.channel]}
                strokeWidth={2}
                fill={`url(#gradient-${type.id})`}
                dot={false}
                isAnimationActive={!prefersReducedMotion}
                animationDuration={1200}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-lg">
                        <p className="text-xs text-text font-semibold">
                          {payload[0].value} incidents
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Action Buttons (shown on hover) */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="flex gap-2 mt-4"
            >
              <motion.button
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-text bg-primary/20 hover:bg-primary/30 border border-primary/30 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                <ExternalLink size={16} />
                Details
              </motion.button>
              <motion.button
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-text bg-accent/20 hover:bg-accent/30 border border-accent/30 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/simulate');
                }}
              >
                <Play size={16} />
                Simulate
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tooltip with Red Flags */}
      <AnimatePresence>
        {showTooltip && isHovered && (
          <motion.div
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute bottom-full left-0 right-0 mb-2 bg-surface/95 backdrop-blur-md border border-border rounded-xl p-4 shadow-xl z-10"
            role="tooltip"
            style={{
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-warning" />
              <span className="text-sm font-semibold text-text">Red Flags</span>
            </div>
            <ul className="space-y-1 text-xs text-text-dim">
              {type.redFlags.slice(0, 3).map((flag, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
