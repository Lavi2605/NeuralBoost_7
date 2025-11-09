import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, TrendingUp, PieChart, Target, Shield, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { CHANNEL_COLORS, SEVERITY_LEVELS } from '../../data/phishingTypes';
import { Mail, MessageSquare, Phone, Globe } from 'lucide-react';

const CHANNEL_ICONS = {
  email: Mail,
  sms: MessageSquare,
  voice: Phone,
  social: Globe,
  web: Globe
};

// Simple Dialog component with glass-morphism
function Dialog({ isOpen, onClose, children, title }) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-modal overflow-y-auto"
      style={{ zIndex: 9999 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        style={{ zIndex: 9998 }}
        aria-hidden="true"
      />
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4" style={{ position: 'relative', zIndex: 9999 }}>
        <div 
          className="relative rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
          style={{
            background: 'rgba(15, 22, 41, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(30, 42, 68, 0.8)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
  { id: 'redflags', label: 'Red Flags', icon: AlertTriangle },
  { id: 'mitigation', label: 'Mitigation', icon: Shield },
  { id: 'examples', label: 'Examples', icon: FileText }
];

export default function AnalyticsModal({ isOpen, onClose, type, prefersReducedMotion = false }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('12m');

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: prefersReducedMotion ? 'tween' : 'spring',
        duration: prefersReducedMotion ? 0.1 : 0.3,
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.2
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    if (isOpen && type) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, type]);

  React.useEffect(() => {
    if (isOpen && type) {
      setActiveTab('overview');
    }
  }, [isOpen, type]);

  if (!type || !isOpen) return null;

  const Icon = CHANNEL_ICONS[type.channel] || Shield;
  const severity = SEVERITY_LEVELS[type.severity];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`${type.name} Analytics`}>
      <AnimatePresence mode="wait">
        {isOpen && type && (
          <motion.div
            key={type.id}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-4">
                <motion.div
                  className="p-4 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${CHANNEL_COLORS[type.channel]}30, ${CHANNEL_COLORS[type.channel]}10)`,
                    color: CHANNEL_COLORS[type.channel]
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 20px ${CHANNEL_COLORS[type.channel]}30`,
                      `0 0 40px ${CHANNEL_COLORS[type.channel]}50`,
                      `0 0 20px ${CHANNEL_COLORS[type.channel]}30`
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Icon size={32} />
                </motion.div>
                <div>
                  <h2 id="modal-title" className="text-2xl font-bold text-text">
                    {type.name} Analytics
                  </h2>
                  <p className="text-sm text-text-dim mt-1">
                    {type.definition}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-text-dim hover:text-text rounded-lg hover:bg-surface transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border overflow-x-auto">
              {TABS.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary'
                        : 'text-text-dim hover:text-text'
                    }`}
                    aria-selected={isActive}
                    role="tab"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <TabIcon size={18} />
                    {tab.label}
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        layoutId="activeTab"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
                  >
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-surface/60 border border-border">
                        <div className="text-sm text-text-dim mb-1">Incidents/Month</div>
                        <div className="text-2xl font-bold text-text">
                          {Math.round(type.analytics.monthlyByChannel.reduce((sum, m) => 
                            sum + (m.email + m.sms + m.voice + m.social + m.web), 0) / 12
                          )}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-surface/60 border border-border">
                        <div className="text-sm text-text-dim mb-1">Success Rate</div>
                        <div className="text-2xl font-bold text-danger">
                          {type.severity === 'high' ? '18%' : type.severity === 'medium' ? '12%' : '6%'}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-surface/60 border border-border">
                        <div className="text-sm text-text-dim mb-1">Severity</div>
                        <div className="text-2xl font-bold" style={{ color: severity.color }}>
                          {severity.label}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-4 text-text">
                      Incidents by Channel (Last 12 Months)
                    </h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={type.analytics.monthlyByChannel}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 42, 68, 0.5)" />
                        <XAxis dataKey="month" stroke="#9aa7bf" />
                        <YAxis stroke="#9aa7bf" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 22, 41, 0.95)',
                            border: '1px solid rgba(30, 42, 68, 0.8)',
                            borderRadius: '12px',
                            color: '#e2e8f0'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="email" stackId="a" fill="#6366f1" name="Email" />
                        <Bar dataKey="sms" stackId="a" fill="#14b8a6" name="SMS" />
                        <Bar dataKey="voice" stackId="a" fill="#f97316" name="Voice" />
                        <Bar dataKey="social" stackId="a" fill="#8b5cf6" name="Social" />
                        <Bar dataKey="web" stackId="a" fill="#3b82f6" name="Web" />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}

                {activeTab === 'trends' && (
                  <motion.div
                    key="trends"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-text">
                        12-Month Trend with Moving Average
                      </h3>
                      <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-surface border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="12m">Last 12 months</option>
                      </select>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={type.analytics.trendData}>
                        <defs>
                          <linearGradient id={`trend-gradient-${type.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={CHANNEL_COLORS[type.channel]} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={CHANNEL_COLORS[type.channel]} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 42, 68, 0.5)" />
                        <XAxis dataKey="month" stroke="#9aa7bf" />
                        <YAxis stroke="#9aa7bf" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 22, 41, 0.95)',
                            border: '1px solid rgba(30, 42, 68, 0.8)',
                            borderRadius: '12px',
                            color: '#e2e8f0'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={CHANNEL_COLORS[type.channel]}
                          strokeWidth={2}
                          fill={`url(#trend-gradient-${type.id})`}
                          isAnimationActive={!prefersReducedMotion}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}

                {activeTab === 'redflags' && (
                  <motion.div
                    key="redflags"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-text">
                      Red Flags to Identify This Attack
                    </h3>
                    <div className="space-y-3">
                      {type.redFlags.map((flag, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3 p-4 rounded-xl bg-surface/60 border border-border"
                        >
                          <CheckCircle2 size={20} className="text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-text-dim">{flag}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'mitigation' && (
                  <motion.div
                    key="mitigation"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-text">
                      Key Actions & Mitigation Steps
                    </h3>
                    <div className="space-y-3">
                      {type.mitigations.map((mitigation, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3 p-4 rounded-xl bg-surface/60 border border-border"
                        >
                          <input
                            type="checkbox"
                            className="mt-1 w-5 h-5 text-primary rounded focus:ring-primary"
                            id={`mitigation-${idx}`}
                          />
                          <label
                            htmlFor={`mitigation-${idx}`}
                            className="flex-1 text-text-dim cursor-pointer"
                          >
                            {mitigation}
                          </label>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'examples' && (
                  <motion.div
                    key="examples"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-text">
                      Real-World Examples
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-surface/60 border border-border">
                        <h4 className="font-semibold text-text mb-2">Example Attack Scenario</h4>
                        <p className="text-text-dim text-sm mb-3">
                          A typical {type.name.toLowerCase()} attack might involve...
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
                            <div className="text-xs font-semibold text-danger mb-1">Phishing Email</div>
                            <div className="text-xs text-text-dim">Suspicious sender, urgent language, generic greeting</div>
                          </div>
                          <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                            <div className="text-xs font-semibold text-success mb-1">Legitimate Email</div>
                            <div className="text-xs text-text-dim">Verified sender, professional tone, personalized</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
