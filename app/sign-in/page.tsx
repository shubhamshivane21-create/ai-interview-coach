"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

export default function SignInPage() {
  const [loading, setLoading] = useState<"google"|"github"|null>(null);

  async function handle(provider: "google"|"github") {
    setLoading(provider);
    await signIn(provider, { callbackUrl:"/dashboard" });
  }

  return (
    <div
      style={{
        minHeight:"100vh", background:"var(--bg)", color:"var(--text)",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      }}
    >
      <div className="aurora-bg"><div className="aurora-orb" /></div>
      <div className="grid-overlay" />

      {/* Nav */}
      <nav className="site-nav" style={{ position:"fixed", top:0, left:0, right:0 }}>
        <button
          onClick={() => { window.location.href = "/"; }}
          style={{ display:"flex", alignItems:"center", gap:10, background:"none", border:"none", cursor:"pointer", color:"var(--text)" }}
        >
          <div className="logo-mark">P</div>
          <span style={{ fontWeight:800, fontSize:17 }}>PrepMind<span style={{ color:"var(--green)" }}> AI</span></span>
        </button>
        <ThemeToggle />
      </nav>

      {/* Card */}
      <div
        className="glass-card anim-scale-in"
        style={{ position:"relative", zIndex:1, width:"100%", maxWidth:420, padding:"0 24px" }}
      >
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div
            className="logo-mark"
            style={{ margin:"0 auto 14px", width:52, height:52, borderRadius:14, fontSize:22 }}
          >P</div>
          <h1 style={{ fontWeight:900, fontSize:26, letterSpacing:"-0.03em", marginBottom:6 }}>
            PrepMind<span style={{ color:"var(--green)" }}> AI</span>
          </h1>
          <p style={{ color:"var(--text-2)", fontSize:14 }}>
            Sign in to save your progress and interview history
          </p>
        </div>

        {/* Auth buttons */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <button
            onClick={() => handle("google")}
            disabled={loading !== null}
            style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"14px 20px", borderRadius:14,
              fontWeight:700, fontSize:14, cursor:"pointer",
              background:"#fff", color:"#1a1a1a", border:"none",
              opacity: loading === "github" ? 0.5 : 1,
              transition:"all 0.15s",
              boxShadow:"0 2px 12px rgba(0,0,0,0.25)",
              fontFamily:"'Inter',sans-serif",
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; }}
          >
            {loading === "google" ? (
              <svg className="anim-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.15)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            ) : <GoogleIcon />}
            Continue with Google
          </button>

          <button
            onClick={() => handle("github")}
            disabled={loading !== null}
            style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"14px 20px", borderRadius:14,
              fontWeight:700, fontSize:14, cursor:"pointer",
              background:"#24292e", color:"#fff",
              border:"1px solid rgba(255,255,255,0.1)",
              opacity: loading === "google" ? 0.5 : 1,
              transition:"all 0.15s",
              fontFamily:"'Inter',sans-serif",
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; }}
          >
            {loading === "github" ? (
              <svg className="anim-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            ) : <GitHubIcon />}
            Continue with GitHub
          </button>
        </div>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0" }}>
          <div style={{ flex:1, height:1, background:"var(--border)" }} />
          <span className="label-mono">or</span>
          <div style={{ flex:1, height:1, background:"var(--border)" }} />
        </div>

        {/* Guest */}
        <button
          className="btn-ghost"
          style={{ width:"100%", justifyContent:"center", padding:"12px" }}
          onClick={() => { window.location.href = "/upload"; }}
        >
          Continue as Guest (no history saved)
        </button>

        {/* Benefits */}
        <div style={{ marginTop:24, display:"flex", flexDirection:"column", gap:8 }}>
          {[
            "📊 Track your scores across every interview",
            "📚 Access your 7-day study plan anytime",
            "📈 See your improvement over time",
          ].map(b => (
            <div
              key={b}
              style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"10px 14px", borderRadius:10,
                background:"var(--glass-inner)",
              }}
            >
              <span style={{ fontSize:14 }}>{b.split(" ")[0]}</span>
              <span style={{ fontSize:12, color:"var(--text-2)" }}>{b.split(" ").slice(1).join(" ")}</span>
            </div>
          ))}
        </div>

        <p className="label-mono" style={{ textAlign:"center", marginTop:20 }}>
          By signing in you agree to our Terms &amp; Privacy Policy
        </p>
      </div>
    </div>
  );
}