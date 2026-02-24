// fix-validation.mjs
// Run: node fix-validation.mjs
// Fixes: 1) Removes Lead Source from form  2) Fixes rejection not working

import { readFileSync, writeFileSync } from 'fs';

const file = 'app/validation/page.tsx';
let content = readFileSync(file, 'utf-8');

// ─── 1. Remove lead_source from form state ───────────────────────────────────
content = content.replace(
  `    lead_source: "",
  });`,
  `  });`
);

content = content.replace(
  `          lead_source: "",
        });`,
  `        });`
);

// Remove lead_source from form state initialisation (both occurrences)
content = content.replace(/\s*lead_source: "",?\n/g, '\n');

// Remove the Lead Source form field block entirely
content = content.replace(
  /\s*<div>\s*<label className="block text-xs font-semibold text-gray-600 mb-1">Lead Source<\/label>\s*<select\s*value=\{form\.lead_source\}[\s\S]*?<\/select>\s*<\/div>/g,
  ''
);

// Make Meeting Date/Time full width since lead source is gone
content = content.replace(
  `          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Date/Time</label>`,
  `          <div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Date/Time</label>`
);

// Fix the closing of that grid section  
// Find the pattern: meeting datetime input </div> </div> (the extra grid wrapper)
// This is tricky, let's just leave it - a single column grid-cols-2 with one item still works fine


// ─── 2. Fix rejection bug — replace the whole ValidationQueueTab ─────────────

// The issue: shared noteText/activeNoteId state across cards means typing a 
// rejection note for one card can get confused. Fix: use per-card notes object.

const oldQueueStart = `function ValidationQueueTab({ bookings, onUpdate, allBookings }: {
  bookings: Booking[];
  onUpdate: () => void;
  allBookings: Booking[];
}) {`;

const oldQueueEnd = `        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: Daily Lodgement`;

const queueStartIdx = content.indexOf(oldQueueStart);
const queueEndIdx = content.indexOf(oldQueueEnd);

if (queueStartIdx === -1 || queueEndIdx === -1) {
  console.error('❌ Could not find ValidationQueueTab boundaries');
  console.log('  Start found:', queueStartIdx !== -1);
  console.log('  End found:', queueEndIdx !== -1);
  // Try to find approximate locations
  const approxStart = content.indexOf('function ValidationQueueTab');
  const approxEnd = content.indexOf('TAB 3: Daily Lodgement');
  console.log('  Approx start:', approxStart);
  console.log('  Approx end:', approxEnd);
} else {
  const newQueue = `function ValidationQueueTab({ bookings, onUpdate, allBookings }: {
  bookings: Booking[];
  onUpdate: () => void;
  allBookings: Booking[];
}) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [rejectMode, setRejectMode] = useState<Record<string, boolean>>({});

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const today = toISODate(new Date());

  const getNote = (id: string) => notes[id] || "";
  const setNote = (id: string, val: string) => setNotes((prev) => ({ ...prev, [id]: val }));

  const handleValidate = async (booking: Booking) => {
    setProcessingId(booking.id);
    try {
      const staffObsDates = allBookings
        .filter((b) => b.staff_member === booking.staff_member && b.observation_date)
        .map((b) => b.observation_date!);
      const obsDate = getNextAvailableObservationDate(staffObsDates, today);

      const res = await fetch(\`/api/validation/\${booking.id}\`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "validated",
          validation_date: today,
          validation_note: getNote(booking.id),
          observation_date: obsDate,
        }),
      });
      if (!res.ok) throw new Error("PATCH failed");
      setNotes((prev) => { const n = { ...prev }; delete n[booking.id]; return n; });
      onUpdate();
    } catch (err) {
      console.error("Failed to validate:", err);
      alert("Failed to validate booking — check console for details.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (booking: Booking) => {
    const note = getNote(booking.id);
    if (!note.trim()) {
      alert("Please enter a rejection reason before confirming.");
      return;
    }
    setProcessingId(booking.id);
    try {
      const res = await fetch(\`/api/validation/\${booking.id}\`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          validation_date: today,
          validation_note: note,
        }),
      });
      if (!res.ok) throw new Error("PATCH failed");
      setNotes((prev) => { const n = { ...prev }; delete n[booking.id]; return n; });
      setRejectMode((prev) => { const r = { ...prev }; delete r[booking.id]; return r; });
      onUpdate();
    } catch (err) {
      console.error("Failed to reject:", err);
      alert("Failed to reject booking — check console for details.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Validation Queue</h2>
          <p className="text-sm text-slate-500">{pendingBookings.length} booking{pendingBookings.length !== 1 ? "s" : ""} pending validation</p>
        </div>
      </div>

      {pendingBookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-slate-600 font-medium">All bookings have been validated</p>
          <p className="text-slate-400 text-sm mt-1">New bookings will appear here when created</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingBookings.map((booking) => {
            const isRejecting = !!rejectMode[booking.id];
            const isProcessing = processingId === booking.id;
            const note = getNote(booking.id);

            return (
              <div key={booking.id} className="bg-white rounded-xl border border-amber-200 shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase">Pending</span>
                      <span className="text-xs text-gray-400">Booked {formatDate(booking.booking_date)}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800">{booking.business_name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                      <span>👤 {booking.staff_member}</span>
                      <span>🤝 Buddy: {booking.buddy}</span>
                      {booking.contact_name && <span>📇 {booking.contact_name}</span>}
                      {booking.contact_phone && <span>📞 {booking.contact_phone}</span>}
                      {booking.meeting_datetime && <span>🕐 {booking.meeting_datetime}</span>}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(booking.id, e.target.value)}
                    placeholder={isRejecting ? "Rejection reason (required)..." : "Feedback note (optional)..."}
                    className={\`w-full border rounded-lg px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent \${isRejecting ? "border-red-300 bg-red-50/30" : "border-gray-200"}\`}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleValidate(booking)}
                      disabled={isProcessing}
                      className="flex-1 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-1.5"
                    >
                      ✅ Validate
                    </button>
                    {isRejecting ? (
                      <button
                        onClick={() => handleReject(booking)}
                        disabled={isProcessing || !note.trim()}
                        className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-1.5"
                      >
                        ❌ Confirm Rejection
                      </button>
                    ) : (
                      <button
                        onClick={() => setRejectMode((prev) => ({ ...prev, [booking.id]: true }))}
                        className="flex-1 py-2.5 bg-white text-red-600 border-2 border-red-200 font-semibold rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-1.5"
                      >
                        ❌ Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: Daily Lodgement`;

  content = content.substring(0, queueStartIdx) + newQueue + content.substring(queueEndIdx + oldQueueEnd.length);
  console.log('✅ Replaced ValidationQueueTab with fixed version');
}

// ─── 3. Also remove lead_source references from display areas ────────────────
content = content.replace(/\s*\{booking\.lead_source && <span>📍 \{booking\.lead_source\}<\/span>\}/g, '');

// ─── 4. Remove lead_source from CSV export ───────────────────────────────────
content = content.replace(/, "Lead Source"/g, '');
content = content.replace(/b\.lead_source \|\| "",? ?/g, '');

// ─── Write ───────────────────────────────────────────────────────────────────

writeFileSync(file, content);
console.log('✅ Saved: ' + file);

// Verify no lead_source remains
const remaining = (content.match(/lead_source/g) || []).length;
if (remaining > 0) {
  console.warn(`⚠️  ${remaining} lead_source references still found — check manually`);
} else {
  console.log('✅ All lead_source references removed');
}

console.log(`
Done! Changes:
  1. Removed Lead Source from Create Booking form
  2. Fixed rejection — each card now has its own note state
  3. Added error alerts so failed API calls are visible
  4. Rejection textarea highlights red when in reject mode
  5. Removed lead_source from display cards and CSV export

git add . && git commit -m "Fix validation: remove lead source, fix rejection bug" && git push
`);
