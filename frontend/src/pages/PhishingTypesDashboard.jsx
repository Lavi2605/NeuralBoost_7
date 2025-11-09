import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, AlertCircle } from 'lucide-react';
import { PHISHING_TYPES } from '../data/phishingTypes';
import { useLocalStorage } from '../hooks/useLocalStorage';
import TypeCard from '../components/PhishingTypes/TypeCard';
import AnalyticsModal from '../components/PhishingTypes/AnalyticsModal';
import ModeSwitcher from '../components/PhishingTypes/ModeSwitcher';
import FlowchartView from '../components/PhishingTypes/FlowchartView';
import FiltersBar from '../components/PhishingTypes/FiltersBar';
import { CHANNEL_COLORS } from '../data/phishingTypes';

export default function PhishingTypesDashboard() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [viewMode, setViewMode] = useLocalStorage('phishing-view-mode', 'cards');
  const [darkMode, setDarkMode] = useLocalStorage('phishing-dark-mode', false);
  const [selectedType, setSelectedType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Filter types based on search, channel, and severity
  const filteredTypes = useMemo(() => {
    return PHISHING_TYPES.filter((type) => {
      const matchesSearch =
        searchQuery === '' ||
        type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        type.definition.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesChannel =
        selectedChannel === 'all' || type.channel === selectedChannel;

      const matchesSeverity =
        selectedSeverity === 'all' || type.severity === selectedSeverity;

      return matchesSearch && matchesChannel && matchesSeverity;
    });
  }, [searchQuery, selectedChannel, selectedSeverity]);

  const handleCardClick = (type) => {
    setSelectedType(type);
    setIsModalOpen(true);
    localStorage.setItem('phishing-last-opened', type.id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedType(null);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedChannel('all');
    setSelectedSeverity('all');
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.3,
        staggerChildren: prefersReducedMotion ? 0 : 0.08
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg transition-colors" style={{ position: 'relative' }}>
      <div className="container mx-auto px-4 py-8 max-w-7xl" style={{ position: 'relative', zIndex: 1 }}>
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 
                className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Phishing Types Dashboard
              </h1>
              <p className="text-lg text-text-dim">
                Explore 6 major phishing attack types with interactive analytics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ModeSwitcher
                mode={viewMode}
                onModeChange={setViewMode}
                prefersReducedMotion={prefersReducedMotion}
              />
              <motion.button
                onClick={() => setDarkMode(!darkMode)}
                className="p-3 rounded-xl bg-surface/60 backdrop-blur-md border border-border text-text-dim hover:text-text transition-all"
                aria-label="Toggle dark mode"
                whileHover={{ scale: 1.05, rotate: 15 }}
                whileTap={{ scale: 0.95 }}
                animate={darkMode ? { rotate: 0 } : { rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>
            </div>
          </div>

          {/* Enhanced Legend */}
          <motion.div
            className="flex flex-wrap items-center gap-4 p-5 rounded-xl bg-surface/60 backdrop-blur-md border border-border"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-sm font-semibold text-text">
              Channels:
            </span>
            {['Email', 'SMS', 'Voice', 'Social', 'Web'].map((channel) => {
              const channelKey = channel.toLowerCase();
              const color = CHANNEL_COLORS[channelKey] || '#6366f1';
              const isActive = selectedChannel === channelKey || (selectedChannel === 'all');
              
              return (
                <motion.button
                  key={channel}
                  onClick={() => setSelectedChannel(channelKey === 'email' ? 'email' : channelKey === 'sms' ? 'sms' : channelKey === 'voice' ? 'voice' : channelKey === 'social' ? 'social' : 'web')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: isActive ? `${color}20` : 'transparent',
                    border: `1px solid ${isActive ? color : 'rgba(30, 42, 68, 0.5)'}`
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: color }}
                    animate={isActive ? {
                      boxShadow: `0 0 12px ${color}60`,
                      scale: 1.2
                    } : {
                      boxShadow: 'none',
                      scale: 1
                    }}
                    transition={{ duration: 0.2 }}
                  />
                  <span className="text-sm text-text">{channel}</span>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Filters */}
        <FiltersBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedChannel={selectedChannel}
          onChannelChange={setSelectedChannel}
          selectedSeverity={selectedSeverity}
          onSeverityChange={setSelectedSeverity}
          resultCount={filteredTypes.length}
          onReset={handleResetFilters}
        />

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="relative"
        >
          <AnimatePresence mode="wait">
            {filteredTypes.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <AlertCircle
                  size={64}
                  className="mx-auto text-text-dim mb-4"
                />
                <h3 className="text-xl font-semibold text-text mb-2">
                  No results found
                </h3>
                <p className="text-text-dim mb-4">
                  Try adjusting your filters or search query
                </p>
                <motion.button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Reset Filters
                </motion.button>
              </motion.div>
            ) : viewMode === 'cards' ? (
              <motion.div
                key="cards"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredTypes.map((type, index) => (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : index * 0.08 }}
                  >
                    <TypeCard
                      type={type}
                      onClick={() => handleCardClick(type)}
                      prefersReducedMotion={prefersReducedMotion}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="flowchart"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
                className="w-full"
              >
                <FlowchartView
                  types={filteredTypes}
                  onNodeClick={handleCardClick}
                  prefersReducedMotion={prefersReducedMotion}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Analytics Modal */}
      <AnalyticsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        type={selectedType}
        prefersReducedMotion={prefersReducedMotion}
      />
    </div>
  );
}
