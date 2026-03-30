'use client';

import { useState } from 'react';

// ─── Channel definitions ───────────────────────────────────────────────────
const CHANNELS = [
  { id: 1, from: 'Call', to: 'Booking',      low: 10.7, high: 15, color: '#7c3aed', bg: '#ede9fe' },
  { id: 2, from: 'Booked', to: 'Attended',   low: 43,   high: 49, color: '#0284c7', bg: '#e0f2fe' },
];

// ─── Staff — lead gen only ─────────────────────────────────────────────────
// weeksOnBoard: actual weeks in (Riley=0 = first day, Sydney=1, Cindy/Krishna=6)
//
// Metric rules so data is logically consistent:
//   bestDay  ≥  bestWeek  ≥  avg  (a single great day can't drag the average up)
//   currentWeek sits wherever it honestly sits
//   If a metric doesn't exist yet (e.g. Riley has no "best week" on day 1) → null
//
// ⚠️  ALL VALUES BELOW ARE PLACEHOLDER — replace with Airtable feed
const STAFF: {
  name: string;
  avatar: string;
  weeksOnBoard: number;
  color: string;
  channels: ({
    avg: number | null;
    currentWeek: number | null;
    bestWeek: number | null;
    bestDay: number | null;
  } | null)[];
}[] = [
  {
    name: 'Riley',
    avatar: 'R',
    weeksOnBoard: 0,          // first day — sits at "Start"
    color: '#d97706',
    channels: [
      // Call→Booking: only have today's partial data, no weekly averages yet
      { avg: null, currentWeek: null, bestWeek: null, bestDay: 8.2 },
      // Booked→Attended: no data yet
      { avg: null, currentWeek: null, bestWeek: null, bestDay: null },
    ],
  },
  {
    name: 'Sydney',
    avatar: 'S',
    weeksOnBoard: 1,          // end of week 1
    color: '#059669',
    channels: [
      // One week of data — avg ≈ week rate, best day higher than avg
      { avg: 9.1, currentWeek: 9.1, bestWeek: 9.1, bestDay: 13.5 },
      { avg: 40.0, currentWeek: 40.0, bestWeek: 40.0, bestDay: 50.0 },
    ],
  },
  {
    name: 'Cindy',
    avatar: 'C',
    weeksOnBoard: 6,
    color: '#7c3aed',
    channels: [
      // 6 weeks: avg pulls below best week/day
      { avg: 11.8, currentWeek: 12.4, bestWeek: 14.2, bestDay: 17.5 },
      { avg: 44.5, currentWeek: 45.0, bestWeek: 47.0, bestDay: 54.0 },
    ],
  },
  {
    name: 'Krishna',
    avatar: 'K',
    weeksOnBoard: 6,
    color: '#0891b2',
    channels: [
      { avg: 10.9, currentWeek: 11.5, bestWeek: 13.1, bestDay: 15.8 },
      { avg: 43.2, currentWeek: 44.0, bestWeek: 46.5, bestDay: 52.0 },
    ],
  },
];

// ─── Metrics config ────────────────────────────────────────────────────────
const METRICS: { key: string; label: string; radius: number; dashOffset: number }[] = [
  { key: 'bestDay',     label: 'Best Day',     radius: 4.5, dashOffset: -6 },
  { key: 'bestWeek',    label: 'Best Week',    radius: 5.5, dashOffset: -2 },
  { key: 'currentWeek', label: 'Current Week', radius: 5.5, dashOffset:  2 },
  { key: 'avg',         label: 'Average',      radius: 7,   dashOffset:  6 },
];

const MAX_WEEKS = 8; // x-axis max (expand later as team matures)

// ─── Channel Panel ─────────────────────────────────────────────────────────
function ChannelPanel({ ch, chIdx }: { ch: typeof CHANNELS[0]; chIdx: number }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const yPad   = (ch.high - ch.low) * 1.5;
  const yMin   = Math.max(0, ch.low - yPad);
  const yMax   = ch.high + yPad;
  const yRange = yMax - yMin;

  const W = 720, H = 280;
  const pL = 52, pR = 28, pT = 32, pB = 52;
  const plotW = W - pL - pR;
  const plotH = H - pT - pB;

  const xPos = (weeks: number) => pL + (weeks / MAX_WEEKS) * plotW;
  const yPos = (val: number)   => pT + plotH - ((val - yMin) / yRange) * plotH;

  const bandTop    = yPos(ch.high);
  const bandBottom = yPos(ch.low);
  const bandH      = bandBottom - bandTop;

  // Y grid
  const step = (ch.high - ch.low) > 20 ? 10 : 5;
  const gridY: number[] = [];
  let g = Math.ceil(yMin / step) * step;
  while (g <= yMax) { gridY.push(g); g += step; }

  // Expected progression: ramps from low at W1 to high at W8
  const progPts = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(w => ({
    x: xPos(w),
    y: yPos(ch.low + (ch.high - ch.low) * Math.min(1, w / 7)),
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
        padding: '14px 22px',
        borderBottom: '1px solid #f1f5f9',
        background: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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
          <div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', letterSpacing: '-0.01em' }}>
              {ch.from} → {ch.to}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#f97316', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Low</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{ch.low}%</div>
          </div>
          <div style={{ fontSize: '18px', color: '#e2e8f0' }}>↔</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>High</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{ch.high}%</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '4px 14px 14px', overflowX: 'auto' }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', minWidth: '380px' }}
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

          {/* X grid + labels */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(w => (
            <g key={w}>
              <line x1={xPos(w)} y1={pT} x2={xPos(w)} y2={H - pB} stroke="#f1f5f9" strokeWidth="1" />
              <text x={xPos(w)} y={H - pB + 16} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
                {w === 0 ? 'Start' : `W${w}`}
              </text>
            </g>
          ))}

          {/* X axis label */}
          <text x={pL + plotW / 2} y={H - 5} textAnchor="middle"
            fontSize="11" fill="#94a3b8" fontFamily="sans-serif" fontStyle="italic">
            Weeks on board →
          </text>

          {/* Target band */}
          <rect x={pL} y={bandTop} width={plotW} height={bandH} fill={ch.color} opacity="0.07" />

          {/* HIGH line + label */}
          <line x1={pL} y1={bandTop} x2={W - pR} y2={bandTop} stroke={ch.color} strokeWidth="2.5" />
          <rect x={pL} y={bandTop - 19} width={56} height={18} rx="4" fill={ch.color} />
          <text x={pL + 28} y={bandTop - 6} textAnchor="middle"
            fontSize="9.5" fill="#fff" fontFamily="sans-serif" fontWeight="700">
            HIGH {ch.high}%
          </text>

          {/* LOW line + label */}
          <line x1={pL} y1={bandBottom} x2={W - pR} y2={bandBottom} stroke={ch.color} strokeWidth="2.5" opacity="0.55" />
          <rect x={pL} y={bandBottom + 2} width={52} height={18} rx="4" fill={ch.color} opacity="0.55" />
          <text x={pL + 26} y={bandBottom + 14} textAnchor="middle"
            fontSize="9.5" fill="#fff" fontFamily="sans-serif" fontWeight="700">
            LOW {ch.low}%
          </text>

          {/* Expected progression */}
          <path d={progPath} stroke={ch.color} strokeWidth="1.5" strokeDasharray="6 3" fill="none" opacity="0.3" />
          <text x={xPos(5)} y={yPos(ch.high) - 7} fontSize="9" fill={ch.color}
            fontFamily="sans-serif" opacity="0.5" textAnchor="middle">
            expected ramp
          </text>

          {/* STAFF */}
          {STAFF.map(staff => {
            const chData = staff.channels[chIdx];
            if (!chData) return null;

            // Collect the metrics that actually have data
            const availableMetrics = METRICS.filter(m => (chData as any)[m.key] !== null);
            if (availableMetrics.length === 0) {
              // Only a "Day 1 start" marker
              return (
                <g key={staff.name}>
                  <circle cx={xPos(0)} cy={yPos(yMin + yRange * 0.3)}
                    r={6} fill={staff.color} opacity="0.4" stroke="#fff" strokeWidth="1.5" />
                  <text x={xPos(0)} y={yPos(yMin + yRange * 0.3) - 12}
                    textAnchor="middle" fontSize="9" fill={staff.color}
                    fontFamily="sans-serif" fontWeight="800">
                    {staff.avatar}
                  </text>
                </g>
              );
            }

            const isHov = hovered === staff.name;
            const allVals = availableMetrics.map(m => (chData as any)[m.key] as number);
            const topY    = Math.min(...allVals.map(v => yPos(v)));
            const botY    = Math.max(...allVals.map(v => yPos(v)));

            return (
              <g key={staff.name}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(staff.name)}>

                {/* Vertical connector */}
                {availableMetrics.length > 1 && (
                  <line
                    x1={xPos(staff.weeksOnBoard)} y1={topY}
                    x2={xPos(staff.weeksOnBoard)} y2={botY}
                    stroke={staff.color} strokeWidth="1.5" opacity="0.2" />
                )}

                {/* Dots */}
                {availableMetrics.map((m, mi) => {
                  const val = (chData as any)[m.key] as number;
                  const cx  = xPos(staff.weeksOnBoard);
                  const cy  = yPos(val);
                  const r   = isHov ? m.radius + 2.5 : m.radius;

                  return (
                    <g key={m.key}>
                      {isHov && (
                        <circle cx={cx} cy={cy} r={r + 5} fill={staff.color} opacity="0.12" />
                      )}
                      <circle cx={cx} cy={cy} r={r}
                        fill={staff.color}
                        stroke="#fff" strokeWidth="2"
                        opacity={mi === availableMetrics.length - 1 ? 1 : 0.65} />
                    </g>
                  );
                })}

                {/* Name label above top dot */}
                {!isHov && (
                  <text
                    x={xPos(staff.weeksOnBoard) + 10}
                    y={topY - 4}
                    fontSize="9.5" fill={staff.color}
                    fontFamily="sans-serif" fontWeight="800">
                    {staff.name}
                  </text>
                )}

                {/* Hover tooltip */}
                {isHov && (() => {
                  // Flip tooltip left if near right edge
                  const flipLeft = staff.weeksOnBoard >= MAX_WEEKS - 2;
                  const tipW = 148, tipH = 24 + availableMetrics.length * 15 + 18;
                  const tipX = flipLeft
                    ? xPos(staff.weeksOnBoard) - tipW - 10
                    : xPos(staff.weeksOnBoard) + 14;
                  const tipY = topY - 16;
                  return (
                    <g>
                      <rect x={tipX} y={tipY} width={tipW} height={tipH}
                        rx="7" fill="#1e293b" opacity="0.93" />
                      <text x={tipX + 10} y={tipY + 16}
                        fontSize="11.5" fill="#f1f5f9" fontFamily="sans-serif" fontWeight="700">
                        {staff.name} · W{staff.weeksOnBoard}
                      </text>
                      {availableMetrics.map((m, i) => (
                        <text key={m.key}
                          x={tipX + 10} y={tipY + 33 + i * 15}
                          fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
                          <tspan fill="#e2e8f0" fontWeight="600">{m.label}:</tspan>
                          {` ${(chData as any)[m.key]}%`}
                        </text>
                      ))}
                      {/* Status vs band */}
                      {(() => {
                        const avg = chData.avg;
                        if (avg === null) return null;
                        const status = avg >= ch.low && avg <= ch.high
                          ? { label: '✓ In band', color: '#10b981' }
                          : avg < ch.low
                            ? { label: '↓ Below band', color: '#f97316' }
                            : { label: '↑ Above band', color: '#7c3aed' };
                        return (
                          <text x={tipX + 10} y={tipY + tipH - 7}
                            fontSize="10" fill={status.color} fontFamily="sans-serif" fontWeight="700">
                            {status.label}
                          </text>
                        );
                      })()}
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
            Y = cut-through rate · X = actual weeks on board · hover for detail
          </p>
        </div>

        {/* Metric key */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
          {METRICS.map((m, i) => (
            <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>{m.label}</span>
              <div style={{
                width: `${m.radius * 2}px`, height: `${m.radius * 2}px`,
                borderRadius: '50%', background: '#64748b', opacity: i === METRICS.length - 1 ? 1 : 0.5,
                border: '2px solid #fff', boxShadow: '0 0 0 1px #94a3b8',
              }} />
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '4px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Expected ramp</span>
            <svg width="28" height="8">
              <line x1="0" y1="4" x2="28" y2="4" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Staff row */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #f1f5f9',
        padding: '10px 40px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '4px' }}>
          Staff
        </span>
        {STAFF.map(s => (
          <div key={s.name} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: '20px', padding: '4px 12px 4px 5px',
          }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%',
              background: s.color,
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

      {/* Channel panels */}
      <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px', margin: '0 auto' }}>
        {CHANNELS.map((ch, i) => (
          <ChannelPanel key={ch.id} ch={ch} chIdx={i} />
        ))}
      </div>

      <p style={{ textAlign: 'center', fontSize: '12px', color: '#cbd5e1', paddingBottom: '32px', fontStyle: 'italic' }}>
        ⚠️ Placeholder data — wire to Airtable DailyActivity table to show live cut-throughs
      </p>
    </div>
  );
}
