import React from 'react';
import { Card, CardHeader, Chip, SeverityBadge } from '../ui';
import { IcoEmpty } from '../icons';
import { getIncidentIcon } from '../../utils/getIncidentIcon';
import { formatDate } from '../../services/api';

const MOBILE_HEADERS  = ['Incident Type', 'Driver', 'Severity'];
const DESKTOP_HEADERS = ['Timestamp', 'Incident Type', 'Driver', 'Severity', 'Description'];

/**
 * Table of the most recent safety incidents.
 *
 * @param {object[]} incidents  - Array of incident objects from the API
 * @param {number}   total      - Total incident count (shown in chip)
 * @param {boolean}  isMobile
 * @param {number}   [delay=0]
 */
const RecentViolationsTable = ({ incidents = [], total = 0, isMobile, delay = 0 }) => {
  const headers = isMobile ? MOBILE_HEADERS : DESKTOP_HEADERS;
  const rows    = incidents.slice(0, 10);

  return (
    <Card delay={delay}>
      <CardHeader
        title="Recent Violations"
        subtitle={`Last ${Math.min(rows.length, 10)} incidents`}
        right={
          <Chip
            label={`${total} Total`}
            color="#ef4444"
            bg="#fef2f2"
            border="#fecaca"
          />
        }
      />

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? 'unset' : 600 }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
              {headers.map(h => (
                <th
                  key={h}
                  style={{
                    padding: isMobile ? '10px 12px' : '11px 20px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((incident, idx) => {
                const IncidentIcon = getIncidentIcon(incident.incident_type);
                const firstName    = incident.driver?.user?.firstName ?? '?';
                const lastName     = incident.driver?.user?.lastName  ?? '';

                return (
                  <tr
                    key={incident.incident_id}
                    className="dash-tr"
                    style={{
                      borderBottom: '1px solid #f9fafb',
                      animation: `fadeUp 0.4s ease ${0.45 + idx * 0.04}s both`,
                    }}
                  >
                    {/* Timestamp — desktop only */}
                    {!isMobile && (
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
                          {formatDate(incident.timestamp)}
                        </span>
                      </td>
                    )}

                    {/* Incident type */}
                    <td style={{ padding: isMobile ? '12px 12px' : '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10, whiteSpace: 'nowrap' }}>
                        <span style={{
                          width: isMobile ? 26 : 32,
                          height: isMobile ? 26 : 32,
                          borderRadius: 8,
                          background: '#f9fafb',
                          border: '1px solid #f3f4f6',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <IncidentIcon size={isMobile ? 13 : 16} color="#6b7280" />
                        </span>
                        <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 600, color: '#374151' }}>
                          {incident.incident_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>

                    {/* Driver */}
                    <td style={{ padding: isMobile ? '12px 12px' : '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 9, whiteSpace: 'nowrap' }}>
                        <div style={{
                          width: isMobile ? 24 : 30,
                          height: isMobile ? 24 : 30,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #84CC16 0%, #3b82f6 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: isMobile ? 9 : 11,
                          fontWeight: 800,
                          color: '#fff',
                          flexShrink: 0,
                        }}>
                          {firstName[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 600, color: '#374151' }}>
                          {firstName} {lastName}
                        </span>
                      </div>
                    </td>

                    {/* Severity */}
                    <td style={{ padding: isMobile ? '12px 12px' : '14px 20px' }}>
                      <SeverityBadge severity={incident.severity} />
                    </td>

                    {/* Description — desktop only */}
                    {!isMobile && (
                      <td style={{ padding: '14px 20px', maxWidth: 280 }}>
                        <span style={{
                          fontSize: 12, color: '#9ca3af',
                          display: 'block', overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          maxWidth: 260,
                        }}>
                          {incident.description}
                        </span>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={headers.length} style={{ textAlign: 'center', padding: '56px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: 0.3 }}>
                    <IcoEmpty />
                  </div>
                  <p style={{ color: '#d1d5db', fontSize: 14, fontWeight: 500 }}>No incidents recorded yet</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default RecentViolationsTable;
