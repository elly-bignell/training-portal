/**
 * Promo Planning Configurator
 *
 * Drop-in Next.js page for /promo-planning
 *
 * App Router:    place at  app/promo-planning/page.jsx
 * Pages Router:  place at  pages/promo-planning.jsx  (and remove the 'use client' line below)
 *
 * Persistence: localStorage key "promoPlanner.v1" — every input change saves immediately,
 * page reload restores the last state. Per-browser, no backend required.
 *
 * No external dependencies beyond React. Styling is fully inline so this
 * works regardless of your CSS setup (Tailwind, CSS Modules, plain CSS, etc.).
 */

'use client';

import { useEffect, useState, useCallback } from 'react';

// ============================================================
// CONSTANTS
// ============================================================
const STORAGE_KEY = 'promoPlanner.v1';
const DAYS_WK = 5;
const DAYS_MO = 21;

const C = {
  navy: '#0F2A3D',
  navyDeep: '#0A1F2E',
  green: '#1FAB6E',
  greenDark: '#158B58',
  orange: '#E89B2A',
  red: '#C0392B',
  bg: '#F4F8FB',
  card: '#FFFFFF',
  grey: '#5A6B7A',
  greyLight: '#B8C5D0',
  text: '#1A1A1A',
  greenSoft: '#E8F5EE',
  orangeSoft: '#FFF7E0',
  redSoft: '#FCE5E2',
};

// Empirical bands per funnel stage (target = floor, high = best ever, commit = your stated commit)
const BANDS = {
  propToDeal: { target: 51, high: 85, commit: 51, min: 10, max: 100, step: 1 },
  attToProp:  { target: 72, high: 92, commit: 80,  min: 60, max: 100, step: 0.5 },
  bookToAtt:  { target: 31, high: 63, commit: 40,  min: 20, max: 70,  step: 0.5 },
  connToBook: { target: 10.5, high: 19, commit: 12, min: 5,  max: 25,  step: 0.1 },
  callToConn: { target: 50, high: 55, commit: 52, min: 40,  max: 70,  step: 0.5 },
};

const DEFAULTS = {
  target: 1250,
  dealValue: 100,
  propToDeal: 100,
  attToProp: 80,
  bookToAtt: 40,
  connToBook: 12,
  callToConn: 52,
  // Team projection inputs (generic — not tied to any specific promo)
  numStaff: 4,
  dialledPerDay: 100,
};

// Current 4 reps' April 2026 actuals — partial month data (1–28 Apr, 15–18 working days each)
// Source: DailyActivity export. dialled = calls_made, connected = calls (the CSV's 'calls'
// column is connected calls, not total dials).
const REPS_APRIL = [
  { name: 'Cindy',   days: 17, dialled: 1950, connected: 745, bookings: 91, attended: 15, deals: 1.5 },
  { name: 'Krishna', days: 15, dialled: 1666, connected: 685, bookings: 88, attended: 14, deals: 2.5 },
  { name: 'Sydney',  days: 17, dialled: 1531, connected: 671, bookings: 69, attended: 6,  deals: 1.0 },
  { name: 'Riley',   days: 18, dialled: 1546, connected: 775, bookings: 93, attended: 21, deals: 0.5 },
];

// ============================================================
// HELPERS
// ============================================================
const fmt = (n, dec = 1) => {
  if (!isFinite(n) || isNaN(n)) return '—';
  if (n >= 1000) return Math.round(n).toLocaleString();
  if (n >= 100) return Math.round(n).toString();
  return n.toFixed(dec);
};

function classifyBand(stage, value) {
  const b = BANDS[stage];
  if (value >= b.high) return { label: 'HIGH+', fg: C.greenDark, bg: '#D8EFE2' };
  if (value >= b.commit) return { label: 'COMMIT', fg: C.greenDark, bg: C.greenSoft };
  if (value >= b.target) return { label: 'TARGET', fg: '#B57418', bg: C.orangeSoft };
  return { label: 'BELOW', fg: C.red, bg: C.redSoft };
}

// ============================================================
// COMPONENT
// ============================================================
export default function PromoPlanning() {
  const [s, setS] = useState(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setS((prev) => ({ ...prev, ...saved }));
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Save on every change after hydration
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {}
  }, [s, hydrated]);

  const set = useCallback((patch) => setS((prev) => ({ ...prev, ...patch })), []);
  const reset = () => setS(DEFAULTS);

  // ============ Calculations (working backwards from monthly goal) ============
  const target = Number(s.target) || 0;
  const dealVal = Number(s.dealValue) || 1;

  const m = {
    deals: target / dealVal,
  };
  m.prop  = m.deals / (s.propToDeal / 100);
  m.att   = m.prop  / (s.attToProp  / 100);
  m.book  = m.att   / (s.bookToAtt  / 100);
  m.conn  = m.book  / (s.connToBook / 100);
  m.calls = m.conn  / (s.callToConn / 100);

  // ============ Forward projection (per rep + team total) ============
  const numStaff = Number(s.numStaff) || 0;
  const dialledPerDay = Number(s.dialledPerDay) || 0;
  const perRep = {};
  perRep.dialled   = dialledPerDay * DAYS_MO;
  perRep.connected = perRep.dialled   * (s.callToConn / 100);
  perRep.bookings  = perRep.connected * (s.connToBook / 100);
  perRep.attended  = perRep.bookings  * (s.bookToAtt  / 100);
  perRep.proposals = perRep.attended  * (s.attToProp  / 100);
  perRep.deals     = perRep.proposals * (s.propToDeal / 100);
  perRep.revenue   = perRep.deals * dealVal;
  const team = {
    dialled:   perRep.dialled   * numStaff,
    connected: perRep.connected * numStaff,
    bookings:  perRep.bookings  * numStaff,
    attended:  perRep.attended  * numStaff,
    deals:     perRep.deals     * numStaff,
    revenue:   perRep.revenue   * numStaff,
  };
  const proj = { perRep, team };

  const day = (val) => val / DAYS_MO;
  const wk  = (val) => (val / DAYS_MO) * DAYS_WK;

  // ============ Render helpers ============
  const Slider = ({ stage, label }) => {
    const value = s[stage];
    const b = BANDS[stage];
    const band = classifyBand(stage, value);
    return (
      <div style={{ background: C.bg, padding: '10px 12px', borderRadius: 6, marginTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: C.grey, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
            {label}
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>
            {value.toFixed(stage === 'connToBook' ? 1 : 1)}%
            <span style={{
              display: 'inline-block', marginLeft: 6, padding: '2px 7px', borderRadius: 3,
              fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
              color: band.fg, background: band.bg,
            }}>{band.label}</span>
          </span>
        </div>
        <input
          type="range"
          min={b.min} max={b.max} step={b.step} value={value}
          onChange={(e) => set({ [stage]: parseFloat(e.target.value) })}
          style={{
            width: '100%', height: 4, borderRadius: 2,
            background: `linear-gradient(to right, ${C.orange}, ${C.greenDark})`,
            outline: 'none', WebkitAppearance: 'none', cursor: 'pointer', margin: '4px 0',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.grey, marginTop: 4 }}>
          <span>commit {b.commit}%</span>
          <span style={{ display: 'flex', gap: 12 }}>
            <span style={{ color: C.orange, fontWeight: 600 }}>target {b.target}%</span>
            <span style={{ color: C.greenDark, fontWeight: 600 }}>high {b.high}%</span>
          </span>
        </div>
      </div>
    );
  };

  const StageRow = ({ name, value, dec = 1 }) => (
    <div style={{ borderBottom: '1px solid #ECF0F4', padding: '14px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.navy, textTransform: 'uppercase', letterSpacing: 1 }}>{name}</span>
        <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
          <Count num={fmt(day(value), dec === 0 ? 0 : 2)} lbl="/day" primary />
          <Count num={fmt(wk(value), dec)} lbl="/wk" />
          <Count num={fmt(value, dec)} lbl="/mo" />
        </div>
      </div>
    </div>
  );

  const Count = ({ num, lbl, primary }) => (
    <div style={{ textAlign: 'right' }}>
      <span style={{ fontSize: 20, fontWeight: 700, color: primary ? C.green : C.navy }}>{num}</span>
      <span style={{ fontSize: 9.5, color: C.grey, textTransform: 'uppercase', letterSpacing: 1, marginLeft: 3 }}>{lbl}</span>
    </div>
  );

  const Card = ({ title, children, style }) => (
    <div style={{
      background: C.card, borderRadius: 10, padding: '22px 24px',
      boxShadow: '0 1px 3px rgba(15,42,61,.08), 0 4px 12px rgba(15,42,61,.06)',
      ...style,
    }}>
      {title && (
        <h2 style={{ fontSize: 15, color: C.navy, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700 }}>{title}</h2>
      )}
      {children}
    </div>
  );

  const StatTile = ({ label, value, sub, color = C.green }) => (
    <div style={{ background: C.bg, borderRadius: 8, padding: 14, borderLeft: `3px solid ${color}` }}>
      <div style={{ fontSize: 10, color: C.grey, letterSpacing: 1.5, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: C.navy, margin: '4px 0', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: C.grey }}>{sub}</div>
    </div>
  );

  // ============ Render ============
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif', background: C.bg, color: C.text, minHeight: '100vh' }}>
      <style>{`
        .pp-page { max-width: 1400px; margin: 0 auto; padding: 28px 32px 64px; }
        .pp-h1 { font-size: 28px; }
        .pp-grid-main { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 24px; margin-top: 24px; }
        .pp-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .pp-grid-2-tight { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .pp-grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
        .pp-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 0 -4px; }
        .pp-input-big { font-size: 30px; }
        @media (max-width: 768px) {
          .pp-page { padding: 16px 14px 48px; }
          .pp-h1 { font-size: 22px; line-height: 1.25; }
          .pp-grid-main { grid-template-columns: 1fr; gap: 16px; margin-top: 16px; }
          .pp-grid-2 { grid-template-columns: 1fr; gap: 14px; }
          .pp-grid-2-tight { grid-template-columns: 1fr 1fr; gap: 8px; }
          .pp-grid-5 { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .pp-input-big { font-size: 24px; }
          .pp-table-wrap table { min-width: 560px; }
        }
      `}</style>
      <div className="pp-page">
        {/* Header */}
        <header style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>
            PROMO CONFIGURATOR · 1 PERSON · MONTHLY CYCLE
          </div>
          <h1 className="pp-h1" style={{ color: C.navy, margin: '0 0 6px', fontWeight: 700 }}>
            What activity is required to add this much WRR by month-end?
          </h1>
          <p style={{ color: C.grey, fontSize: 14, fontStyle: 'italic', margin: 0 }}>
            Goal = weekly recurring revenue ADDED across a 21-working-day month. Drag the conversion sliders within the empirical band. Read the activity required at the bottom.
          </p>
        </header>

        {/* Two-column grid */}
        <div className="pp-grid-main">
          {/* LEFT — Goal + Funnel */}
          <div>
            <Card title="The Goal">
              <div className="pp-grid-2" style={{ marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: C.grey, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 4 }}>
                    Monthly WRR target (cumulative)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ color: C.grey, fontSize: 22, fontWeight: 600 }}>$</span>
                    <input
                      type="number" value={s.target} min={100} step={50}
                      onFocus={(e) => e.target.select()}
                      onMouseUp={(e) => e.preventDefault()}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === '') { set({ target: '' }); return; }
                        const n = parseFloat(v);
                        if (!isNaN(n)) set({ target: n });
                      }}
                      className="pp-input-big" style={{ width: '100%', fontWeight: 700, color: C.navy, border: 'none', borderBottom: `2px solid ${C.greyLight}`, background: 'transparent', padding: '4px 0', outline: 'none', fontFamily: 'inherit' }}
                    />
                    <span style={{ color: C.grey, fontSize: 13, marginLeft: 4 }}>/wk by EOM</span>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: C.grey, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 4 }}>
                    Average deal value (WRR)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ color: C.grey, fontSize: 22, fontWeight: 600 }}>$</span>
                    <input
                      type="number" value={s.dealValue} min={20} step={10}
                      onFocus={(e) => e.target.select()}
                      onMouseUp={(e) => e.preventDefault()}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === '') { set({ dealValue: '' }); return; }
                        const n = parseFloat(v);
                        if (!isNaN(n)) set({ dealValue: n });
                      }}
                      className="pp-input-big" style={{ width: '100%', fontWeight: 700, color: C.navy, border: 'none', borderBottom: `2px solid ${C.greyLight}`, background: 'transparent', padding: '4px 0', outline: 'none', fontFamily: 'inherit' }}
                    />
                    <span style={{ color: C.grey, fontSize: 13, marginLeft: 4 }}>/wk per deal</span>
                  </div>
                </div>
              </div>
              <div style={{ background: C.navy, color: 'white', borderRadius: 8, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, color: '#98C9B5', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>
                  Deals required this month
                </div>
                <div>
                  <span style={{ fontSize: 28, fontWeight: 700, color: C.green }}>{fmt(m.deals, 1)}</span>
                  <span style={{ color: '#98C9B5', fontSize: 13, marginLeft: 4 }}>deals · 21 working days</span>
                </div>
              </div>
              <button onClick={reset} style={{
                marginTop: 14, color: C.grey, fontSize: 11, background: 'none', border: 'none',
                borderBottom: `1px dotted ${C.greyLight}`, cursor: 'pointer', padding: 0,
              }}>
                ↺ Reset all to commitment values
              </button>
            </Card>

            <div style={{ marginTop: 20 }}>
              <Card title="The Funnel — Working Backwards">
                <StageRow name="Deals"           value={m.deals} dec={1} />
                <Slider stage="propToDeal" label="Proposal → Deal close rate" />
                <StageRow name="Proposals"       value={m.prop} dec={1} />
                <Slider stage="attToProp" label="Attended → Proposal" />
                <StageRow name="Attended"        value={m.att} dec={1} />
                <Slider stage="bookToAtt" label="Booking → Attended" />
                <StageRow name="Booking"         value={m.book} dec={1} />
                <Slider stage="connToBook" label="Connected → Booking" />
                <StageRow name="Connected Calls" value={m.conn} dec={0} />
                <Slider stage="callToConn" label="Calls → Connected" />
                <StageRow name="Calls (raw dials)" value={m.calls} dec={0} />
              </Card>
            </div>
          </div>

          {/* RIGHT — Summary, Reality Check, Team Projection */}
          <div>
            <Card title="Daily Activity Required">
              <p style={{ color: C.grey, fontSize: 14, fontStyle: 'italic', margin: '0 0 16px' }}>
                The volume the rep must hit every working day.
              </p>
              <div className="pp-grid-2-tight">
                <StatTile label="CALLS / DAY"     value={fmt(day(m.calls), 0)} sub="raw dials" />
                <StatTile label="CONNECTED / DAY" value={fmt(day(m.conn), 0)}  sub="live conversations" />
                <StatTile label="BOOKINGS / DAY"  value={fmt(day(m.book), 1)}  sub="scheduled" color={C.orange} />
                <StatTile label="ATTENDED / DAY"  value={fmt(day(m.att), 2)}   sub="≥ 10 min" color={C.orange} />
              </div>
            </Card>

            {/* Reality Check */}
            <div style={{ marginTop: 20 }}>
              <Card title="Reality Check vs Current Best Months">
                <p style={{ color: C.grey, fontSize: 14, fontStyle: 'italic', margin: '0 0 14px' }}>
                  Current 4 reps&rsquo; April 2026 actuals (partial month, 15–18 days each) · green = within 10% of full-month requirement
                </p>
                <div className="pp-table-wrap"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.navy}` }}>
                      <th style={{ textAlign: 'left', padding: '6px 4px', color: C.navy, fontSize: 10.5, letterSpacing: 1 }}>METRIC</th>
                      <th style={{ textAlign: 'right', padding: '6px 4px', color: C.navy, fontSize: 10.5, letterSpacing: 1 }}>REQ</th>
                      {REPS_APRIL.map((r) => (
                        <th key={r.name} style={{ textAlign: 'right', padding: '6px 4px', color: C.navy, fontSize: 10.5, letterSpacing: 1 }}>{r.name.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { metric: 'Calls / month',           required: m.calls, key: 'dialled',   dec: 0 },
                      { metric: 'Connected calls / month', required: m.conn,  key: 'connected', dec: 0 },
                      { metric: 'Bookings / month',        required: m.book,  key: 'bookings',  dec: 0 },
                      { metric: 'Attended / month',        required: m.att,   key: 'attended',  dec: 1 },
                      { metric: 'Deals / month',           required: m.deals, key: 'deals',     dec: 1 },
                    ].map((row, i) => (
                      <tr key={row.key} style={{ borderBottom: '1px solid #ECF0F4', background: i % 2 === 1 ? C.bg : 'transparent' }}>
                        <td style={{ padding: '8px 4px', fontWeight: 600 }}>{row.metric}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700, color: C.greenDark }}>
                          {fmt(row.required, row.dec)}
                        </td>
                        {REPS_APRIL.map((r) => {
                          const actual = r[row.key];
                          // Pro-rate partial-month actual to full-month equivalent for fair comparison
                          const projected = (r.days && r.days > 0) ? actual * (DAYS_MO / r.days) : actual;
                          const ok = projected >= row.required * 0.9;
                          const gapPct = (!ok && projected > 0)
                            ? Math.round((row.required - projected) / projected * 100)
                            : null;
                          return (
                            <td key={r.name} style={{
                              padding: '8px 4px', textAlign: 'right',
                              color: ok ? C.greenDark : C.text, fontWeight: ok ? 700 : 400,
                            }}>
                              {fmt(actual, row.dec)}
                              {ok && <span style={{ marginLeft: 4 }}>✓</span>}
                              {!ok && gapPct !== null && (
                                <span style={{ color: C.red, fontSize: 11, fontWeight: 600, marginLeft: 4 }}>
                                  +{gapPct}%
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table></div>
                <div style={{ marginTop: 14, padding: '10px 12px', background: C.orangeSoft, borderLeft: `3px solid ${C.orange}`, borderRadius: 4, fontSize: 11.5 }}>
                  <b>How to read:</b> the green &#10003; and red <span style={{color: C.red, fontWeight: 600}}>+X%</span> badges compare each rep&rsquo;s <i>full-month projected pace</i> (current actual × {DAYS_MO} / days worked) against the full-month requirement. <span style={{color: C.red, fontWeight: 600}}>+X%</span> = how much each rep needs to lift their daily rate to hit target. Red gaps highlight the actual blockers — typically the bottom of the funnel.
                </div>
              </Card>
            </div>

            {/* Team Projection — forward view */}
            <div style={{ marginTop: 20 }}>
              <Card title="Team Projection — Forward View">
                <p style={{ color: C.grey, fontSize: 14, fontStyle: 'italic', margin: '0 0 14px' }}>
                  Project end-of-month output and revenue from staff count and per-rep dial volume, using the current funnel cut-throughs above. Generic — works for any promo.
                </p>

                {/* Inputs */}
                <div className="pp-grid-2" style={{ marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: C.grey, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 4 }}>
                      Staff count
                    </label>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <input
                        type="number" value={s.numStaff} min={1} step={1}
                        onFocus={(e) => e.target.select()}
                        onMouseUp={(e) => e.preventDefault()}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === '') { set({ numStaff: '' }); return; }
                          const n = parseFloat(v);
                          if (!isNaN(n)) set({ numStaff: n });
                        }}
                        className="pp-input-big" style={{ width: '100%', fontWeight: 700, color: C.navy, border: 'none', borderBottom: `2px solid ${C.greyLight}`, background: 'transparent', padding: '4px 0', outline: 'none', fontFamily: 'inherit' }}
                      />
                      <span style={{ color: C.grey, fontSize: 13, marginLeft: 4 }}>reps</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: C.grey, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 4 }}>
                      Dialled calls / rep / day
                    </label>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <input
                        type="number" value={s.dialledPerDay} min={0} step={5}
                        onFocus={(e) => e.target.select()}
                        onMouseUp={(e) => e.preventDefault()}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === '') { set({ dialledPerDay: '' }); return; }
                          const n = parseFloat(v);
                          if (!isNaN(n)) set({ dialledPerDay: n });
                        }}
                        className="pp-input-big" style={{ width: '100%', fontWeight: 700, color: C.navy, border: 'none', borderBottom: `2px solid ${C.greyLight}`, background: 'transparent', padding: '4px 0', outline: 'none', fontFamily: 'inherit' }}
                      />
                      <span style={{ color: C.grey, fontSize: 13, marginLeft: 4 }}>dials/day</span>
                    </div>
                  </div>
                </div>

                {/* Headline projected revenue box */}
                <div style={{ background: C.navy, color: 'white', borderRadius: 8, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#98C9B5', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>
                      Projected team WRR added by EOM
                    </div>
                    <div style={{ fontSize: 11, color: '#98C9B5', marginTop: 2 }}>
                      at current cut-throughs · {DAYS_MO} working days
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: C.green }}>${fmt(proj.team.revenue, 0)}</span>
                    <span style={{ color: '#98C9B5', fontSize: 13, marginLeft: 4 }}>/wk WRR</span>
                  </div>
                </div>

                {/* Per-rep + team breakdown */}
                <div className="pp-table-wrap"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.navy}` }}>
                      <th style={{ textAlign: 'left',  padding: '6px 4px', color: C.navy, fontSize: 10.5, letterSpacing: 1 }}>METRIC</th>
                      <th style={{ textAlign: 'right', padding: '6px 4px', color: C.navy, fontSize: 10.5, letterSpacing: 1 }}>PER REP / MO</th>
                      <th style={{ textAlign: 'right', padding: '6px 4px', color: C.navy, fontSize: 10.5, letterSpacing: 1 }}>TEAM / MO</th>
                      <th style={{ textAlign: 'right', padding: '6px 4px', color: C.navy, fontSize: 10.5, letterSpacing: 1 }}>VS REQ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Calls (dialled)', per: proj.perRep.dialled,   team: proj.team.dialled,   req: m.calls, dec: 0 },
                      { label: 'Connected calls', per: proj.perRep.connected, team: proj.team.connected, req: m.conn,  dec: 0 },
                      { label: 'Bookings',         per: proj.perRep.bookings,  team: proj.team.bookings,  req: m.book,  dec: 1 },
                      { label: 'Attended',         per: proj.perRep.attended,  team: proj.team.attended,  req: m.att,   dec: 1 },
                      { label: 'Deals',            per: proj.perRep.deals,     team: proj.team.deals,     req: m.deals, dec: 2 },
                    ].map((r, i) => {
                      const pct = r.req > 0 ? (r.team / r.req) * 100 : 0;
                      const onTrack = pct >= 90;
                      return (
                        <tr key={r.label} style={{ borderBottom: '1px solid #ECF0F4', background: i % 2 === 1 ? C.bg : 'transparent' }}>
                          <td style={{ padding: '8px 4px', fontWeight: 600 }}>{r.label}</td>
                          <td style={{ padding: '8px 4px', textAlign: 'right' }}>{fmt(r.per, r.dec)}</td>
                          <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700 }}>{fmt(r.team, r.dec)}</td>
                          <td style={{ padding: '8px 4px', textAlign: 'right', color: onTrack ? C.greenDark : C.red, fontWeight: 600 }}>
                            {fmt(pct, 0)}%{onTrack ? ' ✓' : ''}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table></div>

                <div style={{ marginTop: 14, padding: '10px 12px', background: C.greenSoft, borderLeft: `3px solid ${C.green}`, borderRadius: 4, fontSize: 11.5 }}>
                  <b>How to read:</b> change staff count or dial volume above, or move the funnel sliders, to see how projected EOM revenue shifts. The VS REQ column compares team output to the goal-driven requirement from &ldquo;The Goal&rdquo; — green &#10003; means the team is projected to land within 10% of target.
                </div>
              </Card>
            </div>

          </div>
        </div>

        {/* Bottom summary bar */}
        <div style={{ marginTop: 24, background: C.navy, borderRadius: 10, padding: '24px 28px', color: 'white' }}>
          <div style={{ fontSize: 11, color: C.green, textTransform: 'uppercase', letterSpacing: 3, fontWeight: 700, marginBottom: 4 }}>
            SUMMARY · LIVE
          </div>
          <h2 style={{ margin: '0 0 18px', fontSize: 22, color: 'white', fontWeight: 700 }}>
            ${target.toLocaleString()}/wk WRR added by EOM → {fmt(day(m.calls), 0)} calls/day cascading to {fmt(m.deals, 1)} deals across the month
          </h2>
          <div className="pp-grid-5">
            {[
              { lbl: 'CALLS',     d: day(m.calls), w: wk(m.calls), mo: m.calls, dec: 0 },
              { lbl: 'CONNECTED', d: day(m.conn),  w: wk(m.conn),  mo: m.conn,  dec: 0 },
              { lbl: 'BOOKINGS',  d: day(m.book),  w: wk(m.book),  mo: m.book,  dec: 1 },
              { lbl: 'ATTENDED',  d: day(m.att),   w: wk(m.att),   mo: m.att,   dec: 1 },
              { lbl: 'DEALS',     d: day(m.deals), w: wk(m.deals), mo: m.deals, dec: 1 },
            ].map((x) => (
              <div key={x.lbl} style={{ background: 'rgba(255,255,255,.06)', borderRadius: 6, padding: '12px 14px', borderLeft: `3px solid ${C.green}` }}>
                <div style={{ fontSize: 10, color: '#98C9B5', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, marginBottom: 4 }}>{x.lbl}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                  {fmt(x.d, x.dec === 0 ? 0 : 2)}
                  <span style={{ fontSize: 10, color: '#98AAB7', fontWeight: 500 }}> /day</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#C8D4DD', borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 6 }}>
                  <span><b style={{ color: 'white' }}>{fmt(x.w, x.dec)}</b>/wk</span>
                  <span><b style={{ color: 'white' }}>{fmt(x.mo, x.dec)}</b>/mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p style={{ marginTop: 16, fontSize: 11, color: C.grey, textAlign: 'center' }}>
          Last input persists in this browser via localStorage · Clear it via the Reset button above
        </p>
      </div>
    </div>
  );
}
