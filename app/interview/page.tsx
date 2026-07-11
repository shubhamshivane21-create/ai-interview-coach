"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

const COMPANY_COLORS: Record<string, string> = {
  google:"#4285F4", amazon:"#FF9900", microsoft:"#00A4EF",
  apple:"#A0A0A0", meta:"#0082FB", netflix:"#E50914",
  tcs:"#E84040", infosys:"#007CC3", accenture:"#A100FF",
  startup:"#10b981", general:"#64748b",
};
const DIFFICULTY_COLORS: Record<string,string> = {
  easy:"#10b981", medium:"#f59e0b", hard:"#f97316", expert:"#ef4444",
};

function detectStar(text: string) {
  const t = text.toLowerCase();
  return {
    S: /\b(when|situation|context|background|i was|we were|at my|during|once)\b/.test(t),
    T: /\b(task|goal|objective|responsible|needed to|had to|my role|challenge)\b/.test(t),
    A: /\b(i (did|built|created|implemented|decided|used|solved|fixed|led|wrote)|action|approach|step|i then|so i)\b/.test(t),
    R: /\b(result|outcome|achieved|improved|increased|reduced|saved|delivered|success|finally|as a result)\b/.test(t),
  };
}

function InterviewContent() {
  const searchParams = useSearchParams();
  const sessionId    = searchParams.get("sessionId");

  const [questions, setQuestions]   = useState<string[]>([]);
  const [company, setCompany]       = useState("general");
  const [difficulty, setDifficulty] = useState("medium");
  const [idx, setIdx]               = useState(0);
  const [answer, setAnswer]         = useState("");
  const [scores, setScores]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(false);
  const [recording, setRecording]   = useState(false);
  const [sttLoading, setSttLoading] = useState(false);
  const [sttError, setSttError]     = useState("");
  const [notes, setNotes]           = useState("");
  const [lastFeedback, setLastFeedback] = useState("");
  const [lastScore, setLastScore]   = useState<any>(null);
  const [timeLeft, setTimeLeft]     = useState(120);
  const [star, setStar]             = useState({ S:false, T:false, A:false, R:false });
  const [timerPulse, setTimerPulse] = useState(false);

  const mrRef    = useRef<MediaRecorder | null>(null);
  const chunks   = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const savedCompany    = localStorage.getItem("pm-company")    || "general";
    const savedDifficulty = localStorage.getItem("pm-difficulty") || "medium";

    fetch("/api/interview", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        sessionId,
        company:    savedCompany,
        difficulty: savedDifficulty,
      }),
    })
      .then(r => r.json())
      .then(d => {
        setQuestions(d.questions || []);
        setCompany(d.company    || savedCompany);
        setDifficulty(d.difficulty || savedDifficulty);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    if (loading) return;
    setTimeLeft(120);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 30) setTimerPulse(true);
        else         setTimerPulse(false);
        return Math.max(0, t - 1);
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [idx, loading]);

  useEffect(() => { setStar(detectStar(answer)); }, [answer]);

  async function startRecording() {
    setSttError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime   = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus" : "audio/mp4";
      const mr = new MediaRecorder(stream, { mimeType: mime });
      chunks.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks.current, { type: mime });
        if (blob.size < 1000) { setSttError("Too short. Try again."); return; }
        setSttLoading(true);
        const fd = new FormData();
        fd.append("audio", blob, mime.includes("mp4") ? "rec.mp4" : "rec.webm");
        try {
          const res  = await fetch("/api/stt", { method:"POST", body:fd });
          const data = await res.json();
          if (data.text?.trim()) setAnswer(p => p ? p + " " + data.text : data.text);
          else setSttError("Could not understand. Please type your answer.");
        } catch { setSttError("Transcription failed."); }
        finally  { setSttLoading(false); }
      };
      mr.start(100);
      mrRef.current = mr;
      setRecording(true);
    } catch { setSttError("Microphone access denied."); }
  }

  function stopRecording() { mrRef.current?.stop(); setRecording(false); }

  async function submitAnswer() {
    if (!answer.trim()) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const res  = await fetch("/api/evaluate", {
        method:  "POST",
        headers: { "Content-Type":"application/json" },
        body:    JSON.stringify({ sessionId, questionIndex: idx, answer }),
      });
      const data = await res.json();
      const sc   = data.score || {};
      setLastScore(sc);
      setLastFeedback(sc.feedback || "");
      setScores(prev => { const n = [...prev]; n[idx] = sc; return n; });

      if (idx + 1 >= questions.length) {
        fetch("/api/learning", {
          method:  "POST",
          headers: { "Content-Type":"application/json" },
          body:    JSON.stringify({ sessionId }),
        }).catch(() => {});
        setDone(true);
        setTimeout(() => { window.location.href = `/results?sessionId=${sessionId}`; }, 1800);
      } else {
        setIdx(i => i + 1);
        setAnswer(""); setSttError(""); setLastFeedback(""); setLastScore(null);
        setTimerPulse(false);
      }
    } finally { setSubmitting(false); }
  }

  const progress   = questions.length > 0 ? (idx / questions.length) * 100 : 0;
  const timerColor = timeLeft > 60 ? "var(--green)" : timeLeft > 30 ? "var(--amber)" : "var(--red)";
  const wordCount  = answer.trim().split(/\s+/).filter(Boolean).length;
  const avgScore   = scores.filter(Boolean).length > 0
    ? Math.round(scores.filter(Boolean).reduce((s, sc) =>
        s + ((sc.technical + sc.communication + sc.confidence) / 3), 0
      ) / scores.filter(Boolean).length * 10) / 10
    : null;

  const companyColor    = COMPANY_COLORS[company]    || "#64748b";
  const difficultyColor = DIFFICULTY_COLORS[difficulty] || "#f59e0b";
  const companyLabel    = company.charAt(0).toUpperCase() + company.slice(1);
  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  /* ── Loading ── */
  if (loading) return (
    <div className="interview-page" style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", display:"flex", flexDirection:"column" }}>
      <div className="aurora-bg"><div className="aurora-orb"/></div>
      <nav className="site-nav">
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div className="logo-mark">P</div>
          <span style={{ fontWeight:800, fontSize:17 }}>PrepMind<span style={{ color:"var(--green)" }}> AI</span></span>
        </div>
        <ThemeToggle />
      </nav>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
        <svg className="anim-spin" width="40" height="40" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="rgba(16,185,129,0.15)" strokeWidth="2.5"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <div style={{ textAlign:"center" }}>
          <h2 style={{ fontWeight:700, fontSize:20, marginBottom:6 }}>
            PrepMind AI is generating your questions…
          </h2>
          <p style={{ color:"var(--text-2)", fontSize:13 }}>
            Personalising 6 questions from your resume
          </p>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {[0,1,2].map(i => <span key={i} className="live-dot" style={{ animationDelay:`${i*0.25}s` }}/>)}
        </div>
      </div>
    </div>
  );

  /* ── Done ── */
  if (done) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div className="anim-scale-in" style={{ textAlign:"center" }}>
        <div style={{ fontSize:60, marginBottom:14 }}>🎉</div>
        <h2 className="gradient-text" style={{ fontWeight:900, fontSize:28, marginBottom:8 }}>
          Interview Complete!
        </h2>
        <p style={{ color:"var(--text-2)", fontSize:14 }}>
          PrepMind AI is analysing your answers…
        </p>
        <div style={{ display:"flex", gap:6, justifyContent:"center", marginTop:20 }}>
          {[0,1,2].map(i => <span key={i} className="live-dot" style={{ animationDelay:`${i*0.2}s` }}/>)}
        </div>
      </div>
    </div>
  );

  /* ── Interview ── */
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", display:"flex", flexDirection:"column" }}>
      <div className="aurora-bg"><div className="aurora-orb"/></div>

      {/* NAV */}
      <nav className="site-nav interview-nav" style={{ flexShrink:0 }}>
        <button
          onClick={() => { if (confirm("Exit? Progress will be lost.")) window.location.href="/"; }}
          style={{ display:"flex", alignItems:"center", gap:10, background:"none", border:"none", cursor:"pointer", color:"var(--text)" }}
        >
          <div className="logo-mark">P</div>
          <span style={{ fontWeight:800, fontSize:16 }}>PrepMind<span style={{ color:"var(--green)" }}> AI</span></span>
        </button>

        {/* Progress */}
        <div className="interview-progress" style={{ display:"flex", alignItems:"center", gap:10, flex:1, maxWidth:300, margin:"0 auto" }}>
          <span className="label-mono" style={{ flexShrink:0 }}>Q{idx+1}/{questions.length}</span>
          <div className="progress-track" style={{ flex:1 }}>
            <div className="progress-fill" style={{ width:`${progress}%` }}/>
          </div>
          <span className="label-mono" style={{ flexShrink:0 }}>{Math.round(progress)}%</span>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {/* Timer — pulses red when ≤30s */}
          <div style={{
            padding:"5px 14px", borderRadius:10,
            background:`${timerColor}14`,
            border:`1px solid ${timerColor}30`,
            fontFamily:"'JetBrains Mono',monospace",
            fontSize:14, fontWeight:700, color:timerColor,
            letterSpacing:"0.06em",
            animation: timerPulse ? "pulse-timer 0.8s ease-in-out infinite" : "none",
            transition:"color 0.3s, border-color 0.3s, background 0.3s",
          }}>
            {String(Math.floor(timeLeft/60)).padStart(2,"0")}:{String(timeLeft%60).padStart(2,"0")}
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* SPLIT LAYOUT */}
      <div className="interview-layout" style={{
        flex:1, display:"flex", flexDirection:"row",
        overflow:"hidden", position:"relative", zIndex:1,
        minHeight:"calc(100vh - 62px)",
      }}>

        {/* LEFT */}
        <div className="interview-question-panel" style={{ width:"50%", minWidth:0, display:"flex", flexDirection:"column", borderRight:"1px solid var(--border)", overflow:"hidden" }}>

          {/* AI avatar */}
          <div style={{ padding:"18px 24px", borderBottom:"1px solid var(--border)", background:"var(--glass-inner)", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{
                width:42, height:42, borderRadius:13, flexShrink:0,
                background:"linear-gradient(135deg,var(--green),var(--cyan))",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:20, boxShadow:"0 0 18px var(--green-glow)",
              }}>🤖</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>PrepMind AI Interviewer</div>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
                  <span className="live-dot"/>
                  <span className="label-accent">Live Session</span>
                </div>
              </div>
              {/* Company + difficulty badges */}
              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                <span className="badge" style={{ background:`${companyColor}15`, border:`1px solid ${companyColor}30`, color:companyColor, fontSize:10 }}>
                  {companyLabel}
                </span>
                <span className="badge" style={{ background:`${difficultyColor}15`, border:`1px solid ${difficultyColor}30`, color:difficultyColor, fontSize:10 }}>
                  {difficultyLabel}
                </span>
              </div>
              {avgScore !== null && (
                <div style={{ textAlign:"center", marginLeft:4 }}>
                  <div style={{ fontWeight:900, fontSize:18, color:"var(--green)" }}>{avgScore}/10</div>
                  <div className="label-mono">Avg</div>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable content */}
          <div className="interview-question-content" style={{ flex:1, padding:"20px 24px", overflowY:"auto", display:"flex", flexDirection:"column", gap:16 }}>

            {/* Question */}
            <div>
              <div className="badge badge-green" style={{ marginBottom:10 }}>
                <span className="label-accent">Question {idx+1} of {questions.length}</span>
              </div>
              <div className="glass-card" style={{ padding:"18px 20px" }}>
                <p style={{ fontSize:15, fontWeight:600, lineHeight:1.65 }}>{questions[idx]}</p>
              </div>
            </div>

            {/* STAR */}
            <div>
              <p className="label-mono" style={{ marginBottom:10 }}>STAR Framework Detection</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {([
                  { k:"S" as const, label:"Situation", desc:"Set the context" },
                  { k:"T" as const, label:"Task",      desc:"Your responsibility" },
                  { k:"A" as const, label:"Action",    desc:"Steps you took" },
                  { k:"R" as const, label:"Result",    desc:"Outcome achieved" },
                ]).map(s => (
                  <div key={s.k} style={{
                    padding:"12px 14px", borderRadius:12,
                    background: star[s.k] ? "var(--green-dim)" : "var(--glass-inner)",
                    border:`1px solid ${star[s.k] ? "var(--green-border)" : "var(--border)"}`,
                    boxShadow: star[s.k] ? "0 0 12px var(--green-glow)" : "none",
                    transition:"all 0.35s ease",
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                      <div style={{
                        width:22, height:22, borderRadius:6,
                        background: star[s.k] ? "var(--green)" : "var(--glass-inner)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontWeight:900, fontSize:11,
                        color: star[s.k] ? "#000" : "var(--text-3)",
                        transition:"all 0.35s ease",
                        flexShrink:0,
                      }}>{star[s.k] ? "✓" : s.k}</div>
                      <span style={{ fontSize:12, fontWeight:700, color:star[s.k]?"var(--text)":"var(--text-3)", transition:"color 0.35s" }}>{s.label}</span>
                    </div>
                    <p style={{ fontSize:11, color:"var(--text-3)", paddingLeft:30 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
              {/* STAR completion message */}
              {Object.values(star).every(Boolean) && (
                <div className="glass-green anim-fade-in" style={{ padding:"8px 14px", marginTop:8, textAlign:"center" }}>
                  <p style={{ fontSize:12, fontWeight:700, color:"var(--green)" }}>
                    ✨ Perfect STAR answer detected!
                  </p>
                </div>
              )}
            </div>

            {/* AI feedback */}
            {lastFeedback && (
              <div className="glass-green anim-fade-in" style={{ padding:"13px 16px" }}>
                <p className="label-accent" style={{ marginBottom:6 }}>🤖 PrepMind AI Feedback</p>
                <p style={{ fontSize:13, color:"var(--text-2)", lineHeight:1.65 }}>{lastFeedback}</p>
              </div>
            )}

            {/* Last scores */}
            {lastScore && (
              <div>
                <p className="label-mono" style={{ marginBottom:8 }}>Previous Answer</p>
                <div style={{ display:"flex", gap:8 }}>
                  {[
                    { label:"Technical",     val:lastScore.technical||0,     color:"var(--violet)" },
                    { label:"Communication", val:lastScore.communication||0, color:"var(--cyan)"   },
                    { label:"Confidence",    val:lastScore.confidence||0,    color:"var(--green)"  },
                  ].map(s => (
                    <div key={s.label} className="glass-card" style={{ flex:1, padding:"10px 8px", textAlign:"center", borderRadius:12 }}>
                      <div style={{ fontWeight:800, fontSize:16, color:s.color }}>{s.val}/10</div>
                      <div className="label-mono" style={{ marginTop:2 }}>{s.label.slice(0,4)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div className="interview-bottom-nav" style={{ padding:"14px 24px", borderTop:"1px solid var(--border)", background:"var(--glass-inner)", flexShrink:0, display:"flex", gap:10 }}>
            <button className="btn-ghost" style={{ flex:1 }}
              disabled={idx === 0 || submitting}
              onClick={() => { setIdx(i => i-1); setAnswer(""); setLastFeedback(""); setLastScore(null); setTimerPulse(false); }}>
              ← Previous
            </button>
            <button className="btn-primary" style={{ flex:2 }}
              disabled={!answer.trim() || submitting}
              onClick={submitAnswer}>
              {submitting ? (
                <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <svg className="anim-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.2)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#000" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Analysing…
                </span>
              ) : idx+1 >= questions.length
                ? "Finish Interview →"
                : `Submit & Next (${idx+2}/${questions.length}) →`}
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="interview-answer-panel" style={{ width:"50%", minWidth:0, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div className="interview-answer-content" style={{ flex:1, padding:"20px 24px", display:"flex", flexDirection:"column", gap:14, overflowY:"auto" }}>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <p className="label-mono">Your Answer</p>
              <span style={{
                fontFamily:"'JetBrains Mono',monospace", fontSize:10,
                color: wordCount >= 30 ? "var(--green)" : "var(--amber)",
              }}>
                {wordCount} words {wordCount >= 30 ? "✓ Good length" : "· aim for 30+"}
              </span>
            </div>

            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer here, or use the microphone below.&#10;&#10;Be specific — use examples from your experience. Apply the STAR method."
              className="pm-input interview-answer-input"
              style={{ flex:1, minHeight:200, lineHeight:1.75 }}
            />

            {/* Voice */}
            <button
              onClick={recording ? stopRecording : startRecording}
              style={{
                display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                padding:"12px", borderRadius:13, fontWeight:600, fontSize:13,
                cursor:"pointer", fontFamily:"'Inter',sans-serif",
                background: recording ? "rgba(248,113,113,0.10)" : "var(--glass-inner)",
                border:`1px solid ${recording ? "rgba(248,113,113,0.35)" : "var(--border)"}`,
                color: recording ? "var(--red)" : "var(--text-2)",
                transition:"all 0.2s",
              }}
            >
              <span>{recording ? "⏹" : "🎤"}</span>
              {recording ? "Stop Recording" : "Record with Microphone"}
              {recording && <span className="live-dot" style={{ marginLeft:4 }}/>}
            </button>

            {sttLoading && (
              <div className="glass-green anim-fade-in" style={{ padding:"10px 14px", display:"flex", alignItems:"center", gap:8, borderRadius:12 }}>
                <svg className="anim-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(16,185,129,0.2)" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--green)" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize:12, color:"var(--green)" }}>
                  PrepMind AI is transcribing…
                </span>
              </div>
            )}

            {sttError && (
              <div style={{ padding:"10px 14px", borderRadius:12, background:"var(--amber-dim)", border:"1px solid var(--amber-border)", color:"var(--amber)", fontSize:12 }}>
                {sttError}
              </div>
            )}

            <div>
              <p className="label-mono" style={{ marginBottom:8 }}>Private Notes (not evaluated)</p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Jot down key points or keywords…"
                className="pm-input"
                style={{ height:72, fontSize:12 }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-timer {
          0%,100% { transform:scale(1);   box-shadow:0 0 0 0 rgba(239,68,68,0); }
          50%      { transform:scale(1.04); box-shadow:0 0 0 4px rgba(239,68,68,0.2); }
        }

        @media (max-width: 760px) {
          .interview-nav { padding: 8px 14px; gap: 10px; }
          .interview-nav > button span { font-size: 14px !important; }
          .interview-progress { order: 3; flex-basis: 100%; max-width: none !important; margin: 0 !important; }
          .interview-layout { flex-direction: column !important; overflow: visible !important; min-height: 0 !important; }
          .interview-question-panel, .interview-answer-panel { width: 100% !important; overflow: visible !important; }
          .interview-question-panel { border-right: 0 !important; border-bottom: 1px solid var(--border); }
          .interview-question-content, .interview-answer-content { flex: none !important; overflow: visible !important; padding: 18px 16px !important; }
          .interview-bottom-nav { padding: 12px 16px !important; }
          .interview-answer-input { flex: none !important; min-height: 260px !important; }
        }
      `}</style>
    </div>
  );
}

export default function InterviewPage() {
  return <Suspense><InterviewContent /></Suspense>;
}

