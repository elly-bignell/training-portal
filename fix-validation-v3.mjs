// fix-validation-v3.mjs
// Run: node fix-validation-v3.mjs
// Uses existing data/passwords.ts for auth (no env vars needed)

import { readFileSync, writeFileSync, mkdirSync } from 'fs';

// ─── 1. Create auth API route using existing password system ──────────────────

mkdirSync('app/api/validation/auth', { recursive: true });

const authRoute = [
  '// app/api/validation/auth/route.ts',
  '//',
  '// Returns role based on password: "admin" | "senior" | "trainee" | null',
  '// Uses existing data/passwords.ts — no extra env vars needed',
  '',
  'import { NextRequest, NextResponse } from "next/server";',
  'import { isValidPassword, hasMasterAccess } from "@/data/passwords";',
  'import { trainees } from "@/data/trainees";',
  '',
  '// Senior team members who get full validation access (all 6 tabs)',
  'const SENIOR_SLUGS = ["lucas-tirri", "felipe-garcia", "dylan-munro"];',
  '',
  'export async function POST(request: NextRequest) {',
  '  try {',
  '    const { password } = await request.json();',
  '    if (!password) {',
  '      return NextResponse.json({ role: null });',
  '    }',
  '',
  '    // Check master password first',
  '    if (hasMasterAccess(password)) {',
  '      return NextResponse.json({ role: "admin" });',
  '    }',
  '',
  '    // Check each trainee password',
  '    for (const trainee of trainees) {',
  '      if (isValidPassword(password, trainee.slug)) {',
  '        const isSenior = SENIOR_SLUGS.includes(trainee.slug);',
  '        return NextResponse.json({ role: isSenior ? "senior" : "trainee", slug: trainee.slug });',
  '      }',
  '    }',
  '',
  '    return NextResponse.json({ role: null });',
  '  } catch {',
  '    return NextResponse.json({ role: null }, { status: 400 });',
  '  }',
  '}',
].join('\n');

writeFileSync('app/api/validation/auth/route.ts', authRoute);
console.log('✅ Created: app/api/validation/auth/route.ts');


// ─── 2. Patch the validation page ────────────────────────────────────────────

const file = 'app/validation/page.tsx';
let content = readFileSync(file, 'utf-8');

// ── Remove lead_source everywhere ──
content = content.replace(/\s*lead_source: "",?\n/g, '\n');
content = content.replace(/\s*lead_source\?: string;/g, '');
content = content.replace(/\s*lead_source: r\.fields\.lead_source[^;]*;/g, '');

// Remove Lead Source form field block
content = content.replace(
  /<div>\s*<label[^>]*>Lead Source<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>/g,
  ''
);

// Remove lead_source from display cards
content = content.replace(/\s*\{booking\.lead_source && <span>[^<]*\{booking\.lead_source\}<\/span>\}/g, '');

// Remove from CSV
content = content.replace(/, "Lead Source"/g, '');
content = content.replace(/b\.lead_source \|\| "",? ?/g, '');

// Remove from fields assignment
content = content.replace(/\s*if \(lead_source\) fields\.lead_source = lead_source;\n/g, '');

// ── Fix Meeting Date/Time label to mention Adelaide time ──
content = content.replace(
  />Meeting Date\/Time<\/label>/g,
  '>Meeting Date/Time <span className="font-normal text-gray-400">(Adelaide time)</span></label>'
);

// ── Remove PasswordGate import ──
content = content.replace(
  /import PasswordGate from ["']@\/components\/PasswordGate["'];?\n?/g,
  ''
);

// ── Add role-based tab filtering ──

// Update TABS to include publicTab flag
content = content.replace(
  'const TABS: { key: Tab; label: string; icon: string }[] = [',
  'const TABS: { key: Tab; label: string; icon: string; publicTab?: boolean }[] = ['
);
content = content.replace(
  '{ key: "flowchart", label: "Process", icon: "\uD83D\uDD00" },',
  '{ key: "flowchart", label: "Process", icon: "\uD83D\uDD00", publicTab: true },'
);
content = content.replace(
  '{ key: "create", label: "Create Booking", icon: "\uD83D\uDCDD" },',
  '{ key: "create", label: "Create Booking", icon: "\uD83D\uDCDD", publicTab: true },'
);

// If the icons are stored as emoji literals, also try those
content = content.replace(
  /\{ key: "flowchart", label: "Process", icon: "[^"]*" \}/,
  function(match) {
    if (match.includes('publicTab')) return match;
    return match.replace(' }', ', publicTab: true }');
  }
);
content = content.replace(
  /\{ key: "create", label: "Create Booking", icon: "[^"]*" \}/,
  function(match) {
    if (match.includes('publicTab')) return match;
    return match.replace(' }', ', publicTab: true }');
  }
);

// Add UserRole type after TABS
const tabsEnd = content.indexOf('];', content.indexOf('const TABS'));
if (tabsEnd !== -1) {
  content = content.slice(0, tabsEnd + 2) + '\n\ntype UserRole = "admin" | "senior" | "trainee";' + content.slice(tabsEnd + 2);
}

// Update ValidationContent to accept role prop
content = content.replace(
  'function ValidationContent() {',
  'function ValidationContent({ role }: { role: UserRole }) {'
);

// Add tab filtering after pendingCount
content = content.replace(
  'const pendingCount = bookings.filter((b) => b.status === "pending").length;',
  'const pendingCount = bookings.filter((b) => b.status === "pending").length;\n  const isFullAccess = role === "admin" || role === "senior";\n  const visibleTabs = isFullAccess ? TABS : TABS.filter((t) => t.publicTab);'
);

// Use visibleTabs instead of TABS in rendering
content = content.replace(
  '{TABS.map((tab) => (',
  '{visibleTabs.map((tab) => ('
);

// ── Replace page export with custom auth gate ──

// Find and remove the old export
const oldExportIdx = content.indexOf('export default function ValidationPage()');
if (oldExportIdx !== -1) {
  content = content.substring(0, oldExportIdx);
}

// Build auth gate using array join to avoid backtick issues
const authGate = [
  '',
  '// ═══════════════════════════════════════════════════════════════════════════════',
  '// AUTH GATE — role-based access using existing password system',
  '// ═══════════════════════════════════════════════════════════════════════════════',
  '',
  'function AuthGate() {',
  '  const [password, setPassword] = useState("");',
  '  const [role, setRole] = useState<UserRole | null>(null);',
  '  const [checking, setChecking] = useState(false);',
  '  const [error, setError] = useState(false);',
  '  const [loaded, setLoaded] = useState(false);',
  '',
  '  useEffect(() => {',
  '    const saved = window.sessionStorage.getItem("validation_role");',
  '    if (saved === "admin" || saved === "senior" || saved === "trainee") {',
  '      setRole(saved as UserRole);',
  '    }',
  '    setLoaded(true);',
  '  }, []);',
  '',
  '  const handleSubmit = async (e: React.FormEvent) => {',
  '    e.preventDefault();',
  '    setChecking(true);',
  '    setError(false);',
  '',
  '    try {',
  '      const res = await fetch("/api/validation/auth", {',
  '        method: "POST",',
  '        headers: { "Content-Type": "application/json" },',
  '        body: JSON.stringify({ password }),',
  '      });',
  '      const data = await res.json();',
  '',
  '      if (data.role) {',
  '        setRole(data.role);',
  '        window.sessionStorage.setItem("validation_role", data.role);',
  '      } else {',
  '        setError(true);',
  '      }',
  '    } catch {',
  '      setError(true);',
  '    } finally {',
  '      setChecking(false);',
  '    }',
  '  };',
  '',
  '  if (!loaded) return null;',
  '',
  '  if (role) {',
  '    return <ValidationContent role={role} />;',
  '  }',
  '',
  '  return (',
  '    <main className="min-h-screen bg-slate-100 flex items-center justify-center">',
  '      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-sm">',
  '        <div className="text-center mb-6">',
  '          <div className="text-3xl mb-2">\uD83D\uDD10</div>',
  '          <h1 className="text-xl font-bold text-slate-800">Booking Validation</h1>',
  '          <p className="text-sm text-slate-500 mt-1">Enter your password to continue</p>',
  '        </div>',
  '        <form onSubmit={handleSubmit}>',
  '          <input',
  '            type="password"',
  '            value={password}',
  '            onChange={(e) => { setPassword(e.target.value); setError(false); }}',
  '            placeholder="Password"',
  '            autoFocus',
  '            className={"w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent " + (error ? "border-red-300 bg-red-50" : "border-gray-300")}',
  '          />',
  '          {error && <p className="text-xs text-red-500 mt-2">Invalid password. Try again.</p>}',
  '          <button',
  '            type="submit"',
  '            disabled={checking || !password}',
  '            className="w-full mt-4 py-3 bg-[#E6017D] text-white font-semibold rounded-lg hover:bg-[#c9016c] disabled:opacity-50 transition-colors"',
  '          >',
  '            {checking ? "Checking..." : "Enter"}',
  '          </button>',
  '        </form>',
  '      </div>',
  '    </main>',
  '  );',
  '}',
  '',
  'export default function ValidationPage() {',
  '  return <AuthGate />;',
  '}',
  '',
].join('\n');

content += authGate;

writeFileSync(file, content);
console.log('✅ Saved: ' + file);

// ─── Verify ──────────────────────────────────────────────────────────────────

const leadSourceCount = (content.match(/lead_source/g) || []).length;
const passwordGateCount = (content.match(/PasswordGate/g) || []).length;
console.log(leadSourceCount === 0 ? '✅ All lead_source removed' : '⚠️  ' + leadSourceCount + ' lead_source refs remain');
console.log(passwordGateCount === 0 ? '✅ PasswordGate removed' : '⚠️  ' + passwordGateCount + ' PasswordGate refs remain');

console.log('');
console.log('Done! Changes:');
console.log('  1. Auth route uses existing data/passwords.ts — no env vars needed');
console.log('  2. Everyone logs in with their existing password');
console.log('  3. Trainees (Connie, Cindy, Krishna, Tom) see Process + Create Booking only');
console.log('  4. Senior (Lucas, Felipe, Dylan) + Admin see all 6 tabs');
console.log('  5. Lead Source field removed completely');
console.log('  6. Meeting Date/Time label now says "(Adelaide time)"');
console.log('  7. Session persists in sessionStorage');
console.log('');
console.log('git add . && git commit -m "Role-based validation: use existing passwords, remove lead source" && git push');
