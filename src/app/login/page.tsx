"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/lib/hooks";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@acme.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const login = useLogin();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login.mutateAsync({ email, password });
      router.push("/projects");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  const demoUsers = [
    { email: "admin@acme.com", password: "password123", role: "Admin", project: "ACME Corp" },
    { email: "member@acme.com", password: "password123", role: "Member", project: "ACME Corp" },
    { email: "admin@techstart.com", password: "password123", role: "Admin", project: "TechStart" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0 p-4" data-testid="login-page">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-800/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-lg">D</div>
            <span className="text-2xl font-bold text-white">Debales AI</span>
          </div>
          <p className="text-slate-400 text-sm">Multi-tenant AI Assistant Platform</p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-2xl p-8 glow">
          <h1 className="text-xl font-semibold text-white mb-6">Sign in to your workspace</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-2 border border-surface-4 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-2 border border-surface-4 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-medium transition-colors"
            >
              {login.isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Demo users */}
          <div className="mt-6 pt-6 border-t border-surface-4">
            <p className="text-xs text-slate-500 mb-3">Demo accounts (click to fill):</p>
            <div className="space-y-2">
              {demoUsers.map((u) => (
                <button
                  key={u.email}
                  onClick={() => { setEmail(u.email); setPassword(u.password); }}
                  className="w-full text-left bg-surface-2 hover:bg-surface-3 border border-surface-4 rounded-xl px-3 py-2 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white">{u.project}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "Admin" ? "bg-brand-900 text-brand-300" : "bg-surface-4 text-slate-400"}`}>
                      {u.role}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{u.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
