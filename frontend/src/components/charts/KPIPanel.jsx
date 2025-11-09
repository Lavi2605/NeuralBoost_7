import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Shield, AlertTriangle, Bell } from 'lucide-react';

export default function KPIPanel({ analyzed, threats, sosTriggers }) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const kpis = [
    {
      label: 'Analyzed',
      value: analyzed || 0,
      icon: Shield,
      color: 'primary',
      threshold: null
    },
    {
      label: 'Threats',
      value: threats || 0,
      icon: AlertTriangle,
      color: 'danger',
      threshold: 50
    },
    {
      label: 'SOS Triggers',
      value: sosTriggers || 0,
      icon: Bell,
      color: 'warning',
      threshold: 10
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        const shouldPulse = kpi.threshold && kpi.value > kpi.threshold;
        
        return (
          <motion.div
            key={kpi.label}
            className="bg-surface/60 backdrop-blur-md border border-border/80 rounded-xl p-6 shadow-lg hover:shadow-glow transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: prefersReducedMotion ? 0 : 0.3,
              delay: prefersReducedMotion ? 0 : idx * 0.1
            }}
            whileHover={!prefersReducedMotion ? { y: -4, transition: { duration: 0.2 } } : {}}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${kpi.color}/10 border border-${kpi.color}/20`}>
                <Icon size={24} className={`text-${kpi.color}`} />
              </div>
              {shouldPulse && (
                <motion.div
                  className={`w-2 h-2 rounded-full bg-${kpi.color}`}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              )}
            </div>
            
            <div className="mb-2">
              <div className="text-3xl font-bold mb-1"
                style={{ color: kpi.color === 'primary' ? '#12b3ff' : kpi.color === 'danger' ? '#ef4444' : '#f59e0b' }}
              >
                {prefersReducedMotion ? (
                  kpi.value.toLocaleString()
                ) : (
                  <CountUp
                    end={kpi.value}
                    duration={2}
                    separator=","
                    useEasing={true}
                  />
                )}
              </div>
              <div className="text-sm text-text-dim font-medium">{kpi.label}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

