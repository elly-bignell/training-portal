'use client';

import { useState } from 'react';

// ─── Channel definitions ───────────────────────────────────────────────────
const CHANNELS = [
  { id: 1, from: 'Call', to: 'Booking',     low: 10.7, high: 15, color: '#7c3aed', bg: '#ede9fe' },
  { id: 2, from: 'Booked', to: 'Attended',  low: 43,   high: 49, color: '#0284c7', bg: '#e0f2fe' },
  { id: 3, from: 'Attended', to: 'Pipeline',low: 66,   high: 78, color: '#059669', bg: '#d1fae5' },
  { id: 4, from: 'Pipeline', to: 'Close',   low: 50,   high: 70, color: '#d97706', bg: '#fef3c7' },
];

// ─── Staff — placeholder data ──────────────────────────────────────────────
// channels[i] = { avg, bestDay, bestWeek, currentWeek } or null if N/A
const STAFF = [
  {
    name: 'Cindy', role: 'Lead Gen', avatar: 'C', weeksOnBoard: 14,
    channels: [
      { avg: 12.5, bestDay: 18.2, bestWeek: 16.1, currentWeek: 13.8 },
      { avg: 45.0, bestDay: 55.0, bestWeek: 51.0, currentWeek: 44.0 },
      null, null,
    ],
  },
  {
    name: 'Krishna', role: 'Lead Gen', avatar: 'K', weeksOnBoard: 12,
    channels: [
      { avg: 11.2, bestDay: 14.8, bestWeek: 13.5, currentWeek: 10.9 },
      { avg: 43.5, bestDay: 50.0, bestWeek: 47.0, currentWeek: 42.0 },
      null, null,
    ],
  },
  {
    name: 'Sydney', role: 'Lead Gen', avatar: 'S', weeksOnBoard: 4,
    channels: [
      { avg:  9.8, bestDay: 13.0, bestWeek: 11.5, currentWeek: 10.2 },
      { avg: 41.0, bestDay: 47.0, bestWeek: 44.0, currentWeek: 40.0 },
      null, null,
    ],
  },
  {
    name: 'Riley', role: 'Lead Gen', avatar: 'R', weeksOnBoard: 2,
    channels: [
      { avg:  8.5, bestDay: 11.0, bestWeek: 10.0, currentWeek:  8.5 },
      { avg: 38.0, bestDay: 44.0, bestWeek: 41.0, currentWeek: 38.0 },
      null, null,
    ],
  },
  {
    name: 'Lucas', role: 'Closer', avatar: 'L', weeksOnBoard: 14,
    channels: [
      null,
      { avg: 47.0, bestDay: 58.0, bestWeek: 54.0, currentWeek: 46.0 },
      { avg: 73.0, bestDay: 85.0, bestWeek: 80.0, currentWeek: 71.0 },
      { avg: 62.0, bestDay: 78.0, bestWeek: 72.0, currentWeek: 60.0 },
    ],
  },
  {
    name: 'Dylan', role: 'Closer', avatar: 'D', weeksOnBoard: 12,
    channels: [
      null,
      { avg: 44.5, bestDay: 53.0, bestWeek: 50.0, currentWeek: 43.0 },
      { avg: 69.0, bestDay: 80.0, bestWeek: 76.0, currentWeek: 67.0 },
      { avg: 57.0, bestDay: 72.0, bestWeek: 66.0, currentWeek: 55.0 },
    ],
  },
  {
    name: 'Felipe', role: 'Closer', avatar: 'F', weeksOnBoard: 10,
    channels: [
      null,
      { avg: 45.5, bestDay: 52.0, bestWeek: 49.0, currentWeek: 44.5 },
      { avg: 70.0, bestDay: 81.0, bestWeek: 77.0, currentWeek: 69.0 },
      { avg: 59.0, bestDay: 74.0, bestWeek: 68.0, currentWeek: 57.0 },
    ],
  },
  {
    name: 'Thomas', role: 'Closer', avatar: 'T', weeksOnBoard: 8,
    channels: [
      null,
      { avg: 43.0, bestDay: 50.0, bestWeek: 47.0, currentWeek: 43.0 },
      { avg: 67.0, bestDay: 78.0, bestWeek: 74.0, currentWeek: 65.0 },
      { avg: 53.0, bestDay: 68.0, bestWeek: 62.0, currentWeek: 51.0 },
    ],
  },
];

const METRICS = [
  { key: 'avg',          label: 'Average',      color: '#1e293b', radius: 6,  opacity: 1    },
  { key: 'currentWeek',  label: 'Current Week', color: '#d97706', radius: 5,  opacity: 0.9  },
  { key: 'bestWeek',     label: 'Best Week',    color: '#0284c7', radius: 4,  opacity: 0.8  },
  { key: 'bestDay',      label: 'Best Day',     color: '#059669', radius: 3.5,opacity: 0.75 },
];

const AVATAR_COLORS: Record<string, string> = {
  Cindy: '#7c3aed', Krishna: '#0284c7', Sydney: '#059669',
  Riley:  '#d97706', Lucas:   '#be185d', Dylan:   '#0891b2',
  Felipe: '#65a30d', Thomas:  '#9333ea',
};

const MAX_WEEKS = 16;

// ─── Single channel panel ──────────────────────────────────────────────────
function ChannelPanel({ ch, chIdx }: { ch: typeof CHANNELS[0]; chIdx: number }) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Y axis range: zoom tight around the band + padding
  const yPad   = (ch.high - ch.low) * 1.4;
  const yMin   = Math.max(0, ch.low - yPad);
  const yMax   = ch.high + yPad;
  const yRange = yMax - yMin;

  const W = 700, H = 300;
  const pL = 50, pR = 24, pT = 30, pB = 50;
  const plotW = W - pL - pR;
  const plotH = H - pT - pB;

  const xPos = (weeks: number) => pL + (weeks / MAX_WEEKS) * plotW;
  const yPos = (val: number)   => pT + plotH - ((val - yMin) / yRange) * plotH;

  const bandTop    = yPos(ch.high);
  const bandBottom = yPos(ch.low);
  const bandH      = bandBottom - bandTop;

  // Y grid every 5% (or 10% for wide channels)
  const step = (ch.high - ch.low) > 20 ? 10 : 5;
  const gridY: number[] = [];
  let g = Math.ceil(yMin / step) * step;
  while (g <= yMax) { gridY.push(g); g += step; }

  // Expected progression path: starts at low@ week 2, reaches high@ week 12
  const progPts = [0, 2, 4, 6, 8, 10, 12].map(w => ({
    x: xPos(w),
    y: yPos(w < 2 ? ch.low : ch.low + (ch.high - ch.low) * Math.min(1, (w - 2) / 10)),
  }));
  const progPath = progPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '14px',
      overflow: 'hidden',
      boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
    }}>
      {/* Header */}
      <div style={{
        padding: '13px 20px',
        borderBottom: '1px solid #f1f5f9',
        background: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: ch.bg, color: ch.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 800,
          }}>
            {chIdx + 1}
          </div>
          <div>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', letterSpacing: '-0.01em' }}>
              {ch.from} → {ch.to}
            </span>
            <span style={{ marginLeft: '8px', fontSize: '11px', color: '#94a3b8' }}>Channel {chIdx + 1}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#f97316', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Low band</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{ch.low}%</div>
          </div>
          <div style={{ fontSize: '18px', color: '#cbd5e1' }}>↔</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>High band</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{ch.high}%</div>
          </div>
        </div>
      </div>

      {/* SVG chart */}
      <div style={{ padding: '4px 12px 12px', overflowX: 'auto' }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', minWidth: '400px' }}
          onMouseLeave={() => setHovered(null)}>

          {/* Y gridlines + labels */}
          {gridY.map(v => (
            <g key={v}>
              <line x1={pL} y1={yPos(v)} x2={W - pR} y2={yPos(v)}
                stroke="#f1f5f9" strokeWidth="1" />
              <text x={pL - 6} y={yPos(v) + 4} textAnchor="end"
                fontSize="10" fill="#94a3b8" fontFamily="sans-serif">{v}%</text>
            </g>
          ))}

          {/* X gridlines + labels */}
          {[0, 2, 4, 6, 8, 10, 12, 14, 16].map(w => (
            <g key={w}>
              <line x1={xPos(w)} y1={pT} x2={xPos(w)} y2={H - pB}
                stroke="#f1f5f9" strokeWidth="1" />
              <text x={xPos(w)} y={H - pB + 14} textAnchor="middle"
                fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
                {w === 0 ? 'Start' : `W${w}`}
              </text>
            </g>
          ))}

          {/* X axis label */}
          <text x={pL + plotW / 2} y={H - 4} textAnchor="middle"
            fontSize="11" fill="#94a3b8" fontFamily="sans-serif" fontStyle="italic">
            Weeks on board →
          </text>

          {/* TARGET BAND fill */}
          <rect x={pL} y={bandTop} width={plotW} height={bandH}
            fill={ch.color} opacity="0.07" />

          {/* HIGH line */}
          <line x1={pL} y1={bandTop} x2={W - pR} y2={bandTop}
            stroke={ch.color} strokeWidth="2.5" />
          {/* HIGH label left */}
          <rect x={pL} y={bandTop - 18} width={52} height={17} rx="4" fill={ch.color} />
          <text x={pL + 26} y={bandTop - 6} textAnchor="middle"
            fontSize="9.5" fill="#fff" fontFamily="sans-serif" fontWeight="700">
            HIGH {ch.high}%
          </text>

          {/* LOW line */}
          <line x1={pL} y1={bandBottom} x2={W - pR} y2={bandBottom}
            stroke={ch.color} strokeWidth="2.5" opacity="0.6" />
          {/* LOW label left */}
          <rect x={pL} y={bandBottom + 2} width={48} height={17} rx="4" fill={ch.color} opacity="0.6" />
          <text x={pL + 24} y={bandBottom + 14} textAnchor="middle"
            fontSize="9.5" fill="#fff" fontFamily="sans-serif" fontWeight="700">
            LOW {ch.low}%
          </text>

          {/* Expected progression dashed */}
          <path d={progPath} stroke={ch.color} strokeWidth="1.5"
            strokeDasharray="6 3" fill="none" opacity="0.35" />
          <text x={xPos(11)} y={yPos(ch.high) - 6}
            fontSize="9" fill={ch.color} fontFamily="sans-serif" opacity="0.55">
            ← expected progression
          </text>

          {/* STAFF DOTS */}
          {STAFF.map(staff => {
            const chData = staff.channels[chIdx];
            if (!chData) return null;
            const isHov = hovered === staff.name;
            const aColor = AVATAR_COLORS[staff.name] || '#64748b';

            return (
              <g key={staff.name}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(staff.name)}>

                {/* Vertical connector between dots for this person */}
                {(() => {
                  const vals = METRICS.map(m => (chData as any)[m.key] as number);
                  const minY = Math.min(...vals);
                  const maxY = Math.max(...vals);
                  return (
                    <line
                      x1={xPos(staff.weeksOnBoard)} y1={yPos(maxY)}
                      x2={xPos(staff.weeksOnBoard)} y2={yPos(minY)}
                      stroke={aColor} strokeWidth="1" opacity="0.25" />
                  );
                })()}

                {/* Dots, each metric offset by a tiny x jitter for legibility */}
                {METRICS.map((m, mi) => {
                  const val = (chData as any)[m.key] as number;
                  const cx  = xPos(staff.weeksOnBoard) + (mi - 1.5) * 4;
                  const cy  = yPos(val);
                  const r   = isHov ? m.radius + 2 : m.radius;
                  return (
                    <g key={m.key}>
                      {isHov && (
                        <circle cx={cx} cy={cy} r={r + 4} fill={aColor} opacity="0.15" />
                      )}
                      <circle cx={cx} cy={cy} r={r}
                        fill={aColor} opacity={m.opacity}
                        stroke="#fff" strokeWidth="1.5" />
                    </g>
                  );
                })}

                {/* Initials label (avg dot = first metric) */}
                {!isHov && (
                  <text
                    x={xPos(staff.weeksOnBoard)}
                    y={yPos((chData as any)['avg']) - METRICS[0].radius - 4}
                    textAnchor="middle" fontSize="9" fill={aColor}
                    fontFamily="sans-serif" fontWeight="800">
                    {staff.avatar}
                  </text>
                )}

                {/* Hover tooltip */}
                {isHov && (() => {
                  const tipX = xPos(staff.weeksOnBoard) + 14;
                  const tipY = yPos((chData as any)['bestDay']) - 10;
                  const tipW = 136, tipH = 88;
                  return (
                    <g>
                      <rect x={tipX} y={tipY} width={tipW} height={tipH}
                        rx="7" fill="#1e293b" opacity="0.93" />
                      <text x={tipX + 10} y={tipY + 16}
                        fontSize="11" fill="#f1f5f9" fontFamily="sans-serif" fontWeight="700">
                        {staff.name} · W{staff.weeksOnBoard}
                      </text>
                      {METRICS.map((m, i) => (
                        <text key={m.key}
                          x={tipX + 10} y={tipY + 32 + i * 14}
                          fontSize="10" fill="#cbd5e1" fontFamily="sans-serif">
                          {m.label}: {(chData as any)[m.key]}%
                        </text>
                      ))}
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

// ─── Page ──────────────────────────────────────────────────────────────────
export default function ChannelsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans','Inter',sans-serif" }}>

      {/* Top bar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '20px 40px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>
            Performance Channels
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
            Y axis = cut-through rate · X axis = weeks on board · hover a staff member for detail
          </p>
        </div>

        {/* Metric legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {METRICS.map(m => (
            <div key={m.key} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: '20px', padding: '4px 10px',
            }}>
              <div style={{
                width: `${m.radius * 2}px`, height: `${m.radius * 2}px`,
                borderRadius: '50%', background: m.color, flexShrink: 0,
              }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Staff key */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #f1f5f9',
        padding: '10px 40px', display: 'flex', gap: '8px', flexWrap: 'wrap',
      }}>
        {STAFF.map(s => (
          <div key={s.name} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: '20px', padding: '4px 10px 4px 4px',
          }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%',
              background: AVATAR_COLORS[s.name],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 800, color: '#fff',
            }}>
              {s.avatar}
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{s.name}</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>·</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>W{s.weeksOnBoard}</span>
          </div>
        ))}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#f8fafc', border: '1px dashed #cbd5e1',
          borderRadius: '20px', padding: '4px 10px',
        }}>
          <svg width="24" height="6">
            <line x1="0" y1="3" x2="24" y2="3" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 2" />
          </svg>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Expected progression</span>
        </div>
      </div>

      {/* Channel panels */}
      <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px', margin: '0 auto' }}>
        {CHANNELS.map((ch, i) => <ChannelPanel key={ch.id} ch={ch} chIdx={i} />)}
      </div>

      <p style={{ textAlign: 'center', fontSize: '12px', color: '#cbd5e1', paddingBottom: '32px', fontStyle: 'italic' }}>
        ⚠️ Placeholder data — connect to Airtable to show live cut-through rates per staff member
      </p>
    </div>
  );
}
