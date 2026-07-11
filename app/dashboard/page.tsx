"use client";
import { useState, useEffect, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const COMPANY_COLORS: Record<string,string> = {
  google:"#4285F4",amazon:"#FF9900",microsoft:"#00A4EF",apple:"#A0A0A0",
  meta:"#0082FB",netflix:"#E50914",tcs:"#E84040",infosys:"#007CC3",
  accenture:"#A100FF",startup:"#10b981",general:"#64748b",
};
const DIFF_COLORS: Record<string,string> = {
  easy:"#10b981",medium:"#f59e0b",hard:"#f97316",expert:"#ef4444",
};

/* ─── Mini score ring ────────────────────────────────────────────────────── */
function MiniRing({ score, color }: { score:number; color:string }) {
  const r = 18, circ = 2*Math.PI*r;
  return (
    <div style={{ position:"relative", width:46, height:46, flexShrink:0 }}>
      <svg width="46" height="46" viewBox="0 0 46 46">
        <circle cx="23" cy="23" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5"/>
        <circle cx="23" cy="23" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={circ*(1-score/10)}
          strokeLinecap="round" transform="rotate(-90 23 23)" className="ring-fill"/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:11, fontWeight:800 }}>{score}</span>
      </div>
    </div>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────────────── */
function StatCard({
  icon, label, value, sub, color="var(--green)",
}: {
  icon:string; label:string; value:string|number; sub?:string; color?:string;
}) {
  return (
    <div className="glass-card lift" style={{ padding:"20px 18px" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
        <span style={{ fontSize:24 }}>{icon}</span>
        <span className="label-mono">{label}</span>
      </div>
      <div style={{ fontWeight:900, fontSize:28, color, letterSpacing:"-0.02em", lineHeight:1 }}>
        {value}
      </div>
      {sub && <p style={{ fontSize:11, color:"var(--text-3)", marginTop:6 }}>{sub}</p>}
    </div>
  );
}

/* ─── SVG Line Chart ─────────────────────────────────────────────────────── */
function LineChart({ data, width=500, height=100 }: { data:{label:string;value:number}[]; width?:number; height?:number }) {
  if (data.length < 2) return (
    <div style={{ height, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"var(--text-3)", fontSize:12 }}>Need at least 2 sessions to show trend</p>
    </div>
  );

  const pad   = { t:10, r:10, b:28, l:28 };
  const W     = width  - pad.l - pad.r;
  const H     = height - pad.t - pad.b;
  const vals  = data.map(d => d.value);
  const minV  = Math.max(0,  Math.min(...vals) - 1);
  const maxV  = Math.min(10, Math.max(...vals) + 1);
  const range = maxV - minV || 1;

  const pts = data.map((d, i) => ({
    x: pad.l + (i / (data.length-1)) * W,
    y: pad.t + H - ((d.value - minV) / range) * H,
    v: d.value,
    l: d.label,
  }));

  const pathD = pts.map((p,i) => `${i===0?"M":"L"}${p.x},${p.y}`).join(" ");

  // Smooth bezier
  const bezierD = pts.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = pts[i-1];
    const cpx  = (prev.x + p.x) / 2;
    return acc + ` C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
  }, "");

  const areaD = bezierD + ` L${pts[pts.length-1].x},${pad.t+H} L${pts[0].x},${pad.t+H} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow:"visible" }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#10b981" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* Y axis labels */}
      {[0, 5, 10].map(v => {
        const y = pad.t + H - ((v - minV) / range) * H;
        if (y < pad.t - 5 || y > pad.t + H + 5) return null;
        return (
          <g key={v}>
            <line x1={pad.l} y1={y} x2={pad.l+W} y2={y} stroke="var(--border)" strokeWidth="1"/>
            <text x={pad.l-6} y={y+4} textAnchor="end" fontSize="9" fill="var(--text-3)"
              fontFamily="'JetBrains Mono',monospace">{v}</text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaD} fill="url(#lineGrad)"/>

      {/* Line */}
      <path d={bezierD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>

      {/* Data points */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill="#10b981"
            stroke="var(--bg-elevated, #0C1320)" strokeWidth="2"/>
          {/* Value label above point */}
          <text x={p.x} y={p.y-9} textAnchor="middle" fontSize="9" fill="var(--green)"
            fontFamily="'JetBrains Mono',monospace" fontWeight="700">{p.v}</text>
          {/* X axis label */}
          <text x={p.x} y={pad.t+H+16} textAnchor="middle" fontSize="8" fill="var(--text-3)"
            fontFamily="'JetBrains Mono',monospace">{p.l}</text>
        </g>
      ))}
    </svg>
  );
}

/* ─── Sparkline ──────────────────────────────────────────────────────────── */
function Sparkline({ data, color }: { data:number[]; color:string }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:28 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex:1, borderRadius:3, background:color, minHeight:3,
          height:`${(v/max)*100}%`,
          opacity:0.35 + (i/data.length)*0.65,
          transition:"height 0.8s ease",
        }}/>
      ))}
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
function DashboardContent() {
  const { data:auth, status } = useSession();
  const [sessions, setSessions]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [selected, setSelected]     = useState<any>(null);
  const [loadingSel, setLoadingSel] = useState(false);
  const [activeTab, setActiveTab]   = useState<"overview"|"answers"|"plan">("overview");

  useEffect(() => {
    if (status === "unauthenticated") { window.location.href="/sign-in"; return; }
    if (status === "authenticated")   fetchSessions();
  }, [status]);

  async function fetchSessions() {
    try {
      const res  = await fetch("/api/sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch {}
    setLoading(false);
  }

  async function loadSession(id: string) {
    setSelectedId(id); setLoadingSel(true); setActiveTab("overview");
    try {
      const res  = await fetch(`/api/results?sessionId=${id}`);
      const data = await res.json();
      setSelected(data.session);
    } catch {}
    setLoadingSel(false);
  }

  function avg(s:any, key:string) {
    if (!s?.scores?.length) return 0;
    return Math.round((s.scores.reduce((a:number,sc:any)=>a+(sc?.[key]||0),0)/s.scores.length)*10)/10;
  }
  function overall(s:any) {
    return Math.round(((avg(s,"technical")+avg(s,"communication")+avg(s,"confidence"))/3)*10)/10;
  }
  function getName(s:any) {
    try { return JSON.parse(s.resumeText)?.name || "Interview"; } catch { return "Interview"; }
  }
  function fmt(d:string) {
    return new Date(d).toLocaleDateString("en-IN",{ day:"numeric", month:"short" });
  }

  /* ── Computed stats ── */
  const totalSessions = sessions.length;
  const avgAll        = totalSessions
    ? Math.round((sessions.reduce((a,s)=>a+overall(s),0)/totalSessions)*10)/10 : 0;
  const bestScore     = totalSessions ? Math.max(...sessions.map(s=>overall(s))) : 0;
  const thisWeek      = sessions.filter(s =>
    new Date(s.createdAt) > new Date(Date.now()-7*24*60*60*1000)
  ).length;

  /* Score trend data for line chart — last 8 sessions oldest→newest */
  const trendData = sessions
    .slice(0, 8)
    .reverse()
    .map((s, i) => ({
      label: `S${i+1}`,
      value: overall(s),
    }));

  /* Improvement: diff between last and first score */
  const improvement = trendData.length >= 2
    ? Math.round((trendData[trendData.length-1].value - trendData[0].value)*10)/10
    : null;

  if (status === "loading") return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <svg className="anim-spin" width="36" height="36" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="rgba(16,185,129,0.15)" strokeWidth="2.5"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", display:"flex", flexDirection:"column" }}>
      <div className="aurora-bg"><div className="aurora-orb"/></div>
      <div className="grid-overlay"/>

      {/* NAV */}
      <nav className="site-nav dashboard-nav" style={{ position:"sticky", top:0, zIndex:50, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => { window.location.href="/"; }}
            style={{ display:"flex", alignItems:"center", gap:10, background:"none", border:"none", cursor:"pointer", color:"var(--text)" }}>
            <div className="logo-mark">P</div>
            <span style={{ fontWeight:800, fontSize:17 }}>
              PrepMind<span style={{ color:"var(--green)" }}> AI</span>
            </span>
          </button>
        </div>
        <div className="dashboard-nav-actions" style={{ display:"flex", alignItems:"center", gap:10 }}>
          {auth?.user?.image && (
            <img src={auth.user.image} alt=""
              style={{ width:30, height:30, borderRadius:"50%", border:"2px solid var(--border-2)" }}/>
          )}
          <span style={{ fontSize:13, color:"var(--text-2)" }}>
            {auth?.user?.name?.split(" ")[0]}
          </span>
          <button className="btn-primary" style={{ padding:"8px 18px", fontSize:13 }}
            onClick={() => { window.location.href="/upload"; }}>
            New Interview +
          </button>
          <button className="btn-ghost" style={{ padding:"8px 14px", fontSize:12 }}
            onClick={() => signOut({ callbackUrl:"/" })}>
            Sign out
          </button>
          <ThemeToggle />
        </div>
      </nav>

      {/* LAYOUT */}
      <div className="dashboard-layout" style={{ flex:1, display:"flex", overflow:"hidden", position:"relative", zIndex:1 }}>

        {/* SIDEBAR */}
        <aside className="dashboard-sidebar" style={{ width:264, borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0 }}>
          <div style={{ padding:"16px", borderBottom:"1px solid var(--border)" }}>
            <p className="label-mono" style={{ marginBottom:4 }}>Interview History</p>
            <p style={{ fontSize:11, color:"var(--text-3)" }}>
              {totalSessions} session{totalSessions!==1?"s":""} recorded
            </p>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"8px" }}>
            {loading ? (
              Array(4).fill(0).map((_,i) => (
                <div key={i} className="skeleton" style={{ height:72, marginBottom:6 }}/>
              ))
            ) : sessions.length === 0 ? (
              <div style={{ padding:"32px 16px", textAlign:"center" }}>
                <div style={{ fontSize:36, marginBottom:12 }}>📭</div>
                <p style={{ color:"var(--text-3)", fontSize:12, marginBottom:16 }}>
                  No interviews yet
                </p>
                <button className="btn-ghost" style={{ fontSize:12, padding:"8px 16px" }}
                  onClick={() => { window.location.href="/upload"; }}>
                  Start First Interview →
                </button>
              </div>
            ) : sessions.map(s => {
              const sc  = overall(s);
              const sel = selectedId === s._id;
              const co  = s.company || "general";
              const cc  = COMPANY_COLORS[co] || "#64748b";
              return (
                <button key={s._id} onClick={() => loadSession(s._id)} style={{
                  width:"100%", textAlign:"left", padding:"12px", borderRadius:12, marginBottom:4,
                  background: sel ? "var(--green-dim)" : "transparent",
                  border:`1px solid ${sel ? "var(--green-border)" : "transparent"}`,
                  cursor:"pointer", transition:"all 0.2s",
                }}
                  onMouseEnter={e => { if(!sel)(e.currentTarget as HTMLButtonElement).style.background="var(--glass-inner)"; }}
                  onMouseLeave={e => { if(!sel)(e.currentTarget as HTMLButtonElement).style.background="transparent"; }}
                >
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{
                      fontSize:12, fontWeight:700,
                      color:sel?"var(--text)":"var(--text-2)",
                      overflow:"hidden", textOverflow:"ellipsis",
                      whiteSpace:"nowrap", maxWidth:130,
                    }}>
                      {getName(s)}
                    </span>
                    <span style={{
                      fontSize:11, fontWeight:800,
                      color:sc>=7?"var(--green)":sc>=5?"var(--amber)":"var(--red)",
                    }}>{sc}/10</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                    <span style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:`${cc}15`, color:cc, fontWeight:700 }}>
                      {co.charAt(0).toUpperCase()+co.slice(1)}
                    </span>
                    <span style={{ fontSize:10, color:"var(--text-3)", fontFamily:"'JetBrains Mono',monospace" }}>
                      {fmt(s.createdAt)}
                    </span>
                  </div>
                  <Sparkline
                    data={s.scores?.map((sc:any)=>((sc.technical||0)+(sc.communication||0)+(sc.confidence||0))/3)||[]}
                    color={sc>=7?"var(--green)":sc>=5?"var(--amber)":"var(--red)"}
                  />
                </button>
              );
            })}
          </div>
        </aside>

        {/* MAIN */}
        <div className="dashboard-main" style={{ flex:1, overflowY:"auto", padding:"28px 32px" }}>

          {/* No session selected — overview */}
          {!selectedId && (
            <div>
              <div style={{ marginBottom:28 }}>
                <h1 style={{ fontWeight:900, fontSize:26, letterSpacing:"-0.03em", marginBottom:6 }}>
                  Welcome back,{" "}
                  <span className="gradient-text">
                    {auth?.user?.name?.split(" ")[0] || "there"}
                  </span>{" "}👋
                </h1>
                <p style={{ color:"var(--text-2)", fontSize:14 }}>
                  Your PrepMind AI interview performance overview.
                </p>
              </div>

              {/* Stats grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:16, marginBottom:28 }}>
                <StatCard icon="🎯" label="Total Sessions"  value={totalSessions} sub="Interviews completed"/>
                <StatCard icon="📊" label="Avg Score"       value={avgAll>0?`${avgAll}/10`:"—"} sub="Across all sessions" color="var(--cyan)"/>
                <StatCard icon="🏆" label="Best Score"      value={bestScore>0?`${bestScore}/10`:"—"} sub="Personal best" color="var(--violet)"/>
                <StatCard icon="🔥" label="This Week"       value={thisWeek} sub="Last 7 days" color="var(--amber)"/>
              </div>

              {/* Score trend line chart */}
              {trendData.length >= 2 && (
                <div className="glass-card" style={{ padding:"24px 28px", marginBottom:24 }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
                    <div>
                      <p className="label-mono" style={{ marginBottom:4 }}>Score Trend</p>
                      <p style={{ fontSize:11, color:"var(--text-3)" }}>
                        Last {trendData.length} interviews
                      </p>
                    </div>
                    <div style={{ display:"flex", gap:20 }}>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontWeight:900, fontSize:22, color:"var(--green)" }}>
                          {trendData[trendData.length-1].value}/10
                        </div>
                        <div className="label-mono">Latest</div>
                      </div>
                      {improvement !== null && (
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontWeight:900, fontSize:22, color:improvement>=0?"var(--green)":"var(--red)" }}>
                            {improvement >= 0 ? "+" : ""}{improvement}
                          </div>
                          <div className="label-mono">Improvement</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <LineChart data={trendData} height={110}/>
                </div>
              )}

              {/* Company breakdown */}
              {totalSessions > 0 && (() => {
                const companyCount: Record<string,{ count:number; totalScore:number }> = {};
                sessions.forEach(s => {
                  const co = s.company || "general";
                  if (!companyCount[co]) companyCount[co] = { count:0, totalScore:0 };
                  companyCount[co].count++;
                  companyCount[co].totalScore += overall(s);
                });
                const entries = Object.entries(companyCount)
                  .sort((a,b) => b[1].count - a[1].count)
                  .slice(0,5);
                if (entries.length === 0) return null;
                return (
                  <div className="glass-card" style={{ padding:"20px 24px", marginBottom:24 }}>
                    <p className="label-mono" style={{ marginBottom:16 }}>Sessions by Company</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {entries.map(([co, info]) => {
                        const coAvg  = Math.round((info.totalScore/info.count)*10)/10;
                        const coColor = COMPANY_COLORS[co] || "#64748b";
                        const coLabel = co.charAt(0).toUpperCase()+co.slice(1);
                        return (
                          <div key={co} style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <span style={{ fontSize:12, fontWeight:700, color:coColor, minWidth:90 }}>{coLabel}</span>
                            <div style={{ flex:1, height:6, background:"var(--glass-inner)", borderRadius:999, overflow:"hidden" }}>
                              <div style={{
                                height:"100%", borderRadius:999,
                                background:coColor,
                                width:`${(info.count/totalSessions)*100}%`,
                                transition:"width 0.8s ease",
                              }}/>
                            </div>
                            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"var(--text-3)", minWidth:50, textAlign:"right" }}>
                              {info.count} · {coAvg}/10
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* AI Recommendations */}
              {totalSessions > 0 && (
                <div className="glass-green" style={{ padding:"20px 24px", marginBottom:24 }}>
                  <p className="label-accent" style={{ marginBottom:12 }}>
                    🤖 PrepMind AI Recommendations
                  </p>
                  {avgAll < 5 && (
                    <p style={{ fontSize:13, color:"var(--text-2)", marginBottom:8 }}>
                      · Focus on the STAR method — Situation, Task, Action, Result in every answer.
                    </p>
                  )}
                  {avgAll >= 5 && avgAll < 7 && (
                    <p style={{ fontSize:13, color:"var(--text-2)", marginBottom:8 }}>
                      · Good foundation! Try harder difficulty levels to push your score higher.
                    </p>
                  )}
                  {avgAll >= 7 && (
                    <p style={{ fontSize:13, color:"var(--text-2)", marginBottom:8 }}>
                      · Excellent scores! Try company-specific modes (Google, Amazon) for a real challenge.
                    </p>
                  )}
                  <p style={{ fontSize:13, color:"var(--text-2)", marginBottom:8 }}>
                    · Aim for 3 sessions per week to build interview muscle memory.
                  </p>
                  {totalSessions < 3 && (
                    <p style={{ fontSize:13, color:"var(--text-2)" }}>
                      · Complete at least 3 sessions to unlock your score trend chart.
                    </p>
                  )}
                  {improvement !== null && improvement > 0 && (
                    <p style={{ fontSize:13, color:"var(--green)", fontWeight:600 }}>
                      · 🎉 You improved by +{improvement} points — keep the momentum going!
                    </p>
                  )}
                </div>
              )}

              {/* Empty state */}
              {totalSessions === 0 && (
                <div style={{ textAlign:"center", padding:"60px 0" }}>
                  <div style={{ fontSize:56, marginBottom:20 }}>🎯</div>
                  <h2 style={{ fontWeight:800, fontSize:22, marginBottom:10 }}>
                    Start your first interview
                  </h2>
                  <p style={{ color:"var(--text-2)", fontSize:14, marginBottom:28 }}>
                    Upload your resume and let PrepMind AI generate personalised questions.
                  </p>
                  <button className="btn-primary" style={{ padding:"14px 36px", fontSize:15 }}
                    onClick={() => { window.location.href="/upload"; }}>
                    Start Interview →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Session selected */}
          {selectedId && (
            <div>
              {loadingSel ? (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:80 }}/>)}
                </div>
              ) : selected ? (
                <div className="anim-fade-in">

                  {/* Header */}
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                        <h2 style={{ fontWeight:900, fontSize:22, letterSpacing:"-0.025em" }}>
                          {getName(selected)}
                        </h2>
                        {selected.company && (
                          <span className="badge" style={{
                            background:`${COMPANY_COLORS[selected.company]||"#64748b"}15`,
                            border:`1px solid ${COMPANY_COLORS[selected.company]||"#64748b"}30`,
                            color:COMPANY_COLORS[selected.company]||"#64748b",
                            fontSize:11,
                          }}>
                            {selected.company.charAt(0).toUpperCase()+selected.company.slice(1)}
                          </span>
                        )}
                        {selected.difficulty && (
                          <span className="badge" style={{
                            background:`${DIFF_COLORS[selected.difficulty]||"#f59e0b"}15`,
                            border:`1px solid ${DIFF_COLORS[selected.difficulty]||"#f59e0b"}30`,
                            color:DIFF_COLORS[selected.difficulty]||"#f59e0b",
                            fontSize:11,
                          }}>
                            {selected.difficulty.charAt(0).toUpperCase()+selected.difficulty.slice(1)}
                          </span>
                        )}
                      </div>
                      <p style={{ color:"var(--text-3)", fontSize:12, fontFamily:"'JetBrains Mono',monospace" }}>
                        {selected.createdAt
                          ? new Date(selected.createdAt).toLocaleDateString("en-IN",{ weekday:"long", day:"numeric", month:"long", year:"numeric" })
                          : ""}
                      </p>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button className="btn-ghost" style={{ fontSize:12, padding:"8px 14px" }}
                        onClick={() => { window.location.href=`/results?sessionId=${selectedId}`; }}>
                        Full Results →
                      </button>
                      <button className="btn-primary" style={{ fontSize:12, padding:"8px 16px" }}
                        onClick={() => { window.location.href="/upload"; }}>
                        New Interview +
                      </button>
                    </div>
                  </div>

                  {/* Score rings row */}
                  <div style={{ display:"flex", gap:16, marginBottom:20, flexWrap:"wrap" }}>
                    {[
                      { label:"Overall",       val:overall(selected),            color:"var(--green)"  },
                      { label:"Technical",     val:avg(selected,"technical"),     color:"var(--violet)" },
                      { label:"Communication", val:avg(selected,"communication"), color:"var(--cyan)"   },
                      { label:"Confidence",    val:avg(selected,"confidence"),    color:"var(--amber)"  },
                    ].map(s => (
                      <div key={s.label} className="glass-card" style={{ flex:1, minWidth:90, padding:"16px 12px", textAlign:"center", borderRadius:16 }}>
                        <MiniRing score={s.val} color={s.color}/>
                        <p className="label-mono" style={{ marginTop:8 }}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Sub-tabs */}
                  <div className="dashboard-tabs" style={{ display:"flex", gap:4, marginBottom:20, background:"var(--glass-inner)", padding:4, borderRadius:14, border:"1px solid var(--border)" }}>
                    {(["overview","answers","plan"] as const).map(t => (
                      <button key={t} onClick={() => setActiveTab(t)} style={{
                        flex:1, padding:"8px", borderRadius:10,
                        fontWeight:600, fontSize:12, cursor:"pointer",
                        border:"none", fontFamily:"'Inter',sans-serif",
                        background:activeTab===t?"var(--glass)":"transparent",
                        color:      activeTab===t?"var(--text)":"var(--text-2)",
                        transition:"all 0.2s",
                        boxShadow:  activeTab===t?"0 2px 8px rgba(0,0,0,0.3)":"none",
                      }}>
                        {{ overview:"📊 Overview", answers:"🔍 Answers", plan:"📚 Study Plan" }[t]}
                      </button>
                    ))}
                  </div>

                  {/* Tab: Overview */}
                  {activeTab === "overview" && (
                    <div className="anim-fade-in" style={{ display:"flex", flexDirection:"column", gap:14 }}>
                      {selected.scores?.length > 0 && (
                        <div className="glass-card" style={{ padding:"20px 24px" }}>
                          <p className="label-mono" style={{ marginBottom:16 }}>Per-Question Scores</p>
                          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                            {selected.scores.map((sc:any, i:number) => {
                              const qa = Math.round(((sc.technical||0)+(sc.communication||0)+(sc.confidence||0))/3*10)/10;
                              return (
                                <div key={i}>
                                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                                    <span style={{ fontSize:12, color:"var(--text-2)" }}>Question {i+1}</span>
                                    <span style={{
                                      fontFamily:"'JetBrains Mono',monospace", fontSize:11,
                                      color:qa>=7?"var(--green)":qa>=5?"var(--amber)":"var(--red)",
                                      fontWeight:700,
                                    }}>{qa}/10</span>
                                  </div>
                                  <div style={{ display:"flex", gap:6 }}>
                                    {[
                                      {val:sc.technical||0,     color:"var(--violet)", label:"T"},
                                      {val:sc.communication||0, color:"var(--cyan)",   label:"C"},
                                      {val:sc.confidence||0,    color:"var(--green)",  label:"Cf"},
                                    ].map(b => (
                                      <div key={b.label} style={{ flex:1 }}>
                                        <div style={{ height:5, background:"var(--glass-inner)", borderRadius:999, overflow:"hidden", marginBottom:2 }}>
                                          <div style={{ height:"100%", borderRadius:999, background:b.color, width:`${(b.val/10)*100}%` }}/>
                                        </div>
                                        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"var(--text-3)" }}>
                                          {b.label}:{b.val}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {selected.weakAreas?.length > 0 && (
                        <div className="glass-card" style={{ padding:"16px 20px" }}>
                          <p className="label-mono" style={{ marginBottom:10 }}>Focus Areas</p>
                          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                            {selected.weakAreas.map((a:string, i:number) => (
                              <span key={i} className="badge badge-amber">{a.slice(0,55)}{a.length>55?"…":""}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab: Answers */}
                  {activeTab === "answers" && (
                    <div className="anim-fade-in" style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      {selected.questions?.map((q:string, i:number) => (
                        <div key={i} className="glass-card" style={{ padding:"16px 20px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                            <div className="badge badge-green">
                              <span className="label-accent">Q{i+1}</span>
                            </div>
                            {selected.scores?.[i] && (() => {
                              const qa = Math.round(((selected.scores[i].technical||0)+(selected.scores[i].communication||0)+(selected.scores[i].confidence||0))/3*10)/10;
                              return (
                                <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:qa>=7?"var(--green)":qa>=5?"var(--amber)":"var(--red)", fontWeight:700 }}>
                                  {qa}/10
                                </span>
                              );
                            })()}
                          </div>
                          <p style={{ fontSize:13, fontWeight:600, lineHeight:1.6, marginBottom:10 }}>{q}</p>
                          {selected.answers?.[i] && (
                            <div style={{ padding:"10px 12px", borderRadius:10, background:"var(--glass-inner)", marginBottom:10 }}>
                              <p className="label-mono" style={{ marginBottom:4 }}>Your Answer</p>
                              <p style={{ fontSize:12, color:"var(--text-2)", lineHeight:1.65 }}>{selected.answers[i]}</p>
                            </div>
                          )}
                          {selected.scores?.[i] && (
                            <div style={{ display:"flex", gap:8 }}>
                              {[
                                {label:"Technical",     val:selected.scores[i].technical||0,     color:"var(--violet)"},
                                {label:"Communication", val:selected.scores[i].communication||0, color:"var(--cyan)"},
                                {label:"Confidence",    val:selected.scores[i].confidence||0,    color:"var(--green)"},
                              ].map(s => (
                                <div key={s.label} style={{ flex:1, padding:"8px 6px", textAlign:"center", background:"var(--glass-inner)", borderRadius:10 }}>
                                  <div style={{ fontWeight:800, fontSize:15, color:s.color }}>{s.val}/10</div>
                                  <div className="label-mono" style={{ marginTop:2 }}>{s.label}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {(!selected.questions || selected.questions.length === 0) && (
                        <div className="glass-card" style={{ padding:"32px", textAlign:"center" }}>
                          <p style={{ color:"var(--text-2)" }}>No answer data found.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab: Plan */}
                  {activeTab === "plan" && (
                    <div className="anim-fade-in">
                      {selected.studyPlan ? (
                        typeof selected.studyPlan === "object" && Array.isArray(selected.studyPlan.days) ? (
                          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                            {selected.studyPlan.days.map((d:any) => (
                              <div key={d.day} className="glass-card" style={{ padding:"14px 18px", display:"flex", gap:14, alignItems:"flex-start" }}>
                                <div style={{
                                  width:32, height:32, borderRadius:9,
                                  background:"var(--green-dim)",
                                  border:"1px solid var(--green-border)",
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                  fontFamily:"'JetBrains Mono',monospace", fontSize:12,
                                  fontWeight:800, color:"var(--green)", flexShrink:0,
                                }}>{d.day}</div>
                                <div>
                                  <p style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>{d.topic}</p>
                                  <p style={{ fontSize:11, color:"var(--text-3)", marginBottom:2 }}>
                                    <span style={{ color:"var(--text-2)" }}>Study:</span> {d.study}
                                  </p>
                                  <p style={{ fontSize:11, color:"var(--text-3)", marginBottom:2 }}>
                                    <span style={{ color:"var(--text-2)" }}>Resource:</span> {d.resource}
                                  </p>
                                  <p style={{ fontSize:11, color:"var(--text-3)" }}>
                                    <span style={{ color:"var(--text-2)" }}>Practice:</span> {d.practice}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {selected.studyPlan.motivation && (
                              <div className="glass-green" style={{ padding:"12px 16px", textAlign:"center" }}>
                                <p style={{ fontSize:13, fontWeight:600, color:"var(--green)" }}>
                                  {selected.studyPlan.motivation}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p style={{ fontSize:13, color:"var(--text-2)", whiteSpace:"pre-wrap" }}>
                            {String(selected.studyPlan)}
                          </p>
                        )
                      ) : (
                        <div className="glass-card" style={{ padding:"32px", textAlign:"center" }}>
                          <p style={{ color:"var(--text-2)", marginBottom:14 }}>No study plan yet.</p>
                          <button className="btn-ghost"
                            onClick={() => { window.location.href=`/results?sessionId=${selectedId}`; }}>
                            View Full Results →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .dashboard-layout { flex-direction: column !important; overflow: visible !important; }
          .dashboard-sidebar { width: 100% !important; max-height: 220px; border-right: 0 !important; border-bottom: 1px solid var(--border); }
          .dashboard-main { width: 100%; overflow: visible !important; padding: 24px 20px !important; }
        }

        @media (max-width: 560px) {
          .dashboard-nav { min-height: 58px; height: auto; padding: 10px 14px; gap: 8px; }
          .dashboard-nav-actions { gap: 6px !important; margin-left: auto; }
          .dashboard-nav-actions > img,
          .dashboard-nav-actions > span,
          .dashboard-nav-actions .btn-ghost { display: none; }
          .dashboard-nav-actions .btn-primary { padding: 8px 10px !important; font-size: 11px !important; }
          .dashboard-main { padding: 20px 14px !important; }
          .dashboard-tabs { overflow-x: auto; scrollbar-width: none; }
          .dashboard-tabs::-webkit-scrollbar { display: none; }
          .dashboard-tabs button { min-width: max-content; padding-left: 10px !important; padding-right: 10px !important; }
        }
      `}</style>
    </div>
  );
}

export default function DashboardPage() {
  return <Suspense><DashboardContent/></Suspense>;
}
