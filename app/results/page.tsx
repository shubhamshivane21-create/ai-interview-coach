"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

/* ─── Confetti particle ─────────────────────────────────────────────────── */
const CONFETTI_COLORS = [
  "#10b981","#06b6d4","#8b5cf6","#f59e0b","#f87171","#34d399","#60a5fa",
];

function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 120 }, () => ({
      x:    Math.random() * canvas.width,
      y:    -10 - Math.random() * 200,
      w:    6  + Math.random() * 8,
      h:    3  + Math.random() * 5,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rot:   Math.random() * Math.PI * 2,
      rotV:  (Math.random() - 0.5) * 0.12,
      vx:   (Math.random() - 0.5) * 2.5,
      vy:    2  + Math.random() * 3.5,
      alpha: 1,
    }));

    let frame = 0;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      let alive = false;
      for (const p of particles) {
        p.x   += p.vx;
        p.y   += p.vy;
        p.rot += p.rotV;
        if (frame > 120) p.alpha = Math.max(0, p.alpha - 0.012);
        if (p.alpha > 0 && p.y < canvas.height + 20) alive = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      }
      if (alive) rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position:"fixed", inset:0, zIndex:999,
        pointerEvents:"none",
      }}
    />
  );
}

/* ─── Score Ring ─────────────────────────────────────────────────────────── */
function ScoreRing({ score, max=10, label, color, size=90 }: {
  score:number; max?:number; label:string; color:string; size?:number;
}) {
  const r    = size/2 - 9;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(score/max, 1);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
      <div style={{ position:"relative", width:size, height:size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke="rgba(255,255,255,0.07)" strokeWidth="7"/>
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth="7"
            strokeDasharray={circ}
            strokeDashoffset={circ*(1-pct)}
            strokeLinecap="round"
            transform={`rotate(-90 ${size/2} ${size/2})`}
            className="ring-fill"
          />
        </svg>
        <div style={{
          position:"absolute", inset:0,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
        }}>
          <span style={{ fontSize:size>80?18:13, fontWeight:900 }}>{score}</span>
          {size>80 && (
            <span style={{ fontSize:9, color:"var(--text-3)", fontFamily:"'JetBrains Mono',monospace" }}>
              /{max}
            </span>
          )}
        </div>
      </div>
      <span style={{ fontSize:11, color:"var(--text-2)", fontWeight:600, textAlign:"center" }}>
        {label}
      </span>
    </div>
  );
}

/* ─── Grade config ───────────────────────────────────────────────────────── */
function getGrade(score: number) {
  if (score >= 9)  return { emoji:"🏆", label:"Outstanding!",    color:"#f59e0b", bg:"rgba(245,158,11,0.12)",  border:"rgba(245,158,11,0.30)"  };
  if (score >= 7.5)return { emoji:"🌟", label:"Excellent!",      color:"#10b981", bg:"rgba(16,185,129,0.12)", border:"rgba(16,185,129,0.30)" };
  if (score >= 6)  return { emoji:"👍", label:"Good Job!",        color:"#06b6d4", bg:"rgba(6,182,212,0.12)",  border:"rgba(6,182,212,0.30)"  };
  if (score >= 4)  return { emoji:"📈", label:"Keep Improving",  color:"#f59e0b", bg:"rgba(245,158,11,0.12)",  border:"rgba(245,158,11,0.30)"  };
  return               { emoji:"💪", label:"Keep Practising!", color:"#f87171", bg:"rgba(248,113,113,0.12)", border:"rgba(248,113,113,0.30)" };
}

/* ─── Study Plan renderer ────────────────────────────────────────────────── */
function StudyPlanRenderer({ plan }: { plan: any }) {
  if (!plan) return (
    <p style={{ color:"var(--text-2)", fontSize:13 }}>
      PrepMind AI is generating your study plan… Refresh in a moment.
    </p>
  );

  if (typeof plan === "object" && Array.isArray(plan.days)) {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {plan.days.map((d: any) => (
          <div key={d.day} className="glass-card" style={{ padding:"18px 22px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:12 }}>
              <div style={{
                width:34, height:34, borderRadius:10, flexShrink:0,
                background:"var(--green-dim)",
                border:"1px solid var(--green-border)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'JetBrains Mono',monospace", fontWeight:800,
                fontSize:13, color:"var(--green)",
              }}>{d.day}</div>
              <h3 style={{ fontWeight:700, fontSize:14 }}>{d.topic}</h3>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              {[
                { icon:"📖", label:"STUDY",    val:d.study },
                { icon:"🔗", label:"RESOURCE", val:d.resource },
                { icon:"🏋️", label:"PRACTICE", val:d.practice },
              ].map(item => (
                <div key={item.label} style={{
                  padding:"10px 12px", borderRadius:10,
                  background:"var(--glass-inner)",
                }}>
                  <p className="label-mono" style={{ marginBottom:6 }}>{item.icon} {item.label}</p>
                  <p style={{ fontSize:12, color:"var(--text-2)", lineHeight:1.55 }}>{item.val}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {plan.motivation && (
          <div className="glass-green" style={{ padding:"14px 18px", textAlign:"center" }}>
            <p style={{ fontSize:14, fontWeight:600, color:"var(--green)" }}>
              {plan.motivation}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (typeof plan === "string") {
    return (
      <p style={{ fontSize:13, color:"var(--text-2)", whiteSpace:"pre-wrap", lineHeight:1.7 }}>
        {plan}
      </p>
    );
  }
  return null;
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
function ResultsContent() {
  const searchParams = useSearchParams();
  const sessionId    = searchParams.get("sessionId");

  const [session, setSession]       = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<"scores"|"plan"|"analysis">("scores");
  const [confetti, setConfetti]     = useState(false);
  const [animReady, setAnimReady]   = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/results?sessionId=${sessionId}`)
      .then(r => r.json())
      .then(d => {
        setSession(d.session);
        setLoading(false);
        setTimeout(() => setAnimReady(true), 200);
      });
  }, [sessionId]);

  /* Trigger confetti if score ≥ 7 */
  useEffect(() => {
    if (!session || !animReady) return;
    const o = computeOverall(session);
    if (o >= 7) {
      setTimeout(() => setConfetti(true), 600);
      setTimeout(() => setConfetti(false), 5000);
    }
  }, [session, animReady]);

  function computeAvg(s: any, key: string) {
    if (!s?.scores?.length) return 0;
    const vals = s.scores.map((sc: any) => Number(sc?.[key]) || 0);
    return Math.round((vals.reduce((a:number,b:number)=>a+b,0)/vals.length)*10)/10;
  }
  function computeOverall(s: any) {
    return Math.round(((computeAvg(s,"technical")+computeAvg(s,"communication")+computeAvg(s,"confidence"))/3)*10)/10;
  }

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <svg className="anim-spin" width="44" height="44" viewBox="0 0 24 24" fill="none" style={{ margin:"0 auto 20px" }}>
          <circle cx="12" cy="12" r="10" stroke="rgba(16,185,129,0.15)" strokeWidth="2.5"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <p style={{ color:"var(--text-2)" }}>PrepMind AI is loading your results…</p>
      </div>
    </div>
  );

  const tech    = computeAvg(session,"technical");
  const comm    = computeAvg(session,"communication");
  const conf    = computeAvg(session,"confidence");
  const overall = computeOverall(session);
  const pct     = Math.round((overall/10)*100);
  const grade   = getGrade(overall);

  const company    = session?.company    || "general";
  const difficulty = session?.difficulty || "medium";
  const companyLabel    = company.charAt(0).toUpperCase()    + company.slice(1);
  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  const COMPANY_COLORS: Record<string,string> = {
    google:"#4285F4",amazon:"#FF9900",microsoft:"#00A4EF",apple:"#A0A0A0",
    meta:"#0082FB",netflix:"#E50914",tcs:"#E84040",infosys:"#007CC3",
    accenture:"#A100FF",startup:"#10b981",general:"#64748b",
  };
  const DIFF_COLORS: Record<string,string> = {
    easy:"#10b981",medium:"#f59e0b",hard:"#f97316",expert:"#ef4444",
  };
  const companyColor    = COMPANY_COLORS[company]    || "#64748b";
  const difficultyColor = DIFF_COLORS[difficulty]    || "#f59e0b";

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)" }}>
      <Confetti active={confetti} />
      <div className="aurora-bg"><div className="aurora-orb"/></div>
      <div className="grid-overlay"/>

      {/* NAV */}
      <nav className="site-nav">
        <button onClick={() => { window.location.href="/"; }}
          style={{ display:"flex", alignItems:"center", gap:10, background:"none", border:"none", cursor:"pointer", color:"var(--text)" }}>
          <div className="logo-mark">P</div>
          <span style={{ fontWeight:800, fontSize:17 }}>PrepMind<span style={{ color:"var(--green)" }}> AI</span></span>
        </button>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn-ghost" style={{ fontSize:12, padding:"8px 14px" }}
            onClick={() => { window.location.href="/upload"; }}>New Interview</button>
          <button className="btn-ghost" style={{ fontSize:12, padding:"8px 14px" }}
            onClick={() => { window.location.href="/dashboard"; }}>Dashboard</button>
          <ThemeToggle />
        </div>
      </nav>

      <div style={{ position:"relative", zIndex:1, maxWidth:900, margin:"0 auto", padding:"44px 24px 80px" }}>

        {/* Header */}
        <div className="anim-fade-up" style={{ textAlign:"center", marginBottom:32 }}>
          {/* Company + difficulty row */}
          <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:18 }}>
            <span className="badge" style={{
              background:`${companyColor}15`, border:`1px solid ${companyColor}30`,
              color:companyColor, fontSize:12, padding:"5px 14px",
            }}>
              {companyLabel}
            </span>
            <span className="badge" style={{
              background:`${difficultyColor}15`, border:`1px solid ${difficultyColor}30`,
              color:difficultyColor, fontSize:12, padding:"5px 14px",
            }}>
              {difficultyLabel}
            </span>
          </div>

          {/* Grade emoji */}
          <div style={{ fontSize:56, marginBottom:12, lineHeight:1 }}>{grade.emoji}</div>

          <h1 style={{ fontWeight:900, fontSize:"clamp(28px,5vw,44px)", letterSpacing:"-0.035em", marginBottom:12 }}>
            Interview <span className="gradient-text">Complete!</span>
          </h1>

          {/* Grade badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"8px 22px", borderRadius:999,
            background: grade.bg,
            border:`1px solid ${grade.border}`,
            color: grade.color,
            fontWeight:700, fontSize:14, marginBottom:8,
          }}>
            {grade.label}
          </div>

          <p style={{ color:"var(--text-3)", fontSize:12, fontFamily:"'JetBrains Mono',monospace" }}>
            {session?.createdAt
              ? new Date(session.createdAt).toLocaleDateString("en-IN",{ weekday:"long", day:"numeric", month:"long", year:"numeric" })
              : ""}
          </p>
        </div>

        {/* Score rings */}
        <div className="glass-card anim-fade-up d1" style={{ padding:"32px", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-around", flexWrap:"wrap", gap:24 }}>
          <div style={{ textAlign:"center" }}>
            <ScoreRing score={overall} label="Overall Score" color={grade.color} size={110}/>
            <div style={{ marginTop:12 }}>
              <div className="progress-track" style={{ width:110, margin:"0 auto" }}>
                <div className="progress-fill" style={{
                  width:`${pct}%`,
                  background:`linear-gradient(90deg, ${grade.color}, ${grade.color}aa)`,
                }}/>
              </div>
              <p style={{ fontSize:11, color:"var(--text-3)", marginTop:6, fontFamily:"'JetBrains Mono',monospace" }}>
                {pct}% overall
              </p>
            </div>
          </div>
          <div style={{ display:"flex", gap:28, flexWrap:"wrap", justifyContent:"center" }}>
            <ScoreRing score={tech}  label="Technical"     color="var(--violet)"/>
            <ScoreRing score={comm}  label="Communication" color="var(--cyan)"/>
            <ScoreRing score={conf}  label="Confidence"    color="var(--green)"/>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display:"flex", gap:4, marginBottom:20,
          background:"var(--glass-inner)", padding:4,
          borderRadius:14, border:"1px solid var(--border)",
        }}>
          {(["scores","plan","analysis"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:"9px", borderRadius:11,
              fontWeight:600, fontSize:13, cursor:"pointer",
              border:"none", fontFamily:"'Inter',sans-serif",
              background: tab===t ? "var(--glass)" : "transparent",
              color:       tab===t ? "var(--text)"  : "var(--text-2)",
              boxShadow:   tab===t ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
              transition:"all 0.2s",
            }}>
              {{ scores:"📊 Score Breakdown", plan:"📚 Study Plan", analysis:"🔍 Answer Analysis" }[t]}
            </button>
          ))}
        </div>

        {/* ── TAB: Scores ── */}
        {tab === "scores" && (
          <div className="anim-fade-in" style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Per-question */}
            {session?.scores?.length > 0 && (
              <div className="glass-card" style={{ padding:"24px 28px" }}>
                <p className="label-mono" style={{ marginBottom:20 }}>
                  Per-Question Performance
                </p>
                <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
                  {session.scores.map((sc: any, i: number) => {
                    const qa = Math.round(((sc.technical||0)+(sc.communication||0)+(sc.confidence||0))/3*10)/10;
                    const qColor = qa>=7?"var(--green)":qa>=5?"var(--amber)":"var(--red)";
                    return (
                      <div key={i}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                          <span style={{ fontSize:12, color:"var(--text-2)", fontWeight:600 }}>Question {i+1}</span>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            {sc.feedback && (
                              <span style={{ fontSize:11, color:"var(--text-3)", fontStyle:"italic", maxWidth:300, textOverflow:"ellipsis", overflow:"hidden", whiteSpace:"nowrap" }}>
                                "{sc.feedback}"
                              </span>
                            )}
                            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:qColor, fontWeight:700 }}>
                              {qa}/10
                            </span>
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:8 }}>
                          {[
                            { val:sc.technical||0,     color:"var(--violet)", label:"Technical"     },
                            { val:sc.communication||0, color:"var(--cyan)",   label:"Communication" },
                            { val:sc.confidence||0,    color:"var(--green)",  label:"Confidence"    },
                          ].map(b => (
                            <div key={b.label} style={{ flex:1 }}>
                              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                                <span style={{ fontSize:10, color:"var(--text-3)" }}>{b.label}</span>
                                <span style={{ fontSize:10, color:b.color, fontFamily:"'JetBrains Mono',monospace" }}>{b.val}</span>
                              </div>
                              <div style={{ height:6, background:"var(--glass-inner)", borderRadius:999, overflow:"hidden" }}>
                                <div style={{ height:"100%", borderRadius:999, background:b.color, width:`${(b.val/10)*100}%`, transition:"width 1s ease" }}/>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Strengths / Weaknesses */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {/* Strengths */}
              <div className="glass-green" style={{ padding:"18px 20px" }}>
                <p className="label-accent" style={{ marginBottom:12 }}>💪 Strengths</p>
                {session?.scores?.length > 0 ? (
                  session.scores
                    .map((sc: any, i: number) => {
                      const best = Math.max(sc.technical||0, sc.communication||0, sc.confidence||0);
                      if (best >= 6) {
                        const key = sc.technical >= best ? "Technical" : sc.communication >= best ? "Communication" : "Confidence";
                        return <p key={i} style={{ fontSize:12, color:"var(--text-2)", marginBottom:6 }}>· Q{i+1}: Strong {key}</p>;
                      }
                      return null;
                    })
                    .filter(Boolean)
                    .slice(0, 3)
                ) : (
                  <p style={{ fontSize:12, color:"var(--text-3)" }}>Complete more sessions to see strengths.</p>
                )}
              </div>

              {/* Weak areas */}
              <div className="glass-amber" style={{ padding:"18px 20px" }}>
                <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--amber)", marginBottom:12 }}>
                  📈 Focus Areas
                </p>
                {session?.weakAreas?.length > 0 ? (
                  session.weakAreas.slice(0, 3).map((a: string, i: number) => (
                    <p key={i} style={{ fontSize:12, color:"var(--text-2)", marginBottom:6 }}>· {a.slice(0,60)}{a.length>60?"…":""}</p>
                  ))
                ) : (
                  <p style={{ fontSize:12, color:"var(--text-3)" }}>No major weak areas detected!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Study Plan ── */}
        {tab === "plan" && (
          <div className="anim-fade-in">
            <StudyPlanRenderer plan={session?.studyPlan}/>
          </div>
        )}

        {/* ── TAB: Answer Analysis ── */}
        {tab === "analysis" && (
          <div className="anim-fade-in" style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {session?.questions?.map((q: string, i: number) => (
              <div key={i} className="glass-card" style={{ padding:"20px 24px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <div className="badge badge-green">
                    <span className="label-accent">Q{i+1}</span>
                  </div>
                  {session.scores?.[i] && (() => {
                    const qa = Math.round(((session.scores[i].technical||0)+(session.scores[i].communication||0)+(session.scores[i].confidence||0))/3*10)/10;
                    const c  = qa>=7?"var(--green)":qa>=5?"var(--amber)":"var(--red)";
                    return (
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:c, fontWeight:700, marginLeft:"auto" }}>
                        {qa}/10
                      </span>
                    );
                  })()}
                </div>
                <p style={{ fontSize:14, fontWeight:600, lineHeight:1.6, marginBottom:12 }}>{q}</p>
                {session.answers?.[i] && (
                  <div style={{ padding:"12px 14px", borderRadius:12, background:"var(--glass-inner)", marginBottom:12 }}>
                    <p className="label-mono" style={{ marginBottom:6 }}>Your Answer</p>
                    <p style={{ fontSize:13, color:"var(--text-2)", lineHeight:1.65 }}>{session.answers[i]}</p>
                  </div>
                )}
                {session.scores?.[i] && (
                  <>
                    <div style={{ display:"flex", gap:10, marginBottom:8 }}>
                      {[
                        { label:"Technical",     val:session.scores[i].technical||0,     color:"var(--violet)" },
                        { label:"Communication", val:session.scores[i].communication||0, color:"var(--cyan)"   },
                        { label:"Confidence",    val:session.scores[i].confidence||0,    color:"var(--green)"  },
                      ].map(s => (
                        <div key={s.label} style={{
                          flex:1, padding:"10px 8px", textAlign:"center",
                          background:"var(--glass-inner)", borderRadius:10,
                        }}>
                          <div style={{ fontWeight:800, fontSize:16, color:s.color }}>{s.val}/10</div>
                          <div className="label-mono" style={{ marginTop:3 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    {session.scores[i].feedback && (
                      <div style={{
                        padding:"10px 14px", borderRadius:10,
                        background:"var(--green-dim)",
                        border:"1px solid var(--green-border)",
                      }}>
                        <p style={{ fontSize:12, color:"var(--text-2)", fontStyle:"italic" }}>
                          💡 {session.scores[i].feedback}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            {(!session?.questions || session.questions.length === 0) && (
              <div className="glass-card" style={{ padding:"32px", textAlign:"center" }}>
                <p style={{ color:"var(--text-2)" }}>No answer data found.</p>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="anim-fade-up" style={{ display:"flex", gap:12, marginTop:28, flexWrap:"wrap" }}>
          <button className="btn-primary" style={{ flex:1, padding:"14px", fontSize:14 }}
            onClick={() => { window.location.href="/upload"; }}>
            Practise Again →
          </button>
          <button className="btn-ghost" style={{ flex:1, padding:"14px", fontSize:14 }}
            onClick={() => { window.location.href="/dashboard"; }}>
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return <Suspense><ResultsContent/></Suspense>;
}