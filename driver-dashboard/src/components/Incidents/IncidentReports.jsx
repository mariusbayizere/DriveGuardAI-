import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Clock, Filter, Download, FileText, RefreshCw } from 'lucide-react';

const API_BASE = (process.env.REACT_APP_API_BASE || 'https://driveguard.local/api/v1') + '/reports';

// ── Responsive hook ──
const useResponsive = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return {
    isMobile:  width < 640,
    isTablet:  width >= 640 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
};

export const IncidentReports = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [exportLoading, setExportLoading] = useState(false);

  const { isMobile, isTablet } = useResponsive();

  useEffect(() => { fetchReport(activeTab); }, [activeTab]);

  const fetchReport = async (reportType) => {
    setLoading(true); setError(null);
    try {
      const response = await fetch(`${API_BASE}/${reportType}`);
      if (!response.ok) throw new Error(`Failed to fetch report (Status: ${response.status})`);
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const getSeverityStyle = (severity) => {
    const styles = {
      CRITICAL: { color: '#b91c1c', bg: '#fee2e2', dot: '#ef4444' },
      HIGH:     { color: '#c2410c', bg: '#ffedd5', dot: '#f97316' },
      MEDIUM:   { color: '#a16207', bg: '#fef9c3', dot: '#eab308' },
      LOW:      { color: '#15803d', bg: '#dcfce7', dot: '#22c55e' },
    };
    return styles[severity] || styles.LOW;
  };

  const formatTimestamp = (timestamp) => {
    try {
      if (!timestamp) return 'N/A';
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'N/A';
      // Shorter format on mobile
      if (isMobile) {
        return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return 'N/A'; }
  };

  const getTripName   = (incident) => incident.trip?.tripName || 'N/A';
  const getDriverName = (incident) => {
    if (incident.driver?.user?.firstName)
      return `${incident.driver.user.firstName} ${incident.driver.user.lastName || ''}`.trim();
    return 'N/A';
  };

  const getFilteredIncidents = () => {
    if (!report?.incidents) return [];
    if (severityFilter === 'ALL') return report.incidents;
    return report.incidents.filter(i => i.severity === severityFilter);
  };

  const exportToPDF = async () => {
    if (!report) return alert('No report data to export');
    setExportLoading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('l', 'mm', 'a4');
      const pageWidth  = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 12;
      const usable = pageWidth - margin * 2;
      let y = margin;

      const checkPage = (needed = 10) => {
        if (y + needed > pageHeight - 16) { doc.addPage(); y = margin; }
      };

      // TITLE
      doc.setFontSize(16); doc.setFont(undefined, 'bold'); doc.setTextColor(15, 15, 15);
      doc.text('INCIDENT REPORT', pageWidth / 2, y, { align: 'center' });
      y += 6;
      doc.setFontSize(8); doc.setFont(undefined, 'normal'); doc.setTextColor(100, 100, 100);
      doc.text(`DriveGuard AI  |  Period: ${report.periodLabel || activeTab.toUpperCase()}  |  Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, y, { align: 'center' });
      y += 7;

      // SUMMARY BAR
      doc.setFillColor(240, 253, 244); doc.setDrawColor(134, 204, 22);
      doc.rect(margin, y, usable, 9, 'FD');
      doc.setFontSize(8); doc.setFont(undefined, 'bold'); doc.setTextColor(21, 128, 61);
      doc.text(`Total: ${report.totalIncidents || 0}     Critical: ${report.criticalCount || 0}     High: ${report.highCount || 0}     Medium: ${report.mediumCount || 0}     Affected Drivers: ${report.affectedDrivers || 0}`, margin + 4, y + 6);
      y += 13;

      const headers   = ['#', 'Incident ID', 'Driver Name', 'Trip Name', 'Vehicle Model', 'Incident Type', 'License Plate', 'Timestamp', 'Severity'];
      const colWidths = [7, 18, 27, 70, 42, 28, 22, 36, 21];
      const lineH  = 4.2;
      const padV   = 3.5;
      const headerH = 9;

      const sevTextColor = {
        CRITICAL: [185, 28,  28],
        HIGH:     [194, 65,  12],
        MEDIUM:   [120, 80,   0],
        LOW:      [ 21, 128, 61],
      };

      const getCellLines = (text, colIndex) => {
        doc.setFontSize(7.5);
        return doc.splitTextToSize(String(text ?? 'N/A'), colWidths[colIndex] - 4);
      };

      const getRowHeight = (cells) => {
        let maxLines = 1;
        cells.forEach((cell, ci) => {
          const lines = getCellLines(cell, ci);
          if (lines.length > maxLines) maxLines = lines.length;
        });
        return maxLines * lineH + padV * 2;
      };

      const drawRow = (cells, rowY, isHeader, isAlt, rowHeight) => {
        const rH = isHeader ? headerH : rowHeight;
        let x = margin;
        cells.forEach((cell, ci) => {
          const w   = colWidths[ci];
          const txt = String(cell ?? 'N/A');
          const isSevValue = ['CRITICAL','HIGH','MEDIUM','LOW'].includes(txt);

          if (isHeader)   doc.setFillColor(101, 163, 13);
          else if (isAlt) doc.setFillColor(248, 255, 240);
          else            doc.setFillColor(255, 255, 255);

          doc.setDrawColor(200, 220, 180);
          doc.rect(x, rowY, w, rH, 'FD');

          if (isHeader) {
            doc.setTextColor(255, 255, 255);
            doc.setFont(undefined, 'bold');
            doc.setFontSize(8);
            doc.text(txt, x + 2, rowY + headerH / 2 + 1.5);
          } else if (isSevValue) {
            const [r, g, b] = sevTextColor[txt] || [30, 30, 30];
            doc.setTextColor(r, g, b);
            doc.setFont(undefined, 'bold');
            doc.setFontSize(7.5);
            const lines = doc.splitTextToSize(txt, w - 4);
            const blockH = lines.length * lineH;
            const startY = rowY + (rH - blockH) / 2 + lineH - 1;
            lines.forEach((ln, li) => doc.text(ln, x + 2, startY + li * lineH));
          } else {
            doc.setTextColor(30, 30, 30);
            doc.setFont(undefined, 'normal');
            doc.setFontSize(7.5);
            const lines = doc.splitTextToSize(txt, w - 4);
            const blockH = lines.length * lineH;
            const startY = rowY + (rH - blockH) / 2 + lineH - 1;
            lines.forEach((ln, li) => doc.text(ln, x + 2, startY + li * lineH));
          }
          x += w;
        });
      };

      const drawHeader = (rowY) => { drawRow(headers, rowY, true, false, headerH); };

      checkPage(headerH + 10);
      drawHeader(y);
      y += headerH;

      const filteredIncidents = getFilteredIncidents();

      if (filteredIncidents.length === 0) {
        checkPage(10);
        doc.setFontSize(9); doc.setTextColor(120, 120, 120);
        doc.text('No incidents found for the selected criteria.', margin + 4, y + 6);
        y += 10;
      } else {
        filteredIncidents.forEach((inc, idx) => {
          const row = [
            idx + 1,
            inc.incident_id || 'N/A',
            getDriverName(inc),
            getTripName(inc),
            inc.vehicle?.model || 'N/A',
            inc.incident_type ? inc.incident_type.replace(/_/g, ' ') : 'N/A',
            inc.vehicle?.licensePlate || 'N/A',
            formatTimestamp(inc.timestamp),
            inc.severity || 'N/A',
          ];
          const rH = getRowHeight(row);
          checkPage(rH);
          if (y === margin) { drawHeader(y); y += headerH; }
          drawRow(row, y, false, idx % 2 !== 0, rH);
          y += rH;
        });

        const footerH = 8;
        checkPage(footerH);
        doc.setFillColor(220, 240, 200); doc.setDrawColor(134, 204, 22);
        doc.rect(margin, y, usable, footerH, 'FD');
        doc.setFontSize(7.5); doc.setFont(undefined, 'bold'); doc.setTextColor(30, 30, 30);
        doc.text(
          `Total: ${filteredIncidents.length}  |  Critical: ${filteredIncidents.filter(i => i.severity === 'CRITICAL').length}  |  High: ${filteredIncidents.filter(i => i.severity === 'HIGH').length}  |  Medium: ${filteredIncidents.filter(i => i.severity === 'MEDIUM').length}  |  Low: ${filteredIncidents.filter(i => i.severity === 'LOW').length}`,
          margin + 4, y + footerH - 2.5
        );
        y += footerH;
      }

      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7); doc.setTextColor(160, 160, 160);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 6, { align: 'center' });
        doc.text('DriveGuard AI  Fleet Safety Management System', margin, pageHeight - 6);
      }

      const ts = new Date().toISOString().slice(0, 10);
      doc.save(`Incident_Report_${activeTab}_${ts}.pdf`);
      alert('✅ PDF exported successfully!');
    } catch (err) {
      console.error(err);
      alert(`Error generating PDF: ${err.message}`);
    } finally { setExportLoading(false); }
  };

  const exportToCSV = () => {
    if (!report?.incidents?.length) return alert('No incidents to export');
    const filtered = getFilteredIncidents();
    const headers = ['Incident ID', 'Driver Name', 'Trip Name', 'Vehicle Model', 'Incident Type', 'License Plate', 'Timestamp', 'Severity'];
    const rows = filtered.map(inc => [
      inc.incident_id, getDriverName(inc), getTripName(inc),
      inc.vehicle?.model || 'N/A',
      inc.incident_type ? inc.incident_type.replace(/_/g, ' ') : 'N/A',
      inc.vehicle?.licensePlate || 'N/A',
      formatTimestamp(inc.timestamp), inc.severity,
    ]);
    const csv = [headers, ...rows].map(r =>
      r.map(c => (typeof c === 'string' && c.includes(',') ? `"${c}"` : c)).join(',')
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Incident_Report_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    alert('✅ CSV exported successfully!');
  };

  const filteredIncidents = getFilteredIncidents();

  const COLUMNS = [
    { label: 'Incident ID',   key: 'incident_id',   render: (inc) => inc.incident_id || 'N/A' },
    { label: 'Driver Name',   key: 'driver_name',   render: (inc) => getDriverName(inc) },
    { label: 'Trip Name',     key: 'trip_name',     render: (inc) => getTripName(inc), wrap: true },
    { label: 'Vehicle Model', key: 'vehicle_model', render: (inc) => inc.vehicle?.model || 'N/A' },
    { label: 'Incident Type', key: 'incident_type', render: (inc) => inc.incident_type ? inc.incident_type.replace(/_/g, ' ') : 'N/A' },
    { label: 'License Plate', key: 'license_plate', render: (inc) => inc.vehicle?.licensePlate || 'N/A' },
    { label: 'Timestamp',     key: 'timestamp',     render: (inc) => formatTimestamp(inc.timestamp) },
    { label: 'Severity',      key: 'severity',      render: (inc) => inc.severity },
  ];

  // On mobile, hide some less-critical columns to keep card layout clean
  const MOBILE_HIDDEN_KEYS = ['vehicle_model', 'license_plate'];
  const visibleColumns = isMobile
    ? COLUMNS.filter(c => !MOBILE_HIDDEN_KEYS.includes(c.key))
    : COLUMNS;

  // ── Green theme constants ──
  const GREEN      = '#84CC16';
  const GREEN_DARK = '#65A30D';
  const GREEN_BG   = 'rgba(132,204,22,0.08)';

  // ── Responsive padding ──
  const outerPadding = isMobile ? '16px 12px 40px' : isTablet ? '20px 16px 44px' : '28px 24px 48px';

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", padding: outerPadding }}>
      <div style={{ width: '100%' }}>

        {/* ── HEADER ── */}
        <div style={{
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`, borderRadius: '10px', padding: '10px', display: 'flex', boxShadow: '0 4px 12px rgba(132,204,22,0.3)', flexShrink: 0 }}>
              <AlertCircle size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '28px', fontWeight: 800, color: '#1f2937', fontFamily: "'Poppins', sans-serif" }}>Incident Reports</h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>DriveGuard AI Fleet Safety Management</p>
            </div>
          </div>

          {/* Export buttons — full width on mobile */}
          <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
            <button onClick={exportToPDF} disabled={exportLoading || !report}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                background: exportLoading || !report ? '#e5e7eb' : '#ef4444',
                color: exportLoading || !report ? '#9ca3af' : '#fff',
                border: 'none', borderRadius: '50px',
                padding: '10px 20px',
                cursor: exportLoading || !report ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: '13px', transition: 'all 0.3s ease',
                flex: isMobile ? 1 : 'none',
              }}>
              <FileText size={14} />
              {exportLoading ? 'Generating...' : 'Export PDF'}
            </button>
            <button onClick={exportToCSV} disabled={!report?.incidents?.length}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                background: !report?.incidents?.length ? '#e5e7eb' : `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`,
                color: !report?.incidents?.length ? '#9ca3af' : '#fff',
                border: 'none', borderRadius: '50px',
                padding: '10px 20px',
                cursor: !report?.incidents?.length ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: '13px', transition: 'all 0.3s ease',
                flex: isMobile ? 1 : 'none',
              }}>
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{
          display: 'flex',
          gap: '0',
          marginBottom: '24px',
          background: '#fff',
          border: '2px solid #e5e7eb',
          borderRadius: '50px',
          overflow: 'hidden',
          width: isMobile ? '100%' : 'fit-content',
        }}>
          {['today', 'weekly', 'monthly'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: isMobile ? '10px 0' : '10px 28px',
                border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                background: activeTab === tab ? `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)` : 'transparent',
                color: activeTab === tab ? '#fff' : '#6b7280',
                transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                borderRadius: activeTab === tab ? '50px' : '0',
                flex: isMobile ? 1 : 'none',
              }}>
              {tab === 'today' ? <Clock size={13} /> : <TrendingUp size={13} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── FILTER BAR ── */}
        {report && !loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            flexWrap: 'wrap',
            rowGap: isMobile ? '8px' : '8px',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={13} /> Filter:
            </span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => {
              const style = s !== 'ALL' ? getSeverityStyle(s) : null;
              const isActive = severityFilter === s;
              return (
                <button key={s} onClick={() => setSeverityFilter(s)}
                  style={{
                    padding: '5px 16px', border: '2px solid', borderRadius: '50px', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 600, transition: 'all 0.2s ease',
                    background: isActive ? (s === 'ALL' ? GREEN : style.dot) : '#fff',
                    color: isActive ? '#fff' : (s === 'ALL' ? GREEN_DARK : style.color),
                    borderColor: s === 'ALL' ? GREEN : style?.dot || '#e5e7eb',
                  }}>
                  {s}
                </button>
              );
            })}
            <span style={{ marginLeft: isMobile ? '0' : 'auto', fontSize: '13px', color: '#6b7280', width: isMobile ? '100%' : 'auto' }}>
              Showing <strong>{filteredIncidents.length}</strong> of <strong>{report?.incidents?.length || 0}</strong> incidents
            </span>
          </div>
        )}

        {/* ── LOADING ── */}
        {loading && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '60px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTop: `3px solid ${GREEN}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280', fontWeight: 500, margin: 0 }}>Loading incident report...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── ERROR ── */}
        {error && !loading && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
            borderLeft: '4px solid #ef4444', borderRadius: '8px',
            padding: isMobile ? '12px' : '16px 20px',
            marginBottom: '16px',
            display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
            gap: '10px', flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}>
            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 600, color: '#dc2626', fontSize: '14px' }}>Failed to load report</p>
              <p style={{ margin: '2px 0 0', color: '#ef4444', fontSize: '12px' }}>{error}</p>
            </div>
            <button onClick={() => fetchReport(activeTab)}
              style={{
                marginLeft: isMobile ? '0' : 'auto',
                display: 'flex', alignItems: 'center', gap: '4px',
                background: GREEN, color: '#fff', border: 'none', borderRadius: '50px',
                padding: '8px 16px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                width: isMobile ? '100%' : 'auto', justifyContent: 'center',
              }}>
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* ── TABLE (desktop/tablet) / CARDS (mobile) ── */}
        {report && !loading && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>

            {/* Table title bar */}
            <div style={{
              background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`,
              padding: isMobile ? '12px 16px' : '16px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '6px',
            }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: isMobile ? '12px' : '14px', letterSpacing: '0.04em', fontFamily: "'Poppins', sans-serif" }}>
                INCIDENT DATA TABLE — {(report.periodLabel || activeTab).toUpperCase()}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '20px' }}>{filteredIncidents.length} rows</span>
            </div>

            {/* ── MOBILE: Card layout ── */}
            {isMobile ? (
              <div>
                {filteredIncidents.length > 0 ? (
                  filteredIncidents.map((incident, idx) => {
                    const sev = incident.severity;
                    const s = getSeverityStyle(sev);
                    return (
                      <div key={incident.incident_id || idx}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          padding: '14px 16px',
                          background: idx % 2 === 0 ? '#fff' : GREEN_BG,
                        }}>
                        {/* Card top row: index + incident ID + severity badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: GREEN, fontWeight: 700, fontSize: '13px' }}>#{idx + 1}</span>
                            <span style={{ fontWeight: 600, color: '#1f2937', fontSize: '13px' }}>{incident.incident_id || 'N/A'}</span>
                          </div>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            background: s.bg, color: s.color,
                            padding: '3px 10px', borderRadius: '20px',
                            fontWeight: 700, fontSize: '11px',
                            border: `1px solid ${s.dot}40`,
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
                            {sev || 'N/A'}
                          </span>
                        </div>

                        {/* Card fields grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                          <div>
                            <div style={cardLabelStyle}>Driver</div>
                            <div style={cardValueStyle}>{getDriverName(incident)}</div>
                          </div>
                          <div>
                            <div style={cardLabelStyle}>Timestamp</div>
                            <div style={cardValueStyle}>{formatTimestamp(incident.timestamp)}</div>
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <div style={cardLabelStyle}>Trip Name</div>
                            <div style={{ ...cardValueStyle, whiteSpace: 'normal', lineHeight: '1.4' }}>{getTripName(incident)}</div>
                          </div>
                          <div>
                            <div style={cardLabelStyle}>Incident Type</div>
                            <span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 7px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, fontFamily: 'monospace' }}>
                              {incident.incident_type ? incident.incident_type.replace(/_/g, ' ') : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <div style={cardLabelStyle}>License Plate</div>
                            <span style={{ background: '#1f2937', color: '#f9fafb', padding: '2px 7px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                              {incident.vehicle?.licensePlate || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                    <AlertCircle size={32} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>
                      {severityFilter !== 'ALL' ? `No ${severityFilter} incidents found` : 'No incidents for this period'}
                    </p>
                  </div>
                )}

                {/* Mobile footer summary */}
                {filteredIncidents.length > 0 && (
                  <div style={{ background: GREEN_BG, borderTop: `2px solid ${GREEN}40`, padding: '10px 16px', fontSize: '12px', color: '#374151', fontWeight: 600 }}>
                    Total: {filteredIncidents.length} &nbsp;|&nbsp;
                    Critical: {filteredIncidents.filter(i => i.severity === 'CRITICAL').length} &nbsp;|&nbsp;
                    High: {filteredIncidents.filter(i => i.severity === 'HIGH').length} &nbsp;|&nbsp;
                    Medium: {filteredIncidents.filter(i => i.severity === 'MEDIUM').length} &nbsp;|&nbsp;
                    Low: {filteredIncidents.filter(i => i.severity === 'LOW').length}
                  </div>
                )}
              </div>
            ) : (
              /* ── TABLET / DESKTOP: Table layout ── */
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isTablet ? '12px' : '13px', minWidth: isTablet ? '700px' : 'auto' }}>
                  <thead>
                    <tr style={{ background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)` }}>
                      <th style={thStyle}>#</th>
                      {visibleColumns.map((col) => (
                        <th key={col.key} style={thStyle}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncidents.length > 0 ? (
                      filteredIncidents.map((incident, idx) => {
                        const isEven = idx % 2 === 0;
                        return (
                          <tr key={incident.incident_id || idx}
                            style={{ background: isEven ? '#fff' : GREEN_BG, transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(132,204,22,0.06)'}
                            onMouseLeave={e => e.currentTarget.style.background = isEven ? '#fff' : GREEN_BG}>
                            <td style={{ ...tdStyle, color: GREEN, fontWeight: 700, textAlign: 'center', width: '36px' }}>{idx + 1}</td>
                            {visibleColumns.map((col) => {
                              if (col.key === 'severity') {
                                const sev = incident.severity;
                                const s = getSeverityStyle(sev);
                                return (
                                  <td key={col.key} style={tdStyle}>
                                    <span style={{
                                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                                      background: s.bg, color: s.color,
                                      padding: '3px 10px', borderRadius: '20px',
                                      fontWeight: 700, fontSize: '11px', whiteSpace: 'nowrap',
                                      border: `1px solid ${s.dot}40`
                                    }}>
                                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
                                      {sev || 'N/A'}
                                    </span>
                                  </td>
                                );
                              }
                              if (col.key === 'incident_type') {
                                return (
                                  <td key={col.key} style={tdStyle}>
                                    <span style={{ background: '#f3f4f6', color: '#374151', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, fontFamily: 'monospace' }}>
                                      {col.render(incident)}
                                    </span>
                                  </td>
                                );
                              }
                              if (col.key === 'license_plate') {
                                return (
                                  <td key={col.key} style={tdStyle}>
                                    <span style={{ background: '#1f2937', color: '#f9fafb', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                                      {col.render(incident)}
                                    </span>
                                  </td>
                                );
                              }
                              return (
                                <td key={col.key} style={col.key === 'trip_name'
                                  ? { ...tdStyle, whiteSpace: 'normal', minWidth: isTablet ? '140px' : '200px', maxWidth: isTablet ? '180px' : '260px', lineHeight: '1.4' }
                                  : tdStyle}>
                                  {col.render(incident)}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={visibleColumns.length + 1} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                          <AlertCircle size={32} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.4 }} />
                          <p style={{ margin: 0, fontWeight: 500 }}>
                            {severityFilter !== 'ALL' ? `No ${severityFilter} incidents found` : 'No incidents for this period'}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>

                  {filteredIncidents.length > 0 && (
                    <tfoot>
                      <tr style={{ background: GREEN_BG, borderTop: `2px solid ${GREEN}40` }}>
                        <td colSpan={visibleColumns.length + 1} style={{ padding: '10px 20px', fontSize: '12px', color: '#374151', fontWeight: 600 }}>
                          Total: {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''} &nbsp;|&nbsp;
                          Critical: {filteredIncidents.filter(i => i.severity === 'CRITICAL').length} &nbsp;|&nbsp;
                          High: {filteredIncidents.filter(i => i.severity === 'HIGH').length} &nbsp;|&nbsp;
                          Medium: {filteredIncidents.filter(i => i.severity === 'MEDIUM').length} &nbsp;|&nbsp;
                          Low: {filteredIncidents.filter(i => i.severity === 'LOW').length}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && !error && !report && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '60px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
            <AlertCircle size={40} color="#d1d5db" style={{ display: 'block', margin: '0 auto 12px' }} />
            <p style={{ color: '#9ca3af', fontWeight: 500, margin: 0 }}>No data available. Select a time period above.</p>
          </div>
        )}

      </div>
    </div>
  );
};

// ── TABLE CELL STYLES ──
const thStyle = {
  padding: '12px 14px',
  textAlign: 'left',
  color: '#fff',
  fontWeight: 700,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
  borderRight: '1px solid rgba(255,255,255,0.2)',
  userSelect: 'none',
};

const tdStyle = {
  padding: '10px 14px',
  color: '#1f2937',
  borderBottom: '1px solid #e5e7eb',
  borderRight: '1px solid #f3f4f6',
  whiteSpace: 'nowrap',
  verticalAlign: 'middle',
};

// ── MOBILE CARD STYLES ──
const cardLabelStyle = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#9ca3af',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '2px',
};

const cardValueStyle = {
  fontSize: '13px',
  color: '#1f2937',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

export default IncidentReports;
