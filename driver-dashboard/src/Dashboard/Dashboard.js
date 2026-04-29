/**
 * Dashboard.js
 *
 * Top-level orchestrator. Owns data-fetching state and delegates all
 * rendering to focused child components.
 *
 * Data flow: Dashboard → child components (props down, events up)
 */
import React, { useState, useEffect, useCallback } from 'react';

// Services
import {
  getIncidents, getDrivers, getTrips, getPythonStatus,
  calculateStats, getSeverityColor,
} from '../services/api';

// Hooks
import useResponsive from './hooks/useResponsive';

// UI primitives
import { GlobalStyles } from './DashboardComponents/ui';
import { IcoError }     from './DashboardComponents/icons';

// Feature components
import LiveMonitoringBanner from './DashboardComponents/LiveMonitoringBanner';
import DashboardHeader      from './DashboardComponents/DashboardHeader';
import StatCard             from './DashboardComponents/ui/StatCard';
import ViolationsBarChart   from './DashboardComponents/charts/ViolationsBarChart';
import SeverityDonutChart   from './DashboardComponents/charts/SeverityDonutChart';
import RecentViolationsTable from './DashboardComponents/table/RecentViolationsTable';

// Stat-card icons
import {
  IcoViolations, IcoDrivers, IcoTrips, IcoCritical,
} from './DashboardComponents/icons';

/* ─── Stat card definitions (data-driven, easy to extend) ────────────── */
const buildStatCards = ({ stats, activeDrivers, totalDrivers, ongoingTrips, totalTrips }) => [
  {
    label: 'Total Violations',   value: stats?.total ?? 0,
    IconComp: IcoViolations, iconColor: '#dc2626', accentColor: '#ef4444', bgAccent: '#fef2f2',
    trend: 'All recorded incidents', trendPositive: true, delay: 0.10,
  },
  {
    label: 'Active Drivers',     value: activeDrivers,
    IconComp: IcoDrivers,    iconColor: '#2563eb', accentColor: '#3b82f6', bgAccent: '#eff6ff',
    trend: `${totalDrivers} total registered`, trendPositive: true, delay: 0.15,
  },
  {
    label: 'Ongoing Trips',      value: ongoingTrips,
    IconComp: IcoTrips,      iconColor: '#16a34a', accentColor: '#84CC16', bgAccent: '#f7fee7',
    trend: `${totalTrips} total trips`, trendPositive: true, delay: 0.20,
  },
  {
    label: 'Critical Incidents', value: stats?.bySeverity?.CRITICAL ?? 0,
    IconComp: IcoCritical,   iconColor: '#ea580c', accentColor: '#f97316', bgAccent: '#fff7ed',
    trend: 'Needs immediate attention', trendPositive: false, delay: 0.25,
  },
];

/* ─── Dashboard ──────────────────────────────────────────────────────── */
const Dashboard = () => {
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [stats,         setStats]         = useState(null);
  const [drivers,       setDrivers]       = useState([]);
  const [trips,         setTrips]         = useState([]);
  const [pythonStatus,  setPythonStatus]  = useState(null);

  const { isMobile, isTablet } = useResponsive();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [incidentsData, driversData, tripsData, pythonData] = await Promise.all([
        getIncidents(),
        getDrivers(),
        getTrips(),
        getPythonStatus().catch(() => ({ monitoring_active: false })),
      ]);
      setStats(calculateStats(incidentsData));
      setDrivers(driversData);
      setTrips(tripsData);
      setPythonStatus(pythonData);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10_000);
    return () => clearInterval(interval);
  }, [loadData]);

  /* ── Loading state ── */
  if (loading && !stats) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTop: '3px solid #84CC16', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#9ca3af', fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Loading dashboard…</p>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div style={{ margin: 24, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <IcoError />
        <div>
          <p style={{ fontWeight: 700, color: '#991b1b', marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Error Loading Data</p>
          <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p>
          <button onClick={loadData} style={{ marginTop: 10, padding: '8px 18px', background: '#dc2626', color: '#fff', border: 'none', outline: 0, borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Retry</button>
        </div>
      </div>
    );
  }

  /* ── Derived data ── */
  const violationTypeData = Object.entries(stats?.byType ?? {}).map(([type, count]) => ({
    name: type.replace(/_/g, ' '), value: count,
  }));
  const severityData = Object.entries(stats?.bySeverity ?? {}).map(([severity, count]) => ({
    name: severity, value: count, color: getSeverityColor(severity),
  }));

  const activeDrivers = drivers.filter(d => d.status === 'ACTIVE').length;
  const ongoingTrips  = trips.filter(t => t.status === 'ONGOING').length;

  const statCards = buildStatCards({
    stats,
    activeDrivers,  totalDrivers: drivers.length,
    ongoingTrips,   totalTrips:   trips.length,
  });

  // Responsive layout values
  const outerPadding  = isMobile ? '20px 16px 48px' : isTablet ? '20px 18px 44px' : '28px 28px 48px';
  const statGridCols  = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))';
  const chartGridCols = isMobile ? '1fr' : '1fr 1fr';
  const gapSize       = isMobile ? 12 : 18;

  return (
    <div style={{ padding: outerPadding, fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100%' }}>
      <GlobalStyles />

      <LiveMonitoringBanner pythonStatus={pythonStatus} isMobile={isMobile} />

      <DashboardHeader onRefresh={loadData} loading={loading} isMobile={isMobile} />

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: statGridCols, gap: gapSize, marginBottom: gapSize }}>
        {statCards.map(card => (
          <StatCard key={card.label} {...card} isMobile={isMobile} />
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: chartGridCols, gap: gapSize, marginBottom: gapSize }}>
        <ViolationsBarChart data={violationTypeData} isMobile={isMobile} delay={0.30} />
        <SeverityDonutChart data={severityData}       isMobile={isMobile} delay={0.35} />
      </div>

      {/* Table */}
      <RecentViolationsTable
        incidents={stats?.recent ?? []}
        total={stats?.total ?? 0}
        isMobile={isMobile}
        delay={0.40}
      />
    </div>
  );
};

export default Dashboard;
