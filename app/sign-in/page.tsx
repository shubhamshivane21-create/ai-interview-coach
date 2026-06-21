"use client";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      window.location.href = "/";
    }
  }, [status]);

  const handleSignIn = async (provider: string) => {
    setLoading(provider);
    await signIn(provider, { callbackUrl: "/" });
  };

  return (
    <main className="min-h-screen bg-[#060809] text-white flex items-center justify-center px-6">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,150,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,150,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div onClick={() => { window.location.href = "/"; }} className="inline-flex items-center gap-3 cursor-pointer group mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all">
              <span className="text-black font-black text-xl">P</span>
            </div>
            <span className="font-black text-2xl tracking-tight">PrepMind <span className="text-emerald-400">AI</span></span>
          </div>
          <h1 className="font-black mb-2" style={{ fontSize: "1.8rem" }}>Welcome back</h1>
          <p className="text-zinc-600 text-sm">Sign in to save your sessions and track progress</p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-3xl border border-white/6 bg-white/2 backdrop-blur-sm">
          {/* Google */}
          <button onClick={() => handleSignIn("google")} disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 transition-all mb-3 disabled:opacity-50 group">
            {loading === "google" ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">
              {loading === "google" ? "Signing in..." : "Continue with Google"}
            </span>
          </button>

          {/* GitHub */}
          <button onClick={() => handleSignIn("github")} disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 transition-all mb-6 disabled:opacity-50 group">
            {loading === "github" ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
            )}
            <span className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">
              {loading === "github" ? "Signing in..." : "Continue with GitHub"}
            </span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[#060809] text-zinc-700 text-xs">or</span>
            </div>
          </div>

          <button onClick={() => { window.location.href = "/upload"; }}
            className="w-full py-3.5 rounded-2xl border border-white/5 text-zinc-600 text-sm hover:text-zinc-300 hover:border-white/10 transition-all font-medium">
            Continue as Guest →
          </button>
        </div>

        <p className="text-center text-zinc-800 text-xs mt-6">
          By signing in you agree to our terms. Sessions saved securely.
        </p>
      </div>
    </main>
  );
}