import React, { useState, useRef } from 'react';
import { api } from '../api/apiClient';
import useFetch from '../hooks/useFetch';
import { motion } from 'framer-motion';
import ChartCard from '../components/charts/ChartCard';
import MonthlyThreatsChart from '../components/charts/MonthlyThreatsChart';
import GenomeRing from '../components/charts/GenomeRing';
import KPIPanel from '../components/charts/KPIPanel';
import BehavioralChart from '../components/charts/BehavioralChart';
import ThreatMap from '../components/charts/ThreatMap';

function monthName(idx) { return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][idx-1]; }

export default function Dashboard() {
  const { data, loading } = useFetch(api.dashboard, []);
  const [timeframe, setTimeframe] = useState('30d');
  const monthlyThreatsRef = useRef(null);
  const behavioralChartRef = useRef(null);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const trend = (data?.trend || []).map(d => ({ name: monthName(d.month), threats: d.threats }));
  const safe = Math.max(0, (data?.totals?.analyzed || 0) - (data?.totals?.threats || 0));
  const threats = data?.totals?.threats || 0;
  const total = data?.totals?.analyzed || 1;

  const dept = (data?.departments && data.departments.length ? data.departments : [
    { name: 'Finance', clickedPct: 60 },
    { name: 'Tech', clickedPct: 15 }
  ]).map(d => ({ ...d }));

  const geo = (data?.geoSources && data.geoSources.length ? data.geoSources : [
    { lat: 28.6139, lon: 77.2090, count: 18, region: 'India' },
    { lat: 40.7128, lon: -74.0060, count: 9, region: 'NA' }
  ]);

  function labelForCountry(g) {
    const { lat, lon, region } = g;
    if (region === 'India' || (lat > 6 && lat < 36 && lon > 68 && lon < 98)) return 'India';
    if (Math.abs(lat - 40.7128) < 3 && Math.abs(lon + 74.0060) < 3) return 'United States';
    if (Math.abs(lat - 51.5074) < 3 && Math.abs(lon + 0.1278) < 3) return 'United Kingdom';
    if (Math.abs(lat - 1.3521) < 3 && Math.abs(lon - 103.8198) < 3) return 'Singapore';
    if (Math.abs(lat + 33.8688) < 3 && Math.abs(lon - 151.2093) < 3) return 'Australia';
    if (Math.abs(lat + 23.5505) < 3 && Math.abs(lon + 46.6333) < 3) return 'Brazil';
    return region || 'Unknown';
  }

  const handleExportMonthlyThreats = () => {
    if (monthlyThreatsRef.current) {
      const chartInstance = monthlyThreatsRef.current.getEchartsInstance();
      const url = chartInstance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#0f1629'
      });
      const link = document.createElement('a');
      link.download = `monthly-threats-${timeframe}.png`;
      link.href = url;
      link.click();
    }
  };

  const handleExportBehavioral = () => {
    if (behavioralChartRef.current) {
      const chartInstance = behavioralChartRef.current.getEchartsInstance();
      const url = chartInstance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#0f1629'
      });
      const link = document.createElement('a');
      link.download = 'behavioral-analytics.png';
      link.href = url;
      link.click();
    }
  };

  const handleBarClick = (departmentName) => {
    // Emit event for drill-down - no logic change, just visual feedback
    console.log('Department clicked:', departmentName);
  };

  if (loading) {
    return (
      <section className="page" style={{ position: 'relative' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="bg-surface/60 backdrop-blur-md border border-border/80 rounded-xl p-6 h-64 animate-pulse"
            >
              <div className="h-4 bg-subtle rounded w-1/3 mb-4"></div>
              <div className="h-32 bg-subtle rounded"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="page" style={{ position: 'relative' }}>
      <div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-text tracking-tight mb-2">Threat Dashboard</h2>
          <p className="text-text-dim">Real-time security analytics and threat intelligence</p>
        </motion.div>

        {/* KPI Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          className="mb-6"
        >
          <KPIPanel
            analyzed={data?.totals?.analyzed}
            threats={data?.totals?.threats}
            sosTriggers={data?.totals?.sosTriggers}
          />
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Threats Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: 0.1 }}
          >
            <ChartCard
              title="Monthly Threats"
              subtitle="Threat detection trends over time"
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              onExport={handleExportMonthlyThreats}
            >
              <MonthlyThreatsChart ref={monthlyThreatsRef} data={trend} timeframe={timeframe} />
            </ChartCard>
          </motion.div>

          {/* Genome Ring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: 0.2 }}
          >
            <ChartCard
              title="Genome Ring"
              subtitle="Safe vs Threats radial split"
            >
              <GenomeRing safe={safe} threats={threats} total={total} />
            </ChartCard>
          </motion.div>

          {/* Behavioral Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: 0.3 }}
          >
            <ChartCard
              title="Behavioral Analytics"
              subtitle="Department-wise vulnerability (clicked links)"
              onExport={handleExportBehavioral}
            >
              <BehavioralChart ref={behavioralChartRef} data={dept} onBarClick={handleBarClick} />
            </ChartCard>
          </motion.div>

          {/* Threat Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <ChartCard
              title="Real-Time Global Threat Map"
              subtitle="Phishing attack sources by region"
            >
              <ThreatMap geo={geo} labelForCountry={labelForCountry} />
            </ChartCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

