import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, RotateCcw } from 'lucide-react';
import { CHANNEL_COLORS, SEVERITY_LEVELS } from '../../data/phishingTypes';
import CountUp from 'react-countup';

const CHANNELS = ['All', 'email', 'sms', 'voice', 'social', 'web'];
const SEVERITIES = ['All', 'low', 'medium', 'high'];

export default function FiltersBar({
  searchQuery,
  onSearchChange,
  selectedChannel,
  onChannelChange,
  selectedSeverity,
  onSeverityChange,
  resultCount,
  onReset
}) {
  const hasActiveFilters = searchQuery !== '' || selectedChannel !== 'all' || selectedSeverity !== 'all';

  return (
    <motion.div
      className="space-y-4 mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-dim"
          size={20}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or definition..."
          className="w-full pl-12 pr-12 py-3 rounded-xl bg-surface/60 backdrop-blur-md border border-border text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
          aria-label="Search phishing types"
        />
        <AnimatePresence>
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-dim hover:text-text transition-colors"
              aria-label="Clear search"
            >
              <X size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Channel Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-text">
            Channel:
          </span>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map((channel) => {
              const isActive = (channel === 'All' && selectedChannel === 'all') ||
                (channel !== 'All' && selectedChannel === channel);
              
              return (
                <motion.button
                  key={channel}
                  onClick={() => onChannelChange(channel === 'All' ? 'all' : channel)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-text-dim bg-surface/60 hover:bg-surface border border-border'
                  }`}
                  style={
                    isActive
                      ? channel === 'All'
                        ? { backgroundColor: '#6b7280' }
                        : {
                            backgroundColor: CHANNEL_COLORS[channel],
                            boxShadow: `0 4px 12px ${CHANNEL_COLORS[channel]}40`
                          }
                      : {}
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-pressed={isActive}
                >
                  {channel}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-text">
            Severity:
          </span>
          <div className="flex flex-wrap gap-2">
            {SEVERITIES.map((severity) => {
              const isActive = (severity === 'All' && selectedSeverity === 'all') ||
                (severity !== 'All' && selectedSeverity === severity);
              
              return (
                <motion.button
                  key={severity}
                  onClick={() => onSeverityChange(severity === 'All' ? 'all' : severity)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-text-dim bg-surface/60 hover:bg-surface border border-border'
                  }`}
                  style={
                    isActive
                      ? severity === 'All'
                        ? { backgroundColor: '#6b7280' }
                        : {
                            backgroundColor: SEVERITY_LEVELS[severity].color,
                            boxShadow: `0 4px 12px ${SEVERITY_LEVELS[severity].color}40`
                          }
                      : {}
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-pressed={isActive}
                >
                  {severity}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Result Count */}
        <div className="ml-auto flex items-center gap-4">
          <div className="text-sm text-text-dim">
            <span className="font-semibold text-text">
              <CountUp end={resultCount} duration={0.5} />
            </span>{' '}
            {resultCount === 1 ? 'result' : 'results'}
          </div>

          {/* Reset Button */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -10 }}
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-text bg-surface/60 hover:bg-surface border border-border transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw size={16} />
                Reset Filters
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
