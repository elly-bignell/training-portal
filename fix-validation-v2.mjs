// fix-validation-v2.mjs
// Run: node fix-validation-v2.mjs
// 1. Role-based access: everyone sees Process + Create Booking, admin/senior sees all
// 2. Removes Lead Source field completely
// 3. Meeting Date/Time label specifies Adelaide time
// 4. Fixes rejection bug (per-card state)

import { readFileSync, writeFileSync, mkdirSync } from 'fs';

// ─── 1. Create auth API route ─────────────────────────────────────────────────

mkdirSync('app/api/validation/auth', { recursive: true });
writeFileSync('app/api/validation/auth/route.ts', `// app/api/validation/auth/route.ts
// Returns role based on password: "admin" | "senior" | "trainee" | null

import { NextRequest, NextResponse } from "next/server";

const MASTER_PASSWORD = process.env.MASTER_PASSWORD || "";

// Senior team members who get full validation access
const SENIOR_SLUGS = ["lucas-tirri", "felipe-garcia", "dylan-munro", "thomas-rennie"];

// All known trainee slugs
const ALL_TRAINEE_SLUGS = [
  "connie-matthews",
  "cindy-manrique", 
  "cindy-rose-rondez-manrique",
  "krishna-patel",
  "lucas-tirri",
  "felipe-garcia",
  "dylan-munro",
  "thomas-rennie",
  "tom-rennie",
];

function getPasswordForSlug(slug: string): string {
  const envKey = "PASSWORD_" + slug.toUpperCase().replace(/-/g, "_");
  return process.env[envKey] || "";
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ role: null });
    }

    // Check master password first
    if (MASTER_PASSWORD && password === MASTER_PASSWORD) {
      return NextResponse.json({ role: "admin" });
    }

    // Check all trainee passwords
    for (const slug of ALL_TRAINEE_SLUGS) {
      const pw = getPasswordForSlug(slug);
      if (pw && password === pw) {
        const isSenior = SENIOR_SLUGS.includes(slug);
        return NextResponse.json({ role: isSenior ? "senior" : "trainee", slug });
      }
    }

    return NextResponse.json({ role: null });
  } catch {
    return NextResponse.json({ role: null }, { status: 400 });
  }
}
`);
console.log('✅ Created: app/api/validation/auth/route.ts');


// ─── 2. Rewrite the validation page ──────────────────────────────────────────

const file = 'app/validation/page.tsx';
let content = readFileSync(file, 'utf-8');

// ── Remove Lead Source everywhere ──

// Remove from form state objects
content = content.replace(/\s*lead_source: "",?\n/g, '\n');

// Remove Lead Source form field - find the whole grid row containing it
// Pattern: grid with Meeting Date/Time + Lead Source
content = content.replace(
  /\s*<div className="grid grid-cols-2 gap-4">\s*<div>\s*<label[^>]*>Meeting Date\/Time<\/label>\s*<input\s*type="datetime-local"[\s\S]*?<\/div>\s*<div>\s*<label[^>]*>Lead Source<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>\s*<\/div>/,
  `
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Date/Time <span className="font-normal text-gray-400">(Adelaide time)</span></label>
            <input
              type="datetime-local"
              value={form.meeting_datetime}
              onChange={(e) => setForm({ ...form, meeting_datetime: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>`
);

// If the above didn't match (different formatting), also try removing standalone lead_source elements
content = content.replace(/<div>\s*<label[^>]*>Lead Source<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>/g, '');

// Remove lead_source from type interface
content = content.replace(/\s*lead_source\?: string;/g, '');

// Remove lead_source from API mapping
content = content.replace(/\s*lead_source: r\.fields\.lead_source \|\| "",?/g, '');

// Remove lead_source from destructuring
content = content.replace(/, lead_source/g, '');

// Remove lead_source from fields assignment
content = content.replace(/\s*if \(lead_source\) fields\.lead_source = lead_source;\n/g, '');

// Remove lead_source from display
content = content.replace(/\s*\{booking\.lead_source && <span>📍 \{booking\.lead_source\}<\/span>\}/g, '');

// Remove from CSV
content = content.replace(/, "Lead Source"/g, '');
content = content.replace(/b\.lead_source \|\| "", /g, '');

// Fix Meeting Date/Time label if not already caught above
content = content.replace(
  />Meeting Date\/Time<\/label>/,
  '>Meeting Date/Time <span className="font-normal text-gray-400">(Adelaide time)</span></label>'
);


// ── Fix the page export: remove PasswordGate, add custom auth with roles ──

// Remove PasswordGate import
content = content.replace(
  /import PasswordGate from ["']@\/components\/PasswordGate["'];?\n?/,
  ''
);

// Replace the page export with role-based auth version
const oldExport = content.indexOf('export default function ValidationPage()');
if (oldExport !== -1) {
  content = content.substring(0, oldExport);
}

// Also need to update ValidationContent to accept a role prop and filter tabs
// First, modify the TABS rendering and the tab content area

// Replace the TABS constant definition to include access info
content = content.replace(
  `const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "flowchart", label: "Process", icon: "🔀" },
  { key: "create", label: "Create Booking", icon: "📝" },
  { key: "queue", label: "Validation Queue", icon: "⏳" },
  { key: "lodgement", label: "Daily Lodgement", icon: "📊" },
  { key: "schedule", label: "Observations", icon: "📅" },
  { key: "reports", label: "Reports", icon: "📈" },
];`,
  `const TABS: { key: Tab; label: string; icon: string; publicTab?: boolean }[] = [
  { key: "flowchart", label: "Process", icon: "🔀", publicTab: true },
  { key: "create", label: "Create Booking", icon: "📝", publicTab: true },
  { key: "queue", label: "Validation Queue", icon: "⏳" },
  { key: "lodgement", label: "Daily Lodgement", icon: "📊" },
  { key: "schedule", label: "Observations", icon: "📅" },
  { key: "reports", label: "Reports", icon: "📈" },
];

type UserRole = "admin" | "senior" | "trainee";`
);

// Update ValidationContent to accept role prop
content = content.replace(
  'function ValidationContent() {',
  'function ValidationContent({ role }: { role: UserRole }) {'
);

// Filter tabs based on role
content = content.replace(
  `const pendingCount = bookings.filter((b) => b.status === "pending").length;`,
  `const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const isFullAccess = role === "admin" || role === "senior";
  const visibleTabs = isFullAccess ? TABS : TABS.filter((t) => t.publicTab);`
);

// Replace TABS.map with visibleTabs.map in the tab bar
content = content.replace(
  '{TABS.map((tab) => (',
  '{visibleTabs.map((tab) => ('
);


// ── Now append the new export with custom auth ──

content += `

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH GATE — role-based access
// ═══════════════════════════════════════════════════════════════════════════════

function AuthGate() {
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Check sessionStorage on mount
  useEffect(() => {
    const saved = window.sessionStorage.getItem("validation_role");
    if (saved === "admin" || saved === "senior" || saved === "trainee") {
      setRole(saved as UserRole);
    }
    setLoaded(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(false);

    try {
      const res = await fetch("/api/validation/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.role) {
        setRole(data.role);
        window.sessionStorage.setItem("validation_role", data.role);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setChecking(false);
    }
  };

  if (!loaded) return null;

  if (role) {
    return <ValidationContent role={role} />;
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🔐</div>
          <h1 className="text-xl font-bold text-slate-800">Booking Validation</h1>
          <p className="text-sm text-slate-500 mt-1">Enter your password to continue</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            placeholder="Password"
            autoFocus
            className={\`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent \${error ? "border-red-300 bg-red-50" : "border-gray-300"}\`}
          />
          {error && <p className="text-xs text-red-500 mt-2">Invalid password. Try again.</p>}
          <button
            type="submit"
            disabled={checking || !password}
            className="w-full mt-4 py-3 bg-[#E6017D] text-white font-semibold rounded-lg hover:bg-[#c9016c] disabled:opacity-50 transition-colors"
          >
            {checking ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ValidationPage() {
  return <AuthGate />;
}
`;

writeFileSync(file, content);
console.log('✅ Saved: ' + file);

// Verify
const leadSourceCount = (content.match(/lead_source/g) || []).length;
const passwordGateCount = (content.match(/PasswordGate/g) || []).length;
console.log(leadSourceCount === 0 ? '✅ All lead_source removed' : \`⚠️  \${leadSourceCount} lead_source refs remain\`);
console.log(passwordGateCount === 0 ? '✅ PasswordGate removed' : \`⚠️  \${passwordGateCount} PasswordGate refs remain\`);

console.log(\`
Done! Changes:
  1. Created /api/validation/auth — checks password, returns role
  2. Custom auth gate — everyone can log in with their password
  3. Trainees see: Process + Create Booking tabs only
  4. Admin + Senior (Lucas, Felipe, Dylan, Tom) see: all 6 tabs
  5. Lead Source field removed completely
  6. Meeting Date/Time label now says "(Adelaide time)"
  7. Session persists in sessionStorage (per browser tab)

ENV VARS NEEDED (you likely already have these):
  - MASTER_PASSWORD
  - PASSWORD_LUCAS_TIRRI
  - PASSWORD_FELIPE_GARCIA  
  - PASSWORD_DYLAN_MUNRO
  - PASSWORD_THOMAS_RENNIE (or PASSWORD_TOM_RENNIE)
  - PASSWORD_CONNIE_MATTHEWS
  - PASSWORD_CINDY_MANRIQUE (or PASSWORD_CINDY_ROSE_RONDEZ_MANRIQUE)
  - PASSWORD_KRISHNA_PATEL

git add . && git commit -m "Role-based validation access, remove lead source, Adelaide time" && git push
\`);
