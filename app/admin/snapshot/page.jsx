/* eslint-disable react/no-unescaped-entities */
"use client";
import { useEffect, useState, useCallback } from "react";
import PasswordGate from "@/components/PasswordGate";

const printStyles = `
  @media print {
    body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
    .page-wrap { padding: 16px !important; background: white !important; }
    .card, .table-wrap, .scorecard { box-shadow: none !important; break-inside: avoid; }
  }
`;

function pct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
function bestOf(arr, key) { return Math.max(...arr.map((t) => Number(t[key]) || 0)); }
function fmt$(v) { return "$" + Number(v || 0).toLocaleString(); }
function fmtN(v, dp = 1) { return Number(v || 0).toFixed(dp); }

const C = {
  green: "#16a34a", greenBg: "#dcfce7", greenMid: "#86efac",
  blue: "#2563eb", blueBg: "#dbeafe",
  red: "#dc2626", redBg: "#fee2e2",
  amber: "#d97706", amberBg: "#fef3c7",
  slate: "#64748b", border: "#e2e8f0",
  heading: "#1e293b", muted: "#64748b",
  cardBg: "#fff", rowAlt: "#fafafa",
};

function Badge({ children, color = C.blue, bg = C.blueBg }) {
  return (
    <span style={{ display: "inline-block", fontSize: 10, fontFamily: "monospace", color, background: bg, border: "1px solid " + color + "33", padding: "2px 8px", borderRadius: 4, letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 600 }}>
      {children}
    </span>
  );
}

function MiniBar({ value, max, color = C.blue }) {
  const w = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ background: "#e2e8f0", borderRadius: 99, height: 5, marginTop: 6, overflow: "hidden" }}>
      <div style={{ width: w + "%", height: "100%", background: color, borderRadius: 99 }} />
    </div>
  );
}

function ValBar({ validated, rejected, pending, total }) {
  if (!total) return <span style={{ color: "#94a3b8", fontSize: 12 }}>No data</span>;
  return (
    <div>
      <div style={{ display: "flex", height: 8, borderRadius: 99, overflow: "hidden", background: "#e2e8f0" }}>
        <div style={{ width: pct(validated, total) + "%", background: C.green }} />
        <div style={{ width: pct(rejected, total) + "%", background: C.red }} />
        <div style={{ width: pct(pending, total) + "%", background: "#94a3b8" }} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 5, fontSize: 11, flexWrap: "wrap" }}>
        <span style={{ color: C.green }}>&#x2713; {validated} validated ({pct(validated, total)}%)</span>
        <span style={{ color: C.red }}>&#x2715; {rejected} rejected ({pct(rejected, total)}%)</span>
        <span style={{ color: C.slate }}>&#9675; {pending} pending</span>
      </div>
    </div>
  );
}

function ScorecardRow({ label, value, subLabel, highlight }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 0", borderBottom: "1px solid #f1f5f9",
    }}>
      <div>
        <div style={{ fontSize: 13, color: highlight ? C.heading : C.muted, fontWeight: highlight ? 600 : 400 }}>{label}</div>
        {subLabel && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{subLabel}</div>}
      </div>
      <div style={{
        fontFamily: "monospace", fontSize: 15, fontWeight: 700,
        color: highlight ? C.green : C.heading,
        background: highlight ? C.greenBg : "#f8fafc",
        border: "1px solid " + (highlight ? C.greenMid : C.border),
        padding: "3px 10px", borderRadius: 6, minWidth: 60, textAlign: "right",
      }}>
        {value}
      </div>
    </div>
  );
}

function Scorecard({ t }) {
  const d = t.totalDays;
  const fd = t.fieldDays;
  return (
    <div className="scorecard" style={{
      background: C.cardBg, border: "1px solid " + C.border, borderRadius: 12,
      padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.heading }}>{t.name}</div>
          <div style={{ fontSize: 11, color: C.muted }}>Daily Scorecard</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", background: "#f1f5f9", border: "1px solid " + C.border, padding: "3px 8px", borderRadius: 6, color: C.slate }}>
            {d} active days
          </div>
        </div>
      </div>

      <ScorecardRow label="Bookings / day"       value={fmtN(t.bookings / d)} />
      <ScorecardRow label="Meetings attended / day" value={fmtN(t.meetings / d)} />
      <ScorecardRow label="Connected calls / day" value={fmtN(t.connectedCalls / d)} />
      <ScorecardRow label="Total calls / day"     value={fmtN(t.totalCalls / fd)}  subLabel="Field days only" />
      <ScorecardRow label="Validation rate"       value={t.valRate + "%"}           subLabel="Validated / contacted" />
      <ScorecardRow
        label="Revenue / day (50%)"
        value={fmt$(t.revenueHalved / d)}
        subLabel="As booked — buddy closes other 50%"
        highlight={t.revenueHalved > 0}
      />
      <ScorecardRow
        label="Units / day (50%)"
        value={fmtN(t.unitsHalved / d)}
        subLabel="As booked — buddy closes other 50%"
        highlight={t.unitsHalved > 0}
      />
    </div>
  );
}

function TraineeCard({ t, all }) {
  const valRate = t.valRate;
  const valColor = valRate >= 60 ? C.green : valRate >= 40 ? C.amber : C.red;
  const valBg    = valRate >= 60 ? C.greenBg : valRate >= 40 ? C.amberBg : C.redBg;
  return (
    <div className="card" style={{ background: C.cardBg, border: "1px solid " + C.border, borderRadius: 12, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.heading }}>{t.name}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{t.fullName}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, fontFamily: "monospace", background: "#f1f5f9", border: "1px solid " + C.border, padding: "3px 8px", borderRadius: 6, color: C.slate }}>{t.totalDays}d</div>
          {(t.absences?.publicHolidays > 0 || t.absences?.sickDays > 0) && (
            <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 3 }}>
              {[t.absences.publicHolidays > 0 && (t.absences.publicHolidays + " pub hol"), t.absences.sickDays > 0 && (t.absences.sickDays + " sick")].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
      </div>
      <div style={{ background: t.revenue > 0 ? C.greenBg : "#f8fafc", border: "1px solid " + (t.revenue > 0 ? C.greenMid : C.border), borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: t.revenue > 0 ? C.green : C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Total Revenue (actual)</div>
        <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "monospace", color: t.revenue > 0 ? C.green : "#cbd5e1" }}>{fmt$(t.revenue)}</div>
        <div style={{ fontSize: 11, color: t.units > 0 ? C.green : "#cbd5e1", marginTop: 2 }}>{t.units} {t.units === 1 ? "deal" : "deals"} closed</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Meetings",    val: t.meetings,                        maxKey: "meetings",       color: "#7c3aed", raw: t.meetings },
          { label: "Bookings",    val: t.bookings,                        maxKey: "bookings",       color: C.blue,    raw: t.bookings },
          { label: "Connected",   val: t.connectedCalls.toLocaleString(), maxKey: "connectedCalls", color: "#0284c7", raw: t.connectedCalls },
          { label: "Total Calls", val: t.totalCalls.toLocaleString(),     maxKey: "totalCalls",     color: "#0891b2", raw: t.totalCalls },
        ].map((s) => (
          <div key={s.label} style={{ background: "#f8fafc", border: "1px solid " + C.border, borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 600, color: C.heading }}>{s.val}</div>
            <MiniBar value={s.raw} max={bestOf(all, s.maxKey)} color={s.color} />
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid " + C.border, paddingTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Validation · {t.valTotal} bookings</div>
          <div style={{ display: "flex", gap: 6 }}>
            <Badge color={C.blue} bg={C.blueBg}>Contact {t.valContactRate}%</Badge>
            <Badge color={valColor} bg={valBg}>Val. {t.valRate}%</Badge>
          </div>
        </div>
        <ValBar validated={t.valValidated} rejected={t.valRejected} pending={t.valPending} total={t.valTotal} />
      </div>
    </div>
  );
}

function SectionDivider({ label, colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: "6px 20px", background: "#f8fafc", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", borderTop: "1px solid " + C.border, borderBottom: "1px solid " + C.border }}>
        {label}
      </td>
    </tr>
  );
}

export default function SnapshotPage() {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/snapshot-data", { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Unknown error");
      // Attach halved values for scorecard
      json.trainees = json.trainees.map((t) => ({
        ...t,
        revenueHalved: t.revenue / 2,
        unitsHalved:   t.units   / 2,
      }));
      setData(json);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, [load]);

  const trainees = data?.trainees ?? [];
  const today    = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

  return (
    <PasswordGate requireMaster>
      <style>{printStyles}</style>
      <div className="page-wrap" style={{ minHeight: "100vh", background: "#f1f5f9", padding: "36px 24px", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 1020, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Badge>Admin · Field Performance</Badge>
                {data && <span style={{ fontSize: 11, color: C.muted }}>{data.periodStart} &#8594; {data.periodEnd}</span>}
              </div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: C.heading, letterSpacing: "-0.02em" }}>Trainee Snapshot</h1>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>Week 3 in field · 2 full calling weeks complete · Buddy model</p>
            </div>
            <div className="no-print" style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {lastRefresh && <span style={{ fontSize: 11, color: "#94a3b8" }}>{lastRefresh.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}</span>}
              <button onClick={load} disabled={loading} style={{ padding: "8px 14px", fontSize: 13, borderRadius: 8, cursor: loading ? "not-allowed" : "pointer", border: "1px solid " + C.border, background: C.cardBg, color: C.muted, fontWeight: 500 }}>
                {loading ? "Loading..." : "Refresh"}
              </button>
              <button onClick={() => window.print()} style={{ padding: "8px 16px", fontSize: 13, borderRadius: 8, cursor: "pointer", border: "none", background: C.heading, color: "#fff", fontWeight: 600 }}>
                Download PDF
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: C.redBg, border: "1px solid #fca5a5", borderRadius: 10, padding: "14px 18px", marginBottom: 20, color: "#991b1b", fontSize: 14 }}>
              <strong>Error:</strong> {error} &nbsp;
              <button onClick={load} style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "#991b1b", fontSize: 14 }}>Retry</button>
            </div>
          )}

          {loading && !data && <div style={{ textAlign: "center", padding: "80px 0", color: C.muted }}>Loading live data...</div>}

          {/* Overview cards */}
          {trainees.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Overview</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
                {trainees.map((t) => <TraineeCard key={t.slug} t={t} all={trainees} />)}
              </div>
            </>
          )}

          {/* Daily scorecards */}
          {trainees.length > 0 && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Daily Scorecards</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>All metrics per active working day · Revenue &amp; units shown at 50% (trainee books, buddy closes)</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
                {trainees.map((t) => <Scorecard key={t.slug} t={t} />)}
              </div>
            </>
          )}

          {/* Full comparison table */}
          {trainees.length > 0 && (
            <div className="table-wrap" style={{ background: C.cardBg, border: "1px solid " + C.border, borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 14 }}>
              <div style={{ padding: "13px 20px", borderBottom: "1px solid " + C.border, background: C.rowAlt }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Full Comparison</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid " + C.border, background: C.rowAlt }}>
                    <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, color: C.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em" }}>Metric</th>
                    {trainees.map((t) => <th key={t.name} style={{ padding: "10px 20px", textAlign: "right", fontSize: 13, color: C.heading, fontWeight: 700 }}>{t.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid " + C.border }}>
                    <td style={{ padding: "11px 20px", fontSize: 13, color: C.muted }}>Active Days<div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>Excl. absences and public holidays</div></td>
                    {trainees.map((t) => (
                      <td key={t.name} style={{ padding: "11px 20px", textAlign: "right", fontFamily: "monospace", fontSize: 13, color: C.heading }}>
                        {t.totalDays}
                        {(t.absences?.publicHolidays > 0 || t.absences?.sickDays > 0) && (
                          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>
                            {[t.absences.publicHolidays > 0 && (t.absences.publicHolidays + " PH"), t.absences.sickDays > 0 && (t.absences.sickDays + " sick")].filter(Boolean).join(" · ")}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                  {[
                    { label: "Sales Revenue (actual)",  key: "revenue",        fmt: fmt$,                      primary: true, note: "Doubled from Airtable — actual closed value" },
                    { label: "Sales Units (actual)",    key: "units",          fmt: (v) => v,                  primary: true, note: "Doubled from Airtable — actual deals closed" },
                    { label: "Meetings Attended",       key: "meetings",       fmt: (v) => v },
                    { label: "Total Bookings",          key: "bookings",       fmt: (v) => v.toLocaleString() },
                    { label: "Connected Calls",         key: "connectedCalls", fmt: (v) => v.toLocaleString() },
                    { label: "Total Calls Dialled",     key: "totalCalls",     fmt: (v) => v.toLocaleString(), note: "Field weeks only" },
                  ].map((m) => {
                    const bv = bestOf(trainees, m.key);
                    return (
                      <tr key={m.key} style={{ borderBottom: "1px solid " + C.border, background: m.primary ? "rgba(22,163,74,0.03)" : C.cardBg }}>
                        <td style={{ padding: "11px 20px", fontSize: 13, color: m.primary ? C.heading : C.muted, fontWeight: m.primary ? 600 : 400 }}>
                          {m.primary && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: C.green, marginRight: 8, verticalAlign: "middle" }} />}
                          {m.label}
                          {m.note && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1, fontWeight: 400 }}>{m.note}</div>}
                        </td>
                        {trainees.map((t) => {
                          const v = t[m.key];
                          const isBest = v === bv && bv > 0;
                          return (
                            <td key={t.name} style={{ padding: "11px 20px", textAlign: "right", fontFamily: "monospace", fontSize: 13, fontWeight: isBest ? 700 : 400, color: isBest ? (m.primary ? C.green : C.blue) : v === 0 ? "#cbd5e1" : C.heading }}>
                              {m.fmt(v)}{isBest && <span style={{ fontSize: 8, marginLeft: 4, opacity: 0.5 }}>&#9650;</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  <SectionDivider label="Daily Averages (per active day)" colSpan={trainees.length + 1} />
                  {[
                    { label: "Bookings / day",          key: "bookingsPerDay",       fmt: (v) => fmtN(v) },
                    { label: "Connected calls / day",   key: "connectedCallsPerDay", fmt: (v) => fmtN(v) },
                    { label: "Total calls / day",       key: "totalCallsPerDay",     fmt: (v) => fmtN(v), note: "Field days only" },
                    { label: "Revenue / day (50%)",     key: "revenueHalved",        fmt: (v, t) => fmt$(v / t.totalDays), note: "As booked by trainee" },
                    { label: "Units / day (50%)",       key: "unitsHalved",          fmt: (v, t) => fmtN(v / t.totalDays), note: "As booked by trainee" },
                  ].map((m, i, arr) => {
                    const vals = trainees.map((t) => m.fmt ? (m.key === "revenueHalved" || m.key === "unitsHalved" ? t[m.key] / t.totalDays : t[m.key]) : t[m.key]);
                    const bv = Math.max(...trainees.map((t) => m.key === "revenueHalved" || m.key === "unitsHalved" ? t[m.key] / t.totalDays : t[m.key]));
                    return (
                      <tr key={m.key} style={{ borderBottom: i < arr.length - 1 ? "1px solid " + C.border : "none" }}>
                        <td style={{ padding: "11px 20px", fontSize: 13, color: C.muted }}>
                          {m.label}{m.note && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{m.note}</div>}
                        </td>
                        {trainees.map((t) => {
                          const v = m.key === "revenueHalved" || m.key === "unitsHalved" ? t[m.key] / t.totalDays : t[m.key];
                          const isBest = v === bv && bv > 0;
                          return (
                            <td key={t.name} style={{ padding: "11px 20px", textAlign: "right", fontFamily: "monospace", fontSize: 13, color: isBest ? C.blue : C.heading, fontWeight: isBest ? 700 : 400 }}>
                              {m.key === "revenueHalved" ? fmt$(v) : fmtN(v)}{isBest && <span style={{ fontSize: 8, marginLeft: 4, opacity: 0.4 }}>&#9650;</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  <SectionDivider label="Booking Validation" colSpan={trainees.length + 1} />
                  {[
                    { label: "Total in Queue",  key: "valTotal",       fmt: (v)    => v },
                    { label: "Validated",       key: "valValidated",   fmt: (v, t) => v + " (" + pct(v, t.valTotal) + "%)", color: C.green },
                    { label: "Rejected",        key: "valRejected",    fmt: (v, t) => v + " (" + pct(v, t.valTotal) + "%)", color: C.red, lowerIsBetter: true },
                    { label: "Pending",         key: "valPending",     fmt: (v, t) => v + " (" + pct(v, t.valTotal) + "%)", color: C.slate },
                    { label: "Contact Rate",    key: "valContactRate", fmt: (v)    => v + "%", color: "#0284c7" },
                    { label: "Validation Rate", key: "valRate",        fmt: (v)    => v + "%", color: C.green, note: "Validated / contacted (excl. pending)" },
                  ].map((m, i, arr) => {
                    const bv = m.lowerIsBetter ? Math.min(...trainees.map((t) => t[m.key])) : bestOf(trainees, m.key);
                    return (
                      <tr key={m.key} style={{ borderBottom: i < arr.length - 1 ? "1px solid " + C.border : "none", background: i % 2 === 0 ? C.cardBg : C.rowAlt }}>
                        <td style={{ padding: "10px 20px", fontSize: 13, color: m.color || C.muted }}>
                          {m.label}{m.note && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{m.note}</div>}
                        </td>
                        {trainees.map((t) => {
                          const v = t[m.key];
                          const isBest = v === bv && bv > 0;
                          return (
                            <td key={t.name} style={{ padding: "10px 20px", textAlign: "right", fontFamily: "monospace", fontSize: 13, color: m.color || C.heading, fontWeight: isBest ? 700 : 400 }}>
                              {m.fmt(v, t)}{isBest && <span style={{ fontSize: 8, marginLeft: 4, opacity: 0.4 }}>&#9650;</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 14, fontSize: 11, color: "#94a3b8", textAlign: "center" }}>
            Revenue and units doubled from Airtable values · Scorecards show 50% (trainee contribution) · {today}
            {lastRefresh && <span className="no-print"> · Auto-refreshes every 5 min</span>}
          </div>
        </div>
      </div>
    </PasswordGate>
  );
}
