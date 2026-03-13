"use client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen gradient-sage flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 gradient-forest rounded-2xl flex items-center justify-center shadow-green">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2 6-4 8-3 8-3-4 0-6 1-6 1 4-4 3-3 6-3C18 1 12 1 8 6c0 0 1-4 6-4C8 0 7 7 7 7c-1 0-2-1-2-1C7 10 9 12 9 12c-2 0-3-2-3-2 0 4 4 5 4 5-2 0-3-1-3-1 1 3 5 4 5 4-2-1-4-1-4-1 2 2 6 2 6 2-4 1-7-1-7-1C5 22 9 22 9 22c4 0 8-4 8-14z"/>
              </svg>
            </div>
            <div>
              <span className="font-display font-bold text-2xl text-forest-900 block">NurseryNearby</span>
              <span className="text-xs text-gray-500 uppercase tracking-widest">Owner Portal</span>
            </div>
          </Link>
          <h1 className="font-display text-3xl font-bold text-forest-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm">Sign in to manage your nursery listings</p>
        </div>

        <div className="card p-8 shadow-lifted">
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setLoading(true); setTimeout(() => setLoading(false), 1500); }}>
            <div>
              <label className="label">Email Address</label>
              <input type="email" required value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com" className="input-lg" autoComplete="email"/>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label m-0">Password</label>
                <a href="/forgot-password" className="text-xs text-forest hover:underline">Forgot password?</a>
              </div>
              <input type="password" required value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••" className="input-lg" autoComplete="current-password"/>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center btn-lg disabled:opacity-60">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"/></div>
            <div className="relative text-center"><span className="bg-white px-3 text-xs text-gray-400">or</span></div>
          </div>

          <div className="flex gap-3">
            <Link href="/admin" className="flex-1 btn btn-secondary justify-center text-sm">
              🔐 Admin Panel
            </Link>
            <Link href="/add-listing" className="flex-1 btn btn-outline justify-center text-sm">
              ➕ List Nursery
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          New nursery owner?{" "}
          <Link href="/add-listing" className="text-forest font-semibold hover:underline">List for free →</Link>
        </p>
      </div>
    </div>
  );
}
