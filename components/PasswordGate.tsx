// components/PasswordGate.tsx

"use client";

import { useState, useEffect } from "react";

interface PasswordGateProps {
  children: React.ReactNode;
  traineeSlug?: string;
  requireMaster?: boolean;
}

const AUTH_STORAGE_KEY = "training-portal-auth";
const AUTH_EXPIRY_HOURS = 24;

interface AuthData {
  password: string;
  timestamp: number;
}

async function validatePassword(
  password: string,
  traineeSlug?: string,
  requireMaster?: boolean
): Promise<{ valid: boolean; expiry?: string }> {
  try {
    const res = await fetch("/api/auth/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, traineeSlug, requireMaster }),
    });
    if (!res.ok) return { valid: false };
    return await res.json();
  } catch {
    return { valid: false };
  }
}

export default function PasswordGate({
  children,
  traineeSlug,
  requireMaster = false,
}: PasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkStoredSession = async () => {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        try {
          const authData: AuthData = JSON.parse(stored);
          const hoursElapsed = (Date.now() - authData.timestamp) / (1000 * 60 * 60);
          if (hoursElapsed < AUTH_EXPIRY_HOURS) {
            const result = await validatePassword(authData.password, traineeSlug, requireMaster);
            if (result.valid) {
              setIsAuthenticated(true);
            } else {
              localStorage.removeItem(AUTH_STORAGE_KEY);
            }
          } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        } catch {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    };
    checkStoredSession();
  }, [traineeSlug, requireMaster]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const result = await validatePassword(password, traineeSlug, requireMaster);
    if (result.valid) {
      const authData: AuthData = { password, timestamp: Date.now() };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      setIsAuthenticated(true);
    } else {
      if (result.expiry) {
        setError(result.expiry);
      } else if (requireMaster) {
        setError("Invalid password. Admin access required.");
      } else {
        setError("Invalid password. Please try again.");
      }
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Training Portal</h1>
          <p className="text-gray-600 mt-2">Enter your password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Enter your password"
              autoFocus
              disabled={isSubmitting}
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Checking...
              </>
            ) : (
              "Access Portal"
            )}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-8">
          Contact your manager if you need access credentials.
        </p>
      </div>
    </div>
  );
}
