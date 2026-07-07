'use client';

import { useState, useEffect, ReactNode } from 'react';

const CREDENTIALS: Record<string, string> = {
  '0202':        'Admin',
  'DMunro0202!': 'Dylan Munro',
  'TRennie0202!':'Thomas Rennie',
  'LTirri0202!': 'Lucas Tirri',
  'FGarcia0202!':'Felipe Garcia',
  'RKerrison0202!':'Riley Kerrison',
};

const STORAGE_KEY = 'pipeline_auth_user';

export function usePipelineAuth() {
  const [authedUser, setAuthedUser] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setAuthedUser(stored);
    setChecked(true);
  }, []);

  function login(password: string): boolean {
    const user = CREDENTIALS[password.trim()];
    if (user) {
      localStorage.setItem(STORAGE_KEY, user);
      setAuthedUser(user);
      return true;
    }
    return false;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setAuthedUser(null);
  }

  return { authedUser, checked, login, logout };
}

export default function PipelineAuth({ children }: { children: ReactNode }) {
  const { authedUser, checked, login, logout } = usePipelineAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  function handleSubmit() {
    const ok = login(password);
    if (!ok) {
      setError(true);
      setShaking(true);
      setPassword('');
      setTimeout(() => setShaking(false), 500);
    }
  }

  if (!checked) return null;

  if (!authedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4f6f9' }}>
        <div
          className="bg-white rounded-2xl border-2 p-8 w-full max-w-sm flex flex-col gap-5 shadow-sm transition-all"
          style={{
            borderColor: error ? '#fca5a5' : '#e5e7eb',
            animation: shaking ? 'shake 0.4s ease' : 'none',
          }}
        >
          <style>{`
            @keyframes shake {
              0%,100% { transform: translateX(0); }
              20% { transform: translateX(-8px); }
              40% { transform: translateX(8px); }
              60% { transform: translateX(-6px); }
              80% { transform: translateX(6px); }
            }
          `}</style>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Marketing Sweet</div>
            <h1 className="text-2xl font-black text-gray-900 mt-1">Sales Pipeline</h1>
            <p className="text-sm text-gray-500 mt-1">Enter your password to continue</p>
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Password"
              autoFocus
              className="border-2 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition-all"
              style={{ borderColor: error ? '#fca5a5' : '#e5e7eb' }}
            />
            {error && (
              <p className="text-xs text-red-500 font-semibold text-center">Incorrect password — try again</p>
            )}
            <button
              onClick={handleSubmit}
              className="w-full rounded-xl py-3 text-sm font-black text-white transition-all mt-1"
              style={{ background: '#f97316' }}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Inject authed user + logout into page via context-free prop drilling isn't needed —
          pages can call usePipelineAuth() directly to get authedUser/logout */}
      {children}
    </>
  );
}
