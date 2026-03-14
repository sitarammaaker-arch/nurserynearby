"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AdminLoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const from         = searchParams.get("from") ?? "/admin";

  const [password,  setPassword]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [attempts,  setAttempts]  = useState(0);
  const [showPw,    setShowPw]    = useState(false);
  const [locked,    setLocked]    = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!locked) return;
    setCountdown(60);
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(t); setLocked(false); setAttempts(0); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [locked]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locked || loading) return;
    setLoading(true);
    setError("");

    try {
      const res  = await fetch("/api/admin-login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        const next = attempts + 1;
        setAttempts(next);
        if (next >= 5) {
          setLocked(true);
          setError("Too many failed attempts. Locked for 60 seconds.");
        } else {
          setError(`${data.error} (${5 - next} attempts remaining)`);
        }
        setPassword("");
        return;
      }

      router.push(from);
      router.refresh();
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen gradient-sage flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 gradient-forest rounded-2xl flex items-center justify-center shadow-green group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2 6-4 8-3 8-3-4 0-6 1-6 1 4-4 3-3 6-3C18 1 12 1 8 6c0 0 1-4 6-4C8 0 7 7 7 7c-1 0-2-1-2-1C7 10 9 12 9 12c-2 0-3-2-3-2 0 4 4 5 4 5-2 0-3-1-3-1 1 3 5 4 5 4-2-1-4-1-4-1 2 2 6 2 6 2-4 1-7-1-7-1C5 22 9 22 9 22c4 0 8-4 8-14z"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="font-display font-bold text-xl text-forest-900 leading-none">NurseryNearby</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Admin Panel</p>
            </div>
          </Link>
          <h1 className="font-display text-3xl font-bold text-forest-900 mb-1">Admin Login</h1>
          <p className="text-gray-500 text-sm">Enter your admin password to continue</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-lifted">

          {locked && (
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">🔒</div>
              <p className="font-semibold text-red-700 text-sm">Account temporarily locked</p>
              <p className="text-red-500 text-xs mt-1">Try again in <span className="font-bold">{countdown}s</span></p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Admin Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="input-lg pr-12"
                  required
                  autoFocus
                  disabled={locked}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  tabIndex={-1}>
                  {showPw
                    ? <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
                    : <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                  }
                </button>
              </div>
            </div>

            {error && !locked && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-red-500 shrink-0">⚠️</span>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading || locked || !password}
              className="btn btn-primary w-full justify-center btn-lg disabled:opacity-50">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
                  </svg>
                  Verifying…
                </span>
              ) : locked ? `🔒 Locked (${countdown}s)` : (
                <>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                  Sign In to Admin
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          <Link href="/" className="hover:text-forest transition-colors">← Back to NurseryNearby</Link>
        </p>
      </div>
    </div>
  );
}
