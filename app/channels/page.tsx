'use client';

import { useEffect, useState } from 'react';

const CHANNELS = [
  { id: 1, from: 'Call', to: 'Booking',    low: 10.7, high: 15, color: '#7c3aed', bg: '#ede9fe' },
  { id: 2, from: 'Booked', to: 'Attended', low: 43,   high: 49, color: '#0284c7', bg: '#e0f2fe' },
];

const METRICS: { key: string; label: string; radius: number }[] = [
  { key: 'bestDay',     label: 'Best Day',     radius: 4   },
  { key: 'bestWeek',    label: 'Best Week',    radius: 5   },
  { key: 'currentWeek', label: 'Current Week', radius: 5.5 },
  { key: 'avg',         label: 'Average',      radius: 7   },
];

const MAX_WEEKS = 8;

type StaffMember = {
  name: string;
  avatar: string;
  color: string;
  weeksOnBoard: number;
  channels: ({
    avg: number | null;
    bestDay: number | null;
    bestWeek: number | null;
    currentWeek: number | null;
  } | null)[];
};

function ChannelPanel({ ch, chIdx, staff }: {
  ch: typeof CHANNELS[0];
  chIdx: number;
  staff: StaffMember[];
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const yPad   = (ch.high - ch.low) * 1.5;
  const yMin   = Math.max(0, ch.low - yPad);
  const yMax   = ch.high + yPad;
  const yRange = yMax - yMin;

  const W = 720, H = 290;
  const pL = 52, pR = 28, pT = 32, pB = 52;
  const plotW = W - pL - pR;
  const plotH = H - pT - pB;

  const xPos = (weeks: number) => pL + (weeks / MAX_WEEKS) * plotW;
  const yPos = (val: number)   => pT + plotH - ((val - yMin) / yRange) * plotH;

  const bandTop    = yPos(ch.high);
  const bandBottom = yPos(ch.low);
  const bandH      = bandBottom - bandTop;

  const step = (ch.high - ch.low) > 20 ? 10 : 5;
  const gridY: number[] = [];
  let g = Math.ceil(yMin / step) * step;
  while (g <= yMax) { gridY.push(g); g += step; }

  // Expected ramp: low at W1 → high at W8
  const progPts = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(w => ({
    x: xPos(w),
    y: yPos(ch.low + (ch.high - ch.low) * Math.min(1, w / 7)),
  }));
  const progPath = progPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: '14px', overflow: 'hidden',
      boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 22px', borderBottom: '1px solid #f1f5f9',
        background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: ch.bg, color: ch.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 800,
          }}>
            {chIdx + 1}
          </div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', letterSpacing: '-0.01em' }}>
            {ch.from} → {ch.to}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#f97316', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Low</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{ch.low}%</div>
          </div>
          <div style={{ fontSize: '16px', color: '#e2e8f0' }}>↔</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>High</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{ch.high}%</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '4px 14px 14px', overflowX: 'auto' }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`}
          style={{ display: 'block', minWidth: '380px' }}
          onMouseLeave={() => setHovered(null)}>

          {/* Y grid */}
          {gridY.map(v => (
            <g key={v}>
              <line x1={pL} y1={yPos(v)} x2={W - pR} y2={yPos(v)} stroke="#f1f5f9" strokeWidth="1" />
              <text x={pL - 6} y={yPos(v) + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
                {v}%
              </text>
            </g>
          ))}

          {/* X grid */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(w => (
            <g key={w}>
              <line x1={xPos(w)} y1={pT} x2={xPos(w)} y2={H - pB} stroke="#f1f5f9" strokeWidth="1" />
              <text x={xPos(w)} y={H - pB + 16} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
                {w === 0 ? 'Start' : `W${w}`}
              </text>
            </g>
          ))}

          <text x={pL + plotW / 2} y={H - 5} textAnchor="middle"
            fontSize="11" fill="#94a3b8" fontFamily="sans-serif" fontStyle="italic">
            Weeks on board →
          </text>

          {/* Band */}
          <rect x={pL} y={bandTop} width={plotW} height={bandH} fill={ch.color} opacity="0.07" />
          <line x1={pL} y1={bandTop} x2={W - pR} y2={bandTop} stroke={ch.color} strokeWidth="2.5" />
          <rect x={pL} y={bandTop - 19} width={56} height={18} rx="4" fill={ch.color} />
          <text x={pL + 28} y={bandTop - 6} textAnchor="middle"
            fontSize="9.5" fill="#fff" fontFamily="sans-serif" fontWeight="700">
            HIGH {ch.high}%
          </text>

          <line x1={pL} y1={bandBottom} x2={W - pR} y2={bandBottom} stroke={ch.color} strokeWidth="2.5" opacity="0.55" />
          <rect x={pL} y={bandBottom + 2} width={52} height={18} rx="4" fill={ch.color} opacity="0.55" />
          <text x={pL + 26} y={bandBottom + 14} textAnchor="middle"
            fontSize="9.5" fill="#fff" fontFamily="sans-serif" fontWeight="700">
            LOW {ch.low}%
          </text>

          {/* Expected ramp */}
          <path d={progPath} stroke={ch.color} strokeWidth="1.5" strokeDasharray="6 3" fill="none" opacity="0.3" />
          <text x={xPos(4.5)} y={yPos(ch.high) - 7} fontSize="9" fill={ch.color}
            fontFamily="sans-serif" opacity="0.5" textAnchor="middle">
            expected ramp
          </text>

          {/* Staff dots */}
          {staff.map(s => {
            const chData = s.channels[chIdx];
            if (!chData) return null;

            const availableMetrics = METRICS.filter(m => (chData as any)[m.key] !== null);
            const isHov = hovered === s.name;
            const xCoord = xPos(s.weeksOnBoard);

            // No data at all — ghost dot at start
            if (availableMetrics.length === 0) {
              return (
                <g key={s.name} onMouseEnter={() => setHovered(s.name)} style={{ cursor: 'pointer' }}>
                  <circle cx={xCoord} cy={yPos(yMin + yRange * 0.25)}
                    r={6} fill={s.color} opacity="0.3" stroke="#fff" strokeWidth="1.5" />
                  <text x={xCoord + 10} y={yPos(yMin + yRange * 0.25) - 2}
                    fontSize="9.5" fill={s.color} fontFamily="sans-serif" fontWeight="800">
                    {s.name}
                  </text>
                </g>
              );
            }

            const allVals = availableMetrics.map(m => (chData as any)[m.key] as number);
            const topVal  = Math.max(...allVals);
            const botVal  = Math.min(...allVals);

            return (
              <g key={s.name}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(s.name)}>

                {/* Connector line */}
                {availableMetrics.length > 1 && (
                  <line
                    x1={xCoord} y1={yPos(topVal)}
                    x2={xCoord} y2={yPos(botVal)}
                    stroke={s.color} strokeWidth="1.5" opacity="0.2" />
                )}

                {/* Dots */}
                {availableMetrics.map((m, mi) => {
                  const val = (chData as any)[m.key] as number;
                  const cy  = yPos(val);
                  const r   = isHov ? m.radius + 2.5 : m.radius;
                  return (
                    <g key={m.key}>
                      {isHov && <circle cx={xCoord} cy={cy} r={r + 5} fill={s.color} opacity="0.12" />}
                      <circle cx={xCoord} cy={cy} r={r}
                        fill={s.color} stroke="#fff" strokeWidth="2"
                        opacity={mi === availableMetrics.length - 1 ? 1 : 0.6} />
                    </g>
                  );
                })}

                {/* Name label (not hovered) */}
                {!isHov && (
                  <text x={xCoord + 10} y={yPos(topVal) - 4}
                    fontSize="9.5" fill={s.color} fontFamily="sans-serif" fontWeight="800">
                    {s.name}
                  </text>
                )}

                {/* Tooltip */}
                {isHov && (() => {
                  const tipW = 156;
                  const tipH = 28 + availableMetrics.length * 15 + 20;
                  const flipLeft = s.weeksOnBoard >= MAX_WEEKS - 1;
                  const tipX = flipLeft ? xCoord - tipW - 12 : xCoord + 14;
                  const tipY = yPos(topVal) - 16;

                  const avg = chData.avg;
                  const bandStatus = avg === null ? null
                    : avg < ch.low  ? { label: `↓ ${(ch.low - avg).toFixed(1)}pp below band`, color: '#ef4444' }
                    : avg > ch.high ? { label: `↑ ${(avg - ch.high).toFixed(1)}pp above band`, color: '#7c3aed' }
                    : { label: '✓ In band', color: '#10b981' };

                  return (
                    <g>
                      <rect x={tipX} y={tipY} width={tipW} height={tipH} rx="7" fill="#1e293b" opacity="0.93" />
                      <text x={tipX + 10} y={tipY + 17}
                        fontSize="12" fill="#f1f5f9" fontFamily="sans-serif" fontWeight="700">
                        {s.name} · {s.weeksOnBoard === 0 ? 'Day 1' : `W${s.weeksOnBoard}`}
                      </text>
                      {availableMetrics.map((m, i) => {
                        const val = (chData as any)[m.key] as number;
                        return (
                          <text key={m.key}
                            x={tipX + 10} y={tipY + 33 + i * 15}
                            fontSize="10" fill="#cbd5e1" fontFamily="sans-serif">
                            {m.label}: {val.toFixed(1)}%
                          </text>
                        );
                      })}
                      {bandStatus && (
                        <text x={tipX + 10} y={tipY + tipH - 7}
                          fontSize="10" fill={bandStatus.color} fontFamily="sans-serif" fontWeight="700">
                          {bandStatus.label}
                        </text>
                      )}
                    </g>
                  );
                })()}
              </g>
            );
          })}

          {/* Axes */}
          <line x1={pL} y1={pT} x2={pL} y2={H - pB} stroke="#e2e8f0" strokeWidth="1.5" />
          <line x1={pL} y1={H - pB} x2={W - pR} y2={H - pB} stroke="#e2e8f0" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}

export default function ChannelsPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/channels-data');
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setStaff(data.staff);
      setLastUpdated(new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans','Inter',sans-serif" }}>

      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '20px 40px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>
            Lead Gen Performance Channels
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
            Live from Airtable · Y = cut-through rate · X = actual weeks on board
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
          {METRICS.map((m, i) => (
            <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>{m.label}</span>
              <div style={{
                width: `${m.radius * 2}px`, height: `${m.radius * 2}px`,
                borderRadius: '50%', background: '#94a3b8',
                opacity: i === METRICS.length - 1 ? 1 : 0.5,
                border: '2px solid #fff', boxShadow: '0 0 0 1px #cbd5e1',
              }} />
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Expected ramp</span>
            <svg width="28" height="8">
              <line x1="0" y1="4" x2="28" y2="4" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Staff row + refresh */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #f1f5f9',
        padding: '10px 40px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Staff
          </span>
          {staff.map(s => (
            <div key={s.name} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: '20px', padding: '4px 12px 4px 5px',
            }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%', background: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 800, color: '#fff',
              }}>
                {s.avatar}
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{s.name}</span>
              <span style={{
                fontSize: '11px', fontWeight: 600,
                color: s.weeksOnBoard === 0 ? '#f97316' : '#64748b',
                background: s.weeksOnBoard === 0 ? '#fff7ed' : 'transparent',
                padding: s.weeksOnBoard === 0 ? '1px 5px' : '0',
                borderRadius: '4px',
              }}>
                {s.weeksOnBoard === 0 ? 'Day 1' : `W${s.weeksOnBoard}`}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {lastUpdated && (
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Updated {lastUpdated}</span>
          )}
          <button onClick={load} disabled={loading} style={{
            padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0',
            background: loading ? '#f8fafc' : '#fff', color: '#475569',
            fontSize: '12px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Loading…' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '28px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        {error ? (
          <div style={{
            padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '10px', color: '#dc2626', fontSize: '13px',
          }}>
            Failed to load: {error}
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {CHANNELS.map(ch => (
              <div key={ch.id} style={{
                height: '340px', background: '#fff', border: '1px solid #e2e8f0',
                borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Loading {ch.from} → {ch.to}…</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {CHANNELS.map((ch, i) => (
              <ChannelPanel key={ch.id} ch={ch} chIdx={i} staff={staff} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
