"use client";
import { useState, useEffect, useRef } from "react";
import { signIn, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";

/* ─── Data ─────────────────────────────────────────────────────────────── */
const AGENTS = [
  { id:"01", icon:"📄", name:"Resume Agent",     desc:"Parses your PDF, extracts skills, projects & experience in real time" },
  { id:"02", icon:"🎯", name:"ATS Agent",         desc:"Scores your resume against ATS systems & detects keyword gaps" },
  { id:"03", icon:"❓", name:"Question Agent",    desc:"Generates 6 personalised interview questions from your background" },
  { id:"04", icon:"🎙️", name:"Interview Agent",   desc:"Manages the live session with dynamic follow-up questions" },
  { id:"05", icon:"📊", name:"Evaluation Agent",  desc:"Scores answers on technical depth, communication & confidence" },
  { id:"06", icon:"🗓️", name:"Study Plan Agent",  desc:"Builds your 7-day roadmap from weak areas with specific resources" },
];

const COMPANIES = [
  { name:"Google",    c:"#4285F4" }, { name:"Amazon",    c:"#FF9900" },
  { name:"Microsoft", c:"#00A4EF" }, { name:"Apple",     c:"#A0A0A0" },
  { name:"Meta",      c:"#0082FB" }, { name:"Netflix",   c:"#E50914" },
  { name:"TCS",       c:"#E84040" }, { name:"Infosys",   c:"#007CC3" },
  { name:"Accenture", c:"#A100FF" }, { name:"Startup",   c:"#10b981" },
];

const FEATURES = [
  { icon:"📄", title:"AI Resume Analysis",    desc:"ATS score, skill gaps, keyword analysis and improvement suggestions in seconds." },
  { icon:"🎯", title:"Company-Specific Prep", desc:"Questions tailored for Google, Amazon, Meta, TCS and 6 more companies." },
  { icon:"📊", title:"3-Axis Scoring",        desc:"Technical depth, communication clarity, and confidence rated independently." },
  { icon:"🎙️", title:"Voice Interview",       desc:"Speak your answers. AI transcribes, scores speaking pace and filler words." },
  { icon:"⚡", title:"Follow-up Questions",   desc:"AI dynamically generates follow-ups based on your previous answer." },
  { icon:"🗓️", title:"7-Day Study Plan",      desc:"Structured daily tasks with specific free resources built from your weak areas." },
];

const OUTPUTS = [
  "ATS Score", "Resume Analysis", "6 AI Questions",
  "3-Axis Scoring", "7-Day Study Plan", "Voice Mode", "Session History",
];

/* ─── Google icon ────────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

/* ─── GitHub icon ────────────────────────────────────────────────────────── */
function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

/* ─── Floating particle ─────────────────────────────────────────────────── */
function Particle({ x, y, size, delay, dur }: { x:number; y:number; size:number; delay:number; dur:number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: size > 3
          ? "rgba(16,185,129,0.5)"
          : "rgba(6,182,212,0.4)",
        boxShadow: `0 0 ${size * 2}px ${size > 3 ? "rgba(16,185,129,0.4)" : "rgba(6,182,212,0.35)"}`,
        animation: `float ${dur}s ease-in-out ${delay}s infinite`,
        pointerEvents: "none",
      }}
    />
  );
}

const PARTICLES = [
  { x:6,  y:18, size:4, delay:0,   dur:5 },
  { x:14, y:62, size:2, delay:1,   dur:4 },
  { x:22, y:38, size:3, delay:0.5, dur:6 },
  { x:78, y:14, size:2, delay:2,   dur:5 },
  { x:88, y:52, size:4, delay:0.3, dur:4 },
  { x:92, y:78, size:2, delay:1.5, dur:6 },
  { x:62, y:72, size:3, delay:0.8, dur:5 },
  { x:44, y:8,  size:2, delay:2.5, dur:4 },
  { x:33, y:88, size:3, delay:1.2, dur:6 },
  { x:72, y:44, size:2, delay:0.7, dur:5 },
];

/* ═══════════════════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const { data: session } = useSession();
  const [activeAgent, setActiveAgent] = useState(0);
  const [mounted, setMounted]         = useState(false);
  const [mouseGlow, setMouseGlow]     = useState({ x: -999, y: -999 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setActiveAgent(a => (a + 1) % AGENTS.length), 2400);
    return () => clearInterval(id);
  }, []);

  function handleMouseMove(e: React.MouseEvent) {
    if (!heroRef.current) return;
    const r = heroRef.current.getBoundingClientRect();
    setMouseGlow({ x: e.clientX - r.left, y: e.clientY - r.top });
  }

  if (!mounted) return null;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)" }}>

      {/* Aurora + grid */}
      <div className="aurora-bg"><div className="aurora-orb" /></div>
      <div className="grid-overlay" />

      {/* Mouse glow */}
      <div
        style={{
          position:"fixed", pointerEvents:"none", zIndex:1,
          width:500, height:500, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)",
          transform:`translate(${mouseGlow.x - 250}px, ${mouseGlow.y - 250}px)`,
          transition:"transform 0.1s ease",
          top:0, left:0,
        }}
      />

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav className="site-nav">
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div className="logo-mark">P</div>
          <span style={{ fontWeight:800, fontSize:18, letterSpacing:"-0.025em" }}>
            PrepMind<span style={{ color:"var(--green)" }}> AI</span>
          </span>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:28 }}>
          {["Features","How it works","Companies"].map(l => (
            <button
              key={l}
              onClick={() => document.getElementById(l.toLowerCase().replace(/ /g,"-"))?.scrollIntoView({ behavior:"smooth" })}
              style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-2)", fontSize:13, fontWeight:500, transition:"color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-2)")}
            >{l}</button>
          ))}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <ThemeToggle />
          {session ? (
            <button className="btn-primary" style={{ padding:"9px 20px", fontSize:13 }}
              onClick={() => { window.location.href="/dashboard"; }}>
              Dashboard →
            </button>
          ) : (
            <>
              <button className="btn-ghost" style={{ padding:"9px 18px", fontSize:13 }}
                onClick={() => signIn("google")}>
                Sign In
              </button>
              <button className="btn-primary" style={{ padding:"9px 20px", fontSize:13 }}
                onClick={() => { window.location.href="/upload"; }}>
                Try Free →
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO + AGENT PIPELINE ─────────────────────────────────────────── */}
      <div
        ref={heroRef}
        onMouseMove={handleMouseMove}
        style={{
          position:"relative", zIndex:1,
          display:"grid",
          gridTemplateColumns:"1fr 400px",
          minHeight:"calc(100vh - 62px)",
          borderBottom:"1px solid var(--border)",
        }}
      >
        {/* Left: hero copy */}
        <div
          style={{
            display:"flex", flexDirection:"column", justifyContent:"center",
            padding:"72px 56px",
            borderRight:"1px solid var(--border)",
            position:"relative", overflow:"hidden",
          }}
        >
          {/* Particles */}
          {PARTICLES.map((p,i) => <Particle key={i} {...p} />)}

          {/* Badge */}
          <div
            className="badge badge-green anim-fade-up"
            style={{ alignSelf:"flex-start", marginBottom:24 }}
          >
            <span className="live-dot" />
            <span className="label-accent">Powered by Gemini 2.0 Flash</span>
          </div>

          {/* Headline */}
          <h1
            className="anim-fade-up d1"
            style={{
              fontWeight:900,
              fontSize:"clamp(40px, 5.5vw, 68px)",
              lineHeight:1.05,
              letterSpacing:"-0.04em",
              marginBottom:22,
            }}
          >
            Land your dream<br />
            <span className="gradient-text text-glow">tech interview.</span>
          </h1>

          {/* Sub */}
          <p
            className="anim-fade-up d2"
            style={{ color:"var(--text-2)", fontSize:17, lineHeight:1.75, maxWidth:500, marginBottom:40 }}
          >
            Upload your resume. Our 6-agent AI system generates personalised
            questions, evaluates every answer, and delivers a complete study
            roadmap — all in under 2 minutes.
          </p>

          {/* CTA buttons */}
          <div className="anim-fade-up d3" style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:44 }}>
            <button
              className="btn-primary"
              style={{ padding:"15px 32px", fontSize:15 }}
              onClick={() => { window.location.href="/upload"; }}
            >
              Start Interview Free →
            </button>
            <button
              className="btn-ghost"
              style={{ padding:"15px 22px", fontSize:14 }}
              onClick={() => signIn("google")}
            >
              <GoogleIcon /> Sign in with Google
            </button>
            <button
              className="btn-ghost"
              style={{ padding:"15px 22px", fontSize:14 }}
              onClick={() => signIn("github")}
            >
              <GitHubIcon /> GitHub
            </button>
          </div>

          {/* Output tags */}
          <div className="anim-fade-up d4">
            <p className="label-mono" style={{ marginBottom:12 }}>What you receive</p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {OUTPUTS.map(o => (
                <span key={o} className="badge badge-green" style={{ fontSize:11 }}>
                  · {o}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: agent pipeline */}
        <div
          style={{
            display:"flex", flexDirection:"column", justifyContent:"center",
            padding:"40px 28px",
            background:"var(--glass-inner)",
            borderLeft:"1px solid var(--border)",
          }}
        >
          <p className="label-mono" style={{ marginBottom:6 }}>AI Agent Pipeline</p>
          <p style={{ color:"var(--text-3)", fontSize:11, marginBottom:20, fontFamily:"'JetBrains Mono',monospace" }}>
            Sequential execution · Real-time streaming
          </p>

          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {AGENTS.map((a, i) => (
              <div
                key={a.id}
                style={{
                  padding:"14px 16px",
                  borderRadius:14,
                  background: activeAgent===i ? "var(--green-dim)" : "transparent",
                  border:`1px solid ${activeAgent===i ? "var(--green-border)" : "var(--border)"}`,
                  transition:"all 0.35s cubic-bezier(0.16,1,0.3,1)",
                  cursor:"default",
                }}
              >
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span
                    className="label-mono"
                    style={{ color: activeAgent===i ? "var(--green)" : "var(--text-3)", minWidth:22, transition:"color 0.35s" }}
                  >{a.id}</span>
                  <span style={{ fontSize:16, flexShrink:0 }}>{a.icon}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div
                      style={{
                        fontSize:13, fontWeight:700,
                        color: activeAgent===i ? "var(--text)" : "var(--text-2)",
                        marginBottom:2, transition:"color 0.35s",
                      }}
                    >{a.name}</div>
                    <div
                      style={{
                        fontSize:11, color:"var(--text-3)", lineHeight:1.5,
                        maxHeight: activeAgent===i ? 40 : 0,
                        overflow:"hidden",
                        transition:"max-height 0.4s ease",
                      }}
                    >{a.desc}</div>
                  </div>
                  {activeAgent===i && <span className="live-dot" style={{ flexShrink:0 }} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section
        id="features"
        style={{ position:"relative", zIndex:1, padding:"96px 56px", maxWidth:1200, margin:"0 auto" }}
      >
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <p className="label-accent" style={{ marginBottom:12 }}>Features</p>
          <h2
            style={{
              fontWeight:900,
              fontSize:"clamp(28px,4vw,46px)",
              letterSpacing:"-0.035em",
              marginBottom:16,
            }}
          >
            Everything you need to get{" "}
            <span className="gradient-text">hired</span>
          </h2>
          <p style={{ color:"var(--text-2)", maxWidth:480, margin:"0 auto", fontSize:15, lineHeight:1.75 }}>
            Built for engineering students targeting top tech companies. Not a generic quiz app.
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px,1fr))", gap:20 }}>
          {FEATURES.map((f,i) => (
            <div
              key={f.title}
              className={`glass-card lift anim-fade-up d${i+1}`}
              style={{ padding:"24px 22px" }}
            >
              <div style={{ fontSize:28, marginBottom:14 }}>{f.icon}</div>
              <h3 style={{ fontWeight:700, fontSize:15, marginBottom:8 }}>{f.title}</h3>
              <p style={{ color:"var(--text-2)", fontSize:13, lineHeight:1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          position:"relative", zIndex:1,
          padding:"80px 56px",
          background:"var(--glass-inner)",
          borderTop:"1px solid var(--border)",
          borderBottom:"1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <p className="label-accent" style={{ marginBottom:12 }}>How it works</p>
            <h2
              style={{ fontWeight:900, fontSize:"clamp(26px,4vw,42px)", letterSpacing:"-0.03em" }}
            >
              Resume to results in{" "}
              <span className="gradient-text">3 steps</span>
            </h2>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:32 }}>
            {[
              { n:"01", icon:"📄", title:"Upload Resume",      desc:"Drop your PDF. Gemini parses it live — skills, projects and experience extracted in seconds." },
              { n:"02", icon:"🎙️", title:"Answer 6 Questions", desc:"AI-personalised questions with 2-minute timer per question and voice input supported." },
              { n:"03", icon:"📊", title:"Get Your Results",   desc:"Scores, AI feedback, STAR analysis, 7-day study plan and session history saved to your account." },
            ].map((s,i) => (
              <div
                key={s.n}
                className={`anim-fade-up d${i+1}`}
                style={{ textAlign:"center", padding:"28px 16px" }}
              >
                <div
                  style={{
                    width:56, height:56, borderRadius:18, margin:"0 auto 18px",
                    background:"var(--green-dim)",
                    border:"1px solid var(--green-border)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:24,
                  }}
                >{s.icon}</div>
                <div className="label-accent" style={{ marginBottom:8 }}>Step {s.n}</div>
                <h3 style={{ fontWeight:700, fontSize:16, marginBottom:10 }}>{s.title}</h3>
                <p style={{ color:"var(--text-2)", fontSize:13, lineHeight:1.75 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPANIES ────────────────────────────────────────────────────── */}
      <section
        id="companies"
        style={{ position:"relative", zIndex:1, padding:"72px 56px", maxWidth:1000, margin:"0 auto", textAlign:"center" }}
      >
        <p className="label-mono" style={{ marginBottom:20 }}>Practice for these companies</p>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
          {COMPANIES.map(c => (
            <span
              key={c.name}
              className="badge"
              style={{
                background:`${c.c}12`,
                border:`1px solid ${c.c}28`,
                color:c.c,
                padding:"8px 18px",
                fontSize:13,
                fontWeight:700,
              }}
            >
              {c.name}
            </span>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          position:"relative", zIndex:1,
          padding:"80px 40px",
          textAlign:"center",
          borderTop:"1px solid var(--border)",
          background:"var(--glass-inner)",
        }}
      >
        <h2
          style={{ fontWeight:900, fontSize:"clamp(26px,4vw,46px)", letterSpacing:"-0.03em", marginBottom:18 }}
        >
          Ready to <span className="gradient-text">ace your interview?</span>
        </h2>
        <p style={{ color:"var(--text-2)", fontSize:15, marginBottom:36 }}>
          No sign-up required. Upload your resume and start practising in 30 seconds.
        </p>
        <button
          className="btn-primary"
          style={{ padding:"16px 44px", fontSize:16 }}
          onClick={() => { window.location.href="/upload"; }}
        >
          Start Free Interview →
        </button>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        style={{
          position:"relative", zIndex:1,
          padding:"24px 40px",
          borderTop:"1px solid var(--border)",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          flexWrap:"wrap", gap:12,
        }}
      >
        <span style={{ fontWeight:800, fontSize:15 }}>
          PrepMind <span style={{ color:"var(--green)" }}>AI</span>
        </span>
        <span className="label-mono">
          Built with Gemini 2.0 Flash · Next.js · MongoDB
        </span>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}