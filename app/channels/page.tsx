'use client';

import { useEffect, useState } from 'react';

// ─── Channel definitions ───────────────────────────────────────────────────
// ch3: Book→Attended uses meetings÷bookings. low===high===60 = single dashed target line
const CHANNELS = [
  { id: 1, label: 'Call → Book',      low: 11, high: 15, color: '#7c3aed', dataKey: 'ch1' as const },
  { id: 2, label: 'Book → Validated', low: 70, high: 85, color: '#0284c7', dataKey: 'ch2' as const, note: 'Excludes unresponsive clients (NA ×2) — only includes bookings where contact was made and a quality decision was reached' },
  { id: 3, label: 'Val → Attended',   low: 60, high: 60, color: '#059669', dataKey: 'ch3' as const, note: 'meetings ÷ validated bookings · 60% of validated appointments should attend' },
];

type WeekRow = {
  weekNum: number;
  isCurrentWeek: boolean;
  ch1: number | null;
  ch2: number | null;
  ch3: number | null;
  htlRate: number | null;
  htl: number;
  calls: number; callBooks: number; callMeetings: number;
  validated: number; rejected: number;
};

type PersonData = {
  name: string; avatar: string; color: string;
  currentWeekNum: number; weeks: WeekRow[];
};

type ApiData = { team: { weeks: WeekRow[] }; staff: PersonData[] };

// ─── Helpers ───────────────────────────────────────────────────────────────
function bandStatus(val: number | null, low: number, high: number) {
  if (val === null) return null;
  if (low === high) {
    const diff = val - low;
    if (Math.abs(diff) < 0.5) return { label: '✓ On target', color: '#10b981' };
    if (diff < 0) return { label: `↓ ${Math.abs(diff).toFixed(1)}pp below target`, color: '#f97316' };
    return { label: `↑ ${diff.toFixed(1)}pp above target`, color: '#7c3aed' };
  }
  if (val < low)  return { label: `↓ ${(low  - val).toFixed(1)}pp below`, color: '#ef4444' };
  if (val > high) return { label: `↑ ${(val  - high).toFixed(1)}pp above`, color: '#7c3aed' };
  return { label: '✓ In band', color: '#10b981' };
}

// ─── Week Chart ────────────────────────────────────────────────────────────
function WeekChart({
  weeks, ch, maxWeeks, dotColor,
}: {
  weeks: WeekRow[];
  ch: typeof CHANNELS[0];
  maxWeeks: number;
  dotColor: string;
}) {
  const [hoveredWk, setHoveredWk] = useState<number | null>(null);

  const W = 640, H = 195;
  const pL = 42, pR = 20, pT = 36, pB = 34;
  const plotW = W - pL - pR;
  const plotH = H - pT - pB;

  // Y range — for single target (60/60) pad generously around 60
  const isSingleTarget = ch.low === ch.high;
  const yPad = isSingleTarget ? 18 : Math.max((ch.high - ch.low) * 1.8, 10);
  const yMin = Math.max(0,   ch.low  - yPad);
  const yMax = Math.min(100, ch.high + yPad);
  const yRange = yMax - yMin;

  const n    = Math.max(maxWeeks, 1);
  const xPos = (w: number) => n === 1 ? pL + plotW / 2 : pL + ((w - 1) / (n - 1)) * plotW;
  const yPos = (v: number) => pT + plotH - ((v - yMin) / yRange) * plotH;

  const targetY  = yPos(ch.high); // for single target, this = yPos(ch.low) too
  const bandTop  = yPos(ch.high);
  const bandBot  = yPos(ch.low);

  // Y grid
  const step  = isSingleTarget ? 10 : (ch.high - ch.low) <= 10 ? 5 : 10;
  const gridY: number[] = [];
  let g = Math.ceil(yMin / step) * step;
  while (g <= yMax) { gridY.push(g); g += step; }

  // Data points
  const pts = weeks.filter(w => w[ch.dataKey] !== null).map(w => ({
    wk: w.weekNum,
    val: w[ch.dataKey] as number,
    isCur: w.isCurrentWeek,
  }));

  const linePath = pts.length > 1
    ? pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${xPos(p.wk).toFixed(1)},${yPos(p.val).toFixed(1)}`).join(' ')
    : '';

  return (
    <svg
      width="100%" viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', overflow: 'visible' }}
      onMouseLeave={() => setHoveredWk(null)}
    >
      {/* Y grid */}
      {gridY.map(v => (
        <g key={v}>
          <line x1={pL} y1={yPos(v)} x2={W - pR} y2={yPos(v)} stroke="#f1f5f9" strokeWidth="1" />
          <text x={pL - 5} y={yPos(v) + 4} textAnchor="end"
            fontSize="9" fill="#94a3b8" fontFamily="sans-serif">{v}%</text>
        </g>
      ))}

      {/* X axis labels */}
      {Array.from({ length: maxWeeks }, (_, i) => i + 1).map(w => {
        const isCur = weeks.find(r => r.weekNum === w)?.isCurrentWeek ?? false;
        return (
          <text key={w} x={xPos(w)} y={H - pB + 16} textAnchor="middle"
            fontSize="9" fontWeight={isCur ? '700' : '400'}
            fill={isCur ? dotColor : '#94a3b8'} fontFamily="sans-serif">
            {isCur ? `W${w} ●` : `W${w}`}
          </text>
        );
      })}

      {/* Band — only when low ≠ high */}
      {!isSingleTarget && (
        <rect x={pL} y={bandTop} width={plotW} height={bandBot - bandTop}
          fill={ch.color} opacity="0.08" />
      )}

      {/* High line (or single target dashed line) */}
      {isSingleTarget ? (
        // dashed reference line
        <line x1={pL} y1={targetY} x2={W - pR} y2={targetY}
          stroke={ch.color} strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
      ) : (
        <line x1={pL} y1={bandTop} x2={W - pR} y2={bandTop}
          stroke={ch.color} strokeWidth="2" />
      )}

      {/* High label */}
      {!isSingleTarget && (
        <>
          <rect x={pL} y={bandTop - 18} width={48} height={16} rx="3" fill={ch.color} />
          <text x={pL + 24} y={bandTop - 6} textAnchor="middle"
            fontSize="8.5" fill="#fff" fontFamily="sans-serif" fontWeight="700">
            {ch.high}% ↑
          </text>
        </>
      )}
      {isSingleTarget && (
        <>
          <rect x={pL} y={targetY - 18} width={68} height={16} rx="3"
            fill={ch.color} opacity="0.7" />
          <text x={pL + 34} y={targetY - 6} textAnchor="middle"
            fontSize="8.5" fill="#fff" fontFamily="sans-serif" fontWeight="700">
            60% target
          </text>
        </>
      )}

      {/* Low line */}
      {!isSingleTarget && (
        <>
          <line x1={pL} y1={bandBot} x2={W - pR} y2={bandBot}
            stroke={ch.color} strokeWidth="2" opacity="0.5" />
          <rect x={pL} y={bandBot + 2} width={48} height={16} rx="3"
            fill={ch.color} opacity="0.5" />
          <text x={pL + 24} y={bandBot + 14} textAnchor="middle"
            fontSize="8.5" fill="#fff" fontFamily="sans-serif" fontWeight="700">
            {ch.low}% ↓
          </text>
        </>
      )}

      {/* Data line */}
      {linePath && (
        <path d={linePath} stroke={dotColor} strokeWidth="2.5"
          fill="none" opacity="0.5" strokeLinejoin="round" />
      )}

      {/* Dots */}
      {pts.map(p => {
        const cx = xPos(p.wk);
        const cy = yPos(p.val);
        const bs = bandStatus(p.val, ch.low, ch.high);
        const isHov = hoveredWk === p.wk;

        if (p.isCur) {
          // WTD pulsing dot — badge positioned to avoid right-edge clip
          const badgeW = 52;
          const badgeX = Math.min(cx - badgeW / 2, W - pR - badgeW - 2);
          const badgeColor = bs ? bs.color : dotColor;
          return (
            <g key={p.wk}>
              {/* Pulsing halo */}
              <circle cx={cx} cy={cy} r="10" fill={dotColor} opacity="0.15">
                <animate attributeName="r"       values="10;20;10" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.15;0.03;0.15" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx={cx} cy={cy} r="7" fill={dotColor} stroke="#fff" strokeWidth="2.5" />
              {/* Value badge — flips left if near right edge */}
              <rect x={badgeX} y={cy - 32} width={badgeW} height={18} rx="5" fill={badgeColor} />
              <text x={badgeX + badgeW / 2} y={cy - 19} textAnchor="middle"
                fontSize="10" fill="#fff" fontFamily="sans-serif" fontWeight="800">
                {p.val}%
              </text>
            </g>
          );
        }

        // Historical dot with hover tooltip
        return (
          <g key={p.wk}
            onMouseEnter={() => setHoveredWk(p.wk)}
            onMouseLeave={() => setHoveredWk(null)}
            style={{ cursor: 'default' }}>
            {/* Invisible wider hit area */}
            <circle cx={cx} cy={cy} r="14" fill="transparent" />
            <circle cx={cx} cy={cy} r={isHov ? 7 : 5}
              fill={dotColor} stroke="#fff" strokeWidth="2"
              opacity={isHov ? 1 : 0.8} />
            {/* Hover tooltip */}
            {isHov && (() => {
              const tipW = 52;
              const tipX = Math.min(cx - tipW / 2, W - pR - tipW - 2);
              const tipY = cy - 34;
              const tipBs = bandStatus(p.val, ch.low, ch.high);
              return (
                <>
                  <rect x={tipX} y={tipY} width={tipW} height={20} rx="5"
                    fill={tipBs ? tipBs.color : '#1e293b'} opacity="0.92" />
                  <text x={tipX + tipW / 2} y={tipY + 14} textAnchor="middle"
                    fontSize="10.5" fill="#fff" fontFamily="sans-serif" fontWeight="800">
                    {p.val}%
                  </text>
                  {/* Small pointer */}
                  <polygon
                    points={`${tipX + tipW/2 - 5},${tipY + 20} ${tipX + tipW/2 + 5},${tipY + 20} ${tipX + tipW/2},${tipY + 27}`}
                    fill={tipBs ? tipBs.color : '#1e293b'} opacity="0.92" />
                </>
              );
            })()}
          </g>
        );
      })}

      {/* No-data placeholder for ch3 */}
      {pts.length === 0 && ch.id === 3 && (
        <text x={pL + plotW / 2} y={pT + plotH / 2 + 5} textAnchor="middle"
          fontSize="11" fill="#cbd5e1" fontFamily="sans-serif" fontStyle="italic">
          No meetings recorded in DailyActivity yet for this period
        </text>
      )}

      {/* Axes */}
      <line x1={pL} y1={pT} x2={pL} y2={H - pB} stroke="#e2e8f0" strokeWidth="1.5" />
      <line x1={pL} y1={H - pB} x2={W - pR} y2={H - pB} stroke="#e2e8f0" strokeWidth="1.5" />
    </svg>
  );
}

// ─── Channel Panel ─────────────────────────────────────────────────────────
function ChannelPanel({
  ch, weeks, maxWeeks, dotColor,
}: {
  ch: typeof CHANNELS[0]; weeks: WeekRow[];
  maxWeeks: number; dotColor: string;
}) {
  const curWeek = weeks.find(w => w.isCurrentWeek);
  const wtdVal  = curWeek ? curWeek[ch.dataKey] : null;
  const bs      = bandStatus(wtdVal, ch.low, ch.high);
  const isSingleTarget = ch.low === ch.high;

  const htlWeeks = weeks.filter(w => w.htlRate !== null && (w.validated + w.rejected + w.htl) > 0);

  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: '12px', overflow: 'visible',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '16px',
    }}>
      {/* Header */}
      <div style={{
        padding: '13px 20px', borderBottom: '1px solid #f1f5f9',
        background: '#fafafa', borderRadius: '12px 12px 0 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: ch.color + '20', color: ch.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 800,
          }}>{ch.id}</div>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{ch.label}</span>
          {isSingleTarget && (
            <span style={{
              fontSize: '10px', fontWeight: 600, color: ch.color,
              background: ch.color + '18', padding: '2px 8px', borderRadius: '10px',
            }}>
              60% reference line
            </span>
          )}
          {(ch as any).note && ch.id === 2 && (
            <span style={{
              fontSize: '10px', color: '#64748b', fontStyle: 'italic',
              maxWidth: '360px',
            }}>
              ℹ️ {(ch as any).note}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* WTD */}
          {wtdVal !== null && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase',
                letterSpacing: '0.06em', fontWeight: 600 }}>WTD</div>
              <div style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1,
                color: bs ? bs.color : '#1e293b' }}>{wtdVal}%</div>
              {bs && (
                <div style={{ fontSize: '9px', color: bs.color, fontWeight: 600, marginTop: '1px' }}>
                  {bs.label}
                </div>
              )}
            </div>
          )}
          {/* Band range */}
          {!isSingleTarget && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#f97316', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em' }}>Low</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>
                  {ch.low}%
                </div>
              </div>
              <div style={{ color: '#e2e8f0', fontSize: '14px' }}>↔</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#10b981', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em' }}>High</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>
                  {ch.high}%
                </div>
              </div>
            </div>
          )}
          {isSingleTarget && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: ch.color, lineHeight: 1 }}>
                {ch.low}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart — extra right padding so badge never clips */}
      <div style={{ padding: '6px 24px 6px 16px', overflow: 'visible' }}>
        <WeekChart weeks={weeks} ch={ch} maxWeeks={maxWeeks} dotColor={dotColor} />
      </div>

      {/* Ch2 note */}
      {ch.id === 2 && (ch as any).note && (
        <div style={{
          margin: '0 20px', padding: '8px 12px',
          background: '#f8fafc', border: '1px solid #e2e8f0',
          borderRadius: '8px', marginBottom: '8px',
          fontSize: '11px', color: '#64748b', lineHeight: 1.5,
        }}>
          <span style={{ fontWeight: 700, color: '#475569' }}>ℹ️ Note: </span>
          {(ch as any).note}
        </div>
      )}

      {/* HTL row — Channel 2 only */}
      {ch.id === 2 && (
        <div style={{
          padding: '6px 20px 14px', borderTop: '1px solid #f8fafc',
          display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '2px' }}>HTL</span>
          {htlWeeks.length === 0 ? (
            <span style={{ fontSize: '10px', color: '#cbd5e1', fontStyle: 'italic' }}>No HTL recorded</span>
          ) : htlWeeks.map(w => (
            <div key={w.weekNum} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: w.isCurrentWeek ? '#fef3c7' : '#f8fafc',
              border: `1px solid ${w.isCurrentWeek ? '#fbbf24' : '#e2e8f0'}`,
              borderRadius: '12px', padding: '2px 8px',
            }}>
              <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600 }}>
                W{w.weekNum}{w.isCurrentWeek ? ' WTD' : ''}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#d97706' }}>
                {w.htlRate}%
              </span>
              <span style={{ fontSize: '9px', color: '#94a3b8' }}>({w.htl})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Team Tab ──────────────────────────────────────────────────────────────
function TeamTab({ team }: { team: { weeks: WeekRow[] } }) {
  const totCalls  = team.weeks.reduce((s, w) => s + w.calls,     0);
  const totBooks  = team.weeks.reduce((s, w) => s + w.callBooks, 0);
  const totMeets  = team.weeks.reduce((s, w) => s + w.callMeetings, 0);
  const totVal    = team.weeks.reduce((s, w) => s + w.validated, 0);
  const totRej    = team.weeks.reduce((s, w) => s + w.rejected,  0);
  const totHtl    = team.weeks.reduce((s, w) => s + w.htl,       0);

  const allTimeCh1 = totCalls > 0     ? Math.round((totBooks  / totCalls)          * 1000) / 10 : null;
  const allTimeCh2 = (totVal + totRej) > 0 ? Math.round((totVal / (totVal + totRej)) * 1000) / 10 : null;
  const allTimeCh3 = totVal > 0       ? Math.round((totMeets  / totVal)            * 1000) / 10 : null;
  const allTimeHtl = (totVal + totRej + totHtl) > 0
    ? Math.round((totHtl / (totVal + totRej + totHtl)) * 1000) / 10 : null;

  const headlines = [
    { label: 'All-time Call→Book', val: allTimeCh1, ch: CHANNELS[0] },
    { label: 'All-time Book→Val',  val: allTimeCh2, ch: CHANNELS[1] },
    { label: 'All-time Book→Att',  val: allTimeCh3, ch: CHANNELS[2] },
    { label: 'All-time HTL rate',  val: allTimeHtl, color: '#d97706', ch: undefined },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px', marginBottom: '20px' }}>
        {headlines.map(({ label, val, ch, color }) => {
          const c  = ch ? ch.color : (color ?? '#94a3b8');
          const bs = ch ? bandStatus(val ?? null, ch.low, ch.high) : null;
          return (
            <div key={label} style={{ background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: '10px', padding: '14px 16px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                {label}
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: bs ? bs.color : c, lineHeight: 1 }}>
                {val !== null ? `${val}%` : '—'}
              </div>
              {bs && <div style={{ fontSize: '9.5px', color: bs.color, fontWeight: 600, marginTop: '3px' }}>
                {bs.label}
              </div>}
            </div>
          );
        })}
      </div>
      {CHANNELS.map(ch => (
        <ChannelPanel key={ch.id} ch={ch} weeks={team.weeks} maxWeeks={8} dotColor={ch.color} />
      ))}
    </div>
  );
}

// ─── Person Tab ────────────────────────────────────────────────────────────
function PersonTab({ person }: { person: PersonData }) {
  const totCalls = person.weeks.reduce((s, w) => s + w.calls,        0);
  const totBooks = person.weeks.reduce((s, w) => s + w.callBooks,    0);
  const totMeets = person.weeks.reduce((s, w) => s + w.callMeetings, 0);
  const totVal   = person.weeks.reduce((s, w) => s + w.validated,    0);
  const totRej   = person.weeks.reduce((s, w) => s + w.rejected,     0);
  const totHtl   = person.weeks.reduce((s, w) => s + w.htl,         0);

  const allTimeCh1 = totCalls > 0         ? Math.round((totBooks / totCalls)          * 1000) / 10 : null;
  const allTimeCh2 = (totVal + totRej) > 0 ? Math.round((totVal  / (totVal + totRej)) * 1000) / 10 : null;
  const allTimeCh3 = totVal > 0           ? Math.round((totMeets / totVal)            * 1000) / 10 : null;
  const allTimeHtl = (totVal + totRej + totHtl) > 0
    ? Math.round((totHtl / (totVal + totRej + totHtl)) * 1000) / 10 : null;

  return (
    <div>
      {/* Person header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px',
        padding: '16px 20px', background: '#fff', border: '1px solid #e2e8f0',
        borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', flexWrap: 'wrap',
      }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%',
          background: person.color, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '18px', fontWeight: 800, color: '#fff',
          flexShrink: 0 }}>
          {person.avatar}
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.01em' }}>
            {person.name}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            Week {person.currentWeekNum} · {person.weeks.length} weeks of data
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {[
            { label: 'Call→Book', val: allTimeCh1, ch: CHANNELS[0] },
            { label: 'Book→Val',  val: allTimeCh2, ch: CHANNELS[1] },
            { label: 'Book→Att',  val: allTimeCh3, ch: CHANNELS[2] },
            { label: 'HTL rate',  val: allTimeHtl, color: '#d97706', ch: undefined },
          ].map(({ label, val, ch, color }) => {
            const c  = ch ? ch.color : (color ?? '#94a3b8');
            const bs = ch ? bandStatus(val ?? null, ch.low, ch.high) : null;
            return (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1,
                  color: bs ? bs.color : c }}>
                  {val !== null ? `${val}%` : '—'}
                </div>
                {bs && <div style={{ fontSize: '8.5px', color: bs.color, fontWeight: 600 }}>{bs.label}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {CHANNELS.map(ch => (
        <ChannelPanel key={ch.id} ch={ch}
          weeks={person.weeks} maxWeeks={person.currentWeekNum} dotColor={person.color} />
      ))}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function ChannelsPage() {
  const [data, setData]       = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tab, setTab]         = useState<string>('team');
  const [updated, setUpdated] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/channels-data');
      if (!res.ok) throw new Error(`API ${res.status}`);
      setData(await res.json());
      setUpdated(new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const TABS = [
    { key: 'team', label: 'Team', color: '#1e293b' },
    ...(data?.staff ?? []).map(s => ({ key: s.name, label: s.name, color: s.color })),
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '18px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px', flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '21px', fontWeight: 800,
            color: '#1e293b', letterSpacing: '-0.02em' }}>
            Lead Gen Performance Channels
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
            Week-on-week cut-through rates · hover dots for values · live from Airtable
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {updated && <span style={{ fontSize: '11px', color: '#94a3b8' }}>Updated {updated}</span>}
          <button onClick={load} disabled={loading} style={{
            padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0',
            background: '#fff', color: '#475569', fontSize: '12px', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
            fontFamily: 'inherit',
          }}>
            {loading ? 'Loading…' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '0 40px', display: 'flex',
      }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '12px 20px', border: 'none',
            borderBottom: tab === t.key ? `3px solid ${t.color}` : '3px solid transparent',
            background: 'none',
            color: tab === t.key ? t.color : '#64748b',
            fontSize: '13px', fontWeight: tab === t.key ? 700 : 500,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '28px 40px', maxWidth: '1050px', margin: '0 auto' }}>
        {error ? (
          <div style={{ padding: '16px 20px', background: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: '10px',
            color: '#dc2626', fontSize: '13px' }}>
            Failed to load: {error}
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {CHANNELS.map(ch => (
              <div key={ch.id} style={{ height: '260px', background: '#fff',
                border: '1px solid #e2e8f0', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Loading {ch.label}…</span>
              </div>
            ))}
          </div>
        ) : data ? (
          tab === 'team'
            ? <TeamTab team={data.team} />
            : <PersonTab person={data.staff.find(s => s.name === tab)!} />
        ) : null}
      </div>
    </div>
  );
}
