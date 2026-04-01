"use client";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const BLOCKS = [
  {
    label: "Landline Cold Calls",
    time: "9:00–9:45am · 45min",
    target: "Target: 1 booking",
    type: "calls",
    icon: "📞",
    rows: { start: 1, span: 3 },
  },
  {
    label: "Rebooking Calls",
    time: "9:45–10:00am · 15min",
    target: null,
    type: "followup",
    icon: "🔄",
    rows: { start: 4, span: 1 },
  },
  {
    label: "Cold Calls",
    time: "10:00am–12:00pm · 2hrs",
    target: "Target: 2 bookings",
    type: "calls",
    icon: "📞",
    rows: { start: 5, span: 8 },
  },
  {
    label: "Follow-up Calls",
    time: "12:00–12:30pm · 30min",
    target: "Target: 1 booking",
    type: "followup",
    icon: "📋",
    rows: { start: 13, span: 2 },
  },
  {
    label: "Zoom Checkpoint",
    time: "12:30–1:00pm · 30min",
    target: null,
    type: "zoom",
    icon: "🎙",
    rows: { start: 15, span: 2 },
  },
  {
    label: "Break",
    time: "1:00–1:30pm · 30min",
    target: null,
    type: "break",
    icon: null,
    rows: { start: 17, span: 2 },
  },
  {
    label: "Meeting 1",
    time: "1:30–2:30pm · 1hr",
    target: null,
    type: "meeting",
    icon: "🤝",
    rows: { start: 19, span: 4 },
  },
  {
    label: "Cold Calls",
    time: "2:30–5:00pm · 2.5hrs",
    target: "Target: 2.5 bookings",
    type: "calls",
    icon: "📞",
    rows: { start: 23, span: 10 },
  },
];

// Time labels every 15 min from 9:00am to 5:00pm
const TIME_LABELS = [
  "9:00am","9:15am","9:30am","9:45am",
  "10:00am","10:15am","10:30am","10:45am",
  "11:00am","11:15am","11:30am","11:45am",
  "12:00pm","12:15pm","12:30pm","12:45pm",
  "1:00pm","1:15pm","1:30pm","1:45pm",
  "2:00pm","2:15pm","2:30pm","2:45pm",
  "3:00pm","3:15pm","3:30pm","3:45pm",
  "4:00pm","4:15pm","4:30pm","4:45pm",
  "5:00pm",
];

const TYPE_STYLES: Record<string, string> = {
  calls:    "bg-blue-50 border border-blue-200 text-blue-800",
  followup: "bg-amber-50 border border-amber-200 text-amber-800",
  zoom:     "bg-purple-50 border border-purple-200 text-purple-700",
  meeting:  "bg-green-50 border border-green-200 text-green-800",
  break:    "bg-gray-50 border border-gray-100 text-gray-400",
};

const LEGEND = [
  { label: "Cold / Landline Calls", color: "bg-blue-100 border border-blue-300" },
  { label: "Follow-up / Rebooking", color: "bg-amber-100 border border-amber-300" },
  { label: "Meeting", color: "bg-green-100 border border-green-300" },
  { label: "Zoom Checkpoint", color: "bg-purple-100 border border-purple-300" },
];

export default function SchedulePage() {
  const totalRows = TIME_LABELS.length;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Daily Schedule</h1>
        <p className="text-sm text-gray-500 mb-6">Standard weekly structure — Mon to Fri</p>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          {/* Header row */}
          <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: "80px repeat(5, 1fr)" }}>
            <div className="py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-900" />
            {DAYS.map((day) => (
              <div key={day} className="py-3 px-2 text-center text-sm font-semibold text-white bg-gray-900 border-l border-gray-700">
                {day}
              </div>
            ))}
          </div>

          {/* Grid body */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: "80px repeat(5, 1fr)",
              gridTemplateRows: `repeat(${totalRows}, 28px)`,
            }}
          >
            {/* Time labels */}
            {TIME_LABELS.map((t, i) => (
              <div
                key={t}
                className="flex items-start justify-end pr-3 pt-1 text-xs text-gray-400 border-b border-gray-100"
                style={{ gridRow: i + 1, gridColumn: 1 }}
              >
                {t.endsWith(":00am") || t.endsWith(":00pm") || t === "9:00am" ? t : ""}
              </div>
            ))}

            {/* Day columns background lines */}
            {DAYS.map((_, di) =>
              TIME_LABELS.map((_, ri) => (
                <div
                  key={`bg-${di}-${ri}`}
                  className="border-b border-l border-gray-100"
                  style={{ gridRow: ri + 1, gridColumn: di + 2 }}
                />
              ))
            )}

            {/* Blocks — same for every day */}
            {DAYS.map((_, di) =>
              BLOCKS.map((block, bi) => {
                const isBreak = block.type === "break";
                return (
                  <div
                    key={`block-${di}-${bi}`}
                    className={`mx-1 my-0.5 rounded-lg px-2 flex flex-col justify-center overflow-hidden ${
                      isBreak ? "border-dashed border border-gray-200" : TYPE_STYLES[block.type]
                    }`}
                    style={{
                      gridRow: `${block.rows.start} / span ${block.rows.span}`,
                      gridColumn: di + 2,
                    }}
                  >
                    {!isBreak && (
                      <>
                        <div className="font-semibold text-xs leading-tight flex items-center gap-1">
                          {block.icon && <span>{block.icon}</span>}
                          {block.label}
                        </div>
                        <div className="text-[10px] opacity-60 mt-0.5">{block.time}</div>
                        {block.target && (
                          <div className="text-[10px] font-semibold mt-0.5 opacity-80">{block.target}</div>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-5 flex-wrap">
          {LEGEND.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs text-gray-600">
              <span className={`w-4 h-4 rounded ${item.color}`} />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}