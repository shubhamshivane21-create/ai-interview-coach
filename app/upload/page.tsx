"use client";
import { useState, useRef, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

/* ─── Data ──────────────────────────────────────────────────────────────── */
const COMPANIES = [
  { id:"google",    label:"Google",    color:"#4285F4", icon:"🔵" },
  { id:"amazon",    label:"Amazon",    color:"#FF9900", icon:"🟠" },
  { id:"microsoft", label:"Microsoft", color:"#00A4EF", icon:"🔷" },
  { id:"apple",     label:"Apple",     color:"#A0A0A0", icon:"⚪" },
  { id:"meta",      label:"Meta",      color:"#0082FB", icon:"🔹" },
  { id:"netflix",   label:"Netflix",   color:"#E50914", icon:"🔴" },
  { id:"tcs",       label:"TCS",       color:"#E84040", icon:"🏢" },
  { id:"infosys",   label:"Infosys",   color:"#007CC3", icon:"💼" },
  { id:"accenture", label:"Accenture", color:"#A100FF", icon:"🟣" },
  { id:"startup",   label:"Startup",   color:"#10b981", icon:"🚀" },
  { id:"general",   label:"General",   color:"#64748b", icon:"⭐" },
];

const DIFFICULTIES = [
  { id:"easy",   label:"Easy",   desc:"Fresher / Entry level",   color:"#10b981" },
  { id:"medium", label:"Medium", desc:"1–3 years experience",     color:"#f59e0b" },
  { id:"hard",   label:"Hard",   desc:"3–5 years experience",     color:"#f97316" },
  { id:"expert", label:"Expert", desc:"5+ years / Senior",        color:"#ef4444" },
];

const LOG_LINES = [
  { t:"info",    msg:"Reading PDF bytes…" },
  { t:"step",    msg:"Sending to Gemini 2.0 Flash…" },
  { t:"info",    msg:"Extracting candidate name & contact details…" },
  { t:"info",    msg:"Detecting technical skills stack…" },
  { t:"success", msg:"Skills extracted successfully…" },
  { t:"info",    msg:"Parsing projects & experience…" },
  { t:"step",    msg:"Building structured candidate profile…" },
  { t:"success", msg:"Resume analysis complete ✓" },
  { t:"step",    msg:"Routing to Question Generator Agent…" },
];

const LOG_COLORS: Record<string, string> = {
  info:"var(--text-2)", success:"var(--green)", step:"var(--cyan)",
};
const LOG_PREFIX: Record<string, string> = {
  info:"·", success:"✓", step:"→",
};

/* ─── Resume icon SVG ────────────────────────────────────────────────────── */
function ResumeIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <rect x="8" y="4" width="32" height="42" rx="4" fill="var(--glass-inner)" stroke="var(--border-2)" strokeWidth="1.5"/>
      <rect x="8" y="4" width="32" height="42" rx="4" fill="url(#resumeGrad)" fillOpacity="0.3"/>
      <line x1="16" y1="18" x2="36" y2="18" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="24" x2="36" y2="24" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="30" x2="30" y2="30" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="36" x2="28" y2="36" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round"/>
      <defs>
        <linearGradient id="resumeGrad" x1="8" y1="4" x2="40" y2="46">
          <stop stopColor="#10b981"/>
          <stop offset="1" stopColor="#06b6d4"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="26" r="22" fill="var(--green-dim)" stroke="var(--green-border)" strokeWidth="1.5"/>
      <path d="M16 26l7 7 13-14" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function UploadPage() {
  const [file, setFile]               = useState<File | null>(null);
  const [dragging, setDragging]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [stepIdx, setStepIdx]         = useState(0);
  const [logs, setLogs]               = useState<typeof LOG_LINES>([]);
  const [cursor, setCursor]           = useState(true);
  const [company, setCompany]         = useState("google");
  const [difficulty, setDifficulty]   = useState("medium");
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const [showSkills, setShowSkills]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  function handleFile(f: File) {
    if (f.type !== "application/pdf") { setError("Please upload a PDF file only."); return; }
    if (f.size > 10 * 1024 * 1024)   { setError("File must be under 10 MB."); return; }
    setFile(f); setError(""); setShowSkills(false);
  }

  function streamProgress() {
    const stepTimes = [300, 900, 1500, 2100, 2700];
    stepTimes.forEach((t, i) => setTimeout(() => setStepIdx(i + 1), t));
    const lineTimes = [200, 500, 700, 1000, 1300, 1700, 2100, 2500, 2900];
    lineTimes.forEach((t, i) => {
      setTimeout(() => setLogs(prev => [...prev, LOG_LINES[i]]), t);
    });
  }

  async function handleUpload() {
    if (!file) return;
    setLoading(true); setError(""); setLogs([]); setStepIdx(1);
    streamProgress();

    // Save preferences for the interview page
    localStorage.setItem("pm-company",    company);
    localStorage.setItem("pm-difficulty", difficulty);

    try {
      const fd = new FormData();
      fd.append("resume", file);
      fd.append("company",    company);
      fd.append("difficulty", difficulty);

      const res  = await fetch("/api/resume", { method: "POST", body: fd });
      const data = await res.json();

      if (data.sessionId) {
        // Extract skills to show preview
        try {
          const parsed = JSON.parse(data.resumeText || "{}");
          if (parsed.skills?.length) setResumeSkills(parsed.skills.slice(0, 8));
        } catch {}
        setTimeout(() => { window.location.href = `/interview?sessionId=${data.sessionId}`; }, 3400);
      } else {
        setError(data.error || "Failed to process resume. Please try again.");
        setLoading(false); setStepIdx(0);
      }
    } catch {
      setError("Network error. Check your connection and try again.");
      setLoading(false); setStepIdx(0);
    }
  }

  const selectedCompany    = COMPANIES.find(c => c.id === company)!;
  const selectedDifficulty = DIFFICULTIES.find(d => d.id === difficulty)!;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)" }}>
      <div className="aurora-bg"><div className="aurora-orb"/></div>
      <div className="grid-overlay"/>

      {/* NAV */}
      <nav className="site-nav">
        <button onClick={() => { window.location.href="/"; }}
          style={{ display:"flex", alignItems:"center", gap:10, background:"none", border:"none", cursor:"pointer", color:"var(--text)" }}>
          <div className="logo-mark">P</div>
          <span style={{ fontWeight:800, fontSize:17, letterSpacing:"-0.025em" }}>
            PrepMind<span style={{ color:"var(--green)" }}> AI</span>
          </span>
        </button>

        {/* Step tracker */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {[
            { n:1, label:"Setup" },
            { n:2, label:"Interview" },
            { n:3, label:"Results" },
          ].map((s, i) => (
            <div key={s.n} style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div style={{
                  width:26, height:26, borderRadius:"50%",
                  background: s.n === 1 ? "var(--green)" : "var(--glass-inner)",
                  border:`1px solid ${s.n === 1 ? "var(--green)" : "var(--border)"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700,
                  color: s.n === 1 ? "#000" : "var(--text-3)",
                  boxShadow: s.n === 1 ? "0 0 14px var(--green-glow)" : "none",
                }}>{s.n}</div>
                <span style={{ fontSize:12, fontWeight:600, color: s.n === 1 ? "var(--text)" : "var(--text-3)" }}>
                  {s.label}
                </span>
              </div>
              {i < 2 && <div style={{ width:36, height:1, background:"var(--border)" }}/>}
            </div>
          ))}
        </div>

        <ThemeToggle />
      </nav>

      {/* MAIN */}
      <div style={{
        position:"relative", zIndex:1,
        maxWidth:640, margin:"0 auto",
        padding:"44px 24px 80px",
        display:"flex", flexDirection:"column", gap:22,
      }}>

        {/* Header */}
        <div className="anim-fade-up" style={{ textAlign:"center" }}>
          <div className="badge badge-green" style={{ display:"inline-flex", marginBottom:16 }}>
            <span className="live-dot"/>
            <span className="label-accent">Step 1 of 3 — Setup</span>
          </div>
          <h1 style={{ fontWeight:900, fontSize:"clamp(28px,5vw,42px)", letterSpacing:"-0.035em", marginBottom:10 }}>
            Upload Your <span className="gradient-text">Resume</span>
          </h1>
          <p style={{ color:"var(--text-2)", fontSize:14, lineHeight:1.75 }}>
            Choose your target company and difficulty, then upload your PDF.
            PreMind AI will personalise every question to your background.
          </p>
        </div>

        {/* Company selector */}
        {!loading && (
          <div className="anim-fade-up glass-card" style={{ padding:"20px 22px" }}>
            <p className="label-mono" style={{ marginBottom:14 }}>🏢 Target Company</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(100px, 1fr))", gap:8 }}>
              {COMPANIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCompany(c.id)}
                  style={{
                    padding:"8px 10px",
                    borderRadius:10,
                    border:`1px solid ${company === c.id ? c.color : "var(--border)"}`,
                    background: company === c.id ? `${c.color}15` : "var(--glass-inner)",
                    color: company === c.id ? c.color : "var(--text-2)",
                    fontSize:12, fontWeight:600, cursor:"pointer",
                    transition:"all 0.15s ease",
                    fontFamily:"'Inter',sans-serif",
                    boxShadow: company === c.id ? `0 0 12px ${c.color}30` : "none",
                  }}
                >
                  <div style={{ fontSize:16, marginBottom:3 }}>{c.icon}</div>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty selector */}
        {!loading && (
          <div className="anim-fade-up glass-card" style={{ padding:"20px 22px" }}>
            <p className="label-mono" style={{ marginBottom:14 }}>⚡ Difficulty Level</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
              {DIFFICULTIES.map(d => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  style={{
                    padding:"12px 8px",
                    borderRadius:12,
                    border:`1px solid ${difficulty === d.id ? d.color : "var(--border)"}`,
                    background: difficulty === d.id ? `${d.color}15` : "var(--glass-inner)",
                    color: difficulty === d.id ? d.color : "var(--text-2)",
                    cursor:"pointer",
                    transition:"all 0.15s ease",
                    fontFamily:"'Inter',sans-serif",
                    boxShadow: difficulty === d.id ? `0 0 14px ${d.color}30` : "none",
                    textAlign:"center",
                  }}
                >
                  <div style={{ fontWeight:700, fontSize:13, marginBottom:3 }}>{d.label}</div>
                  <div style={{ fontSize:10, color: difficulty === d.id ? d.color : "var(--text-3)", lineHeight:1.4 }}>{d.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Drop zone */}
        {!loading && (
          <div
            className="anim-fade-up glass-card scan-wrapper"
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
              e.preventDefault(); setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            style={{
              padding:"40px 32px",
              textAlign:"center",
              cursor:"pointer",
              border:`2px dashed ${dragging ? "var(--green)" : file ? "var(--green-border)" : "var(--border-2)"}`,
              background: dragging ? "var(--green-dim)" : file ? "rgba(16,185,129,0.03)" : "transparent",
              boxShadow: dragging ? "0 0 40px var(--green-glow)" : "none",
              transition:"all 0.2s ease",
              borderRadius:20,
            }}
          >
            {file && <div className="scan-line"/>}
            <input ref={inputRef} type="file" accept=".pdf" style={{ display:"none" }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}/>

            <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
              {file ? <CheckIcon /> : <ResumeIcon />}
            </div>

            {file ? (
              <>
                <p style={{ fontWeight:700, color:"var(--green)", marginBottom:4, fontSize:15 }}>{file.name}</p>
                <p style={{ color:"var(--text-3)", fontSize:12 }}>
                  {(file.size/1024).toFixed(1)} KB · Click to change file
                </p>
              </>
            ) : (
              <>
                <p style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>Drop your resume here</p>
                <p style={{ color:"var(--text-3)", fontSize:13 }}>PDF only · Max 10 MB</p>
              </>
            )}
          </div>
        )}

        {/* Selected config summary */}
        {!loading && file && (
          <div className="anim-fade-in glass-green" style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:18 }}>{selectedCompany.icon}</span>
              <div>
                <p className="label-mono" style={{ marginBottom:2 }}>Company</p>
                <p style={{ fontWeight:700, fontSize:13, color:selectedCompany.color }}>{selectedCompany.label}</p>
              </div>
            </div>
            <div style={{ width:1, height:36, background:"var(--border)" }}/>
            <div>
              <p className="label-mono" style={{ marginBottom:2 }}>Difficulty</p>
              <p style={{ fontWeight:700, fontSize:13, color:selectedDifficulty.color }}>{selectedDifficulty.label}</p>
            </div>
            <div style={{ width:1, height:36, background:"var(--border)" }}/>
            <div>
              <p className="label-mono" style={{ marginBottom:2 }}>Questions</p>
              <p style={{ fontWeight:700, fontSize:13, color:"var(--cyan)" }}>6 AI-personalised</p>
            </div>
          </div>
        )}

        {/* Loading: step progress + live log */}
        {loading && (
          <div className="anim-fade-in" style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div className="glass-card" style={{ padding:"20px 24px" }}>
              {/* Company + difficulty badges */}
              <div style={{ display:"flex", gap:10, marginBottom:18 }}>
                <span className="badge" style={{ background:`${selectedCompany.color}15`, border:`1px solid ${selectedCompany.color}30`, color:selectedCompany.color }}>
                  {selectedCompany.icon} {selectedCompany.label}
                </span>
                <span className="badge" style={{ background:`${selectedDifficulty.color}15`, border:`1px solid ${selectedDifficulty.color}30`, color:selectedDifficulty.color }}>
                  {selectedDifficulty.label}
                </span>
              </div>

              {/* Steps */}
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {[
                  { label:"Upload Resume",       icon:"📄" },
                  { label:"Scanning Resume",      icon:"🔍" },
                  { label:"Extracting Skills",    icon:"⚡" },
                  { label:"Analysing Experience", icon:"💼" },
                  { label:"Generating Interview", icon:"🤖" },
                  { label:"Ready!",              icon:"✅" },
                ].map((s, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 0" }}>
                    <div style={{
                      width:34, height:34, borderRadius:"50%", flexShrink:0,
                      background: i <= stepIdx ? "var(--green-dim)" : "var(--glass-inner)",
                      border:`1px solid ${i <= stepIdx ? "var(--green-border)" : "var(--border)"}`,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
                      boxShadow: i === stepIdx ? "0 0 16px var(--green-glow)" : "none",
                      transition:"all 0.4s ease",
                    }}>
                      {i < stepIdx ? "✓" : s.icon}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color: i <= stepIdx ? "var(--text)" : "var(--text-3)", transition:"color 0.4s" }}>
                        {s.label}
                      </div>
                    </div>
                    {i === stepIdx && (
                      <svg className="anim-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(16,185,129,0.2)" strokeWidth="3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--green)" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>

              <div className="progress-track" style={{ marginTop:16 }}>
                <div className="progress-fill" style={{ width:`${(stepIdx/5)*100}%` }}/>
              </div>
            </div>

            {/* Live log */}
            <div className="log-terminal anim-fade-in">
              <div className="log-terminal-bar">
                <div className="log-dot" style={{ background:"#ff5f56" }}/>
                <div className="log-dot" style={{ background:"#ffbd2e" }}/>
                <div className="log-dot" style={{ background:"var(--green)" }}/>
                <span className="label-mono" style={{ marginLeft:8 }}>Gemini AI Processing</span>
                <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
                  <span className="live-dot"/>
                  <span className="label-accent">LIVE</span>
                </div>
              </div>
              <div ref={logRef} style={{ padding:"14px 16px", minHeight:120, maxHeight:160, overflowY:"auto", display:"flex", flexDirection:"column", gap:3 }}>
                {logs.map((l, i) => (
                  <div key={i} className="anim-fade-in" style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, lineHeight:1.7, color:LOG_COLORS[l.t], display:"flex", gap:8 }}>
                    <span style={{ opacity:0.5, flexShrink:0 }}>{LOG_PREFIX[l.t]}</span>
                    <span>{l.msg}</span>
                  </div>
                ))}
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"var(--green)", opacity:cursor?1:0, transition:"opacity 0.1s" }}>█</div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="anim-fade-in" style={{ padding:"12px 16px", borderRadius:12, background:"var(--red-dim)", border:"1px solid rgba(248,113,113,0.25)", color:"var(--red)", fontSize:13, display:"flex", gap:8 }}>
            <span>⚠</span><span>{error}</span>
          </div>
        )}

        {/* CTA */}
        {!loading && (
          <button
            className="btn-primary anim-fade-up"
            onClick={handleUpload}
            disabled={!file}
            style={{ width:"100%", padding:"16px", fontSize:15, borderRadius:16 }}
          >
            {file
              ? `Start ${selectedCompany.label} Interview (${selectedDifficulty.label}) →`
              : "Select a PDF to continue"}
          </button>
        )}

        <p className="label-mono" style={{ textAlign:"center" }}>
          Your resume is processed securely · Never stored permanently
        </p>
      </div>
    </div>
  );
}