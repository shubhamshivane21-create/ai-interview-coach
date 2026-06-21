"use client";
import { useState, useEffect, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";

interface Session {
  _id: string;
  createdAt: string;
  resumeText: string;
  scores: { communication: number; technical: number; confidence: number }[];
  questions: string[];
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "unauthenticated") { window.location.href = "/sign-in"; return; }
    if (status === "authenticated") fetchSessions();
  }, [status]);

  useEffect(() => {
    const sid = searchParams.get("sessionId");
    if (sid) loadSession(sid);
  }, [searchParams]);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch {}
    setLoading(false);
  };

  const loadSession = async (id: string) => {
    setSelectedId(id);
    setLoadingSession(true);
    try {
      const res = await fetch(`/api/results?sessionId=${id}`);
      const data = await res.json();
      setSelectedSession(data.session);
    } catch {}
    setLoadingSession(false);
  };

  const avgScore = (s: any, key: string) => {
    if (!s?.scores?.length) return 0;
    return Math.round((s.scores.reduce((sum: number, sc: any) => sum + (sc?.[key]||0), 0) / s.scores.length) * 10) / 10;
  };

  const getResumeName = (s: Session) => {
    try { return JSON.parse(s.resumeText)?.name || "Interview"; } catch { return "Interview"; }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });

  if (status === "loading") return (
    <main className="min-h-screen bg-[#060809] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
    </main>
  );

  return (
    <main className="min-h-screen bg-[#060809] text-white flex flex-col">
      {/* Top nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between shrink-0">
        <div onClick={() => { window.location.href = "/"; }} className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
            <span className="text-black font-black text-sm">P</span>
          </div>
          <span className="font-black text-base">PrepMind <span className="text-emerald-400">AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          {session?.user?.image && <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" />}
          <span className="text-zinc-400 text-sm hidden md:block">{session?.user?.name}</span>
          <button onClick={() => { window.location.href = "/upload"; }}
            className="px-4 py-2 bg-emerald-500 text-black text-xs font-bold rounded-xl hover:bg-emerald-400 transition-all">
            New Interview
          </button>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-xs text-zinc-600 hover:text-zinc-400">Sign out</button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/5 flex flex-col shrink-0 overflow-hidden">
          <div className="px-4 py-4 border-b border-white/5">
            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Interview History</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-14 bg-white/3 rounded-xl animate-pulse" />)}
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-zinc-700 text-xs mt-8">No interviews yet</p>
                <button onClick={() => { window.location.href = "/upload"; }}
                  className="mt-4 px-4 py-2 bg-emerald-500/10 text-emerald-400 text-xs rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                  Start First Interview
                </button>
              </div>
            ) : (
              <div className="p-2">
                {sessions.map(s => {
                  const comm = avgScore(s, "communication");
                  const tech = avgScore(s, "technical");
                  const conf = avgScore(s, "confidence");
                  const overall = Math.round(((comm+tech+conf)/3)*10)/10;
                  return (
                    <button key={s._id} onClick={() => loadSession(s._id)}
                      className={`w-full text-left p-3 rounded-xl mb-1 transition-all ${selectedId === s._id ? "bg-emerald-500/10 border border-emerald-500/20" : "hover:bg-white/3 border border-transparent"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white truncate">{getResumeName(s)}</span>
                        <span className={`text-xs font-bold ml-2 shrink-0 ${overall >= 7 ? "text-emerald-400" : overall >= 5 ? "text-yellow-400" : "text-red-400"}`}>{overall}/10</span>
                      </div>
                      <span className="text-[10px] text-zinc-600">{formatDate(s.createdAt)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-8">
          {!selectedId ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-xl font-black mb-2">Welcome, {session?.user?.name?.split(" ")[0]}!</h2>
              <p className="text-zinc-600 text-sm mb-8 max-w-sm">Select a past interview from the sidebar to review your performance, or start a new one.</p>
              <button onClick={() => { window.location.href = "/upload"; }}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold rounded-2xl hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20">
                Start New Interview →
              </button>
              <div className="mt-12 grid grid-cols-3 gap-6 max-w-sm">
                {[
                  {label:"Total Sessions", value: sessions.length},
                  {label:"Avg Score", value: sessions.length ? (sessions.reduce((acc, s) => {
                    const c = avgScore(s,"communication"), t = avgScore(s,"technical"), cf = avgScore(s,"confidence");
                    return acc + (c+t+cf)/3;
                  }, 0) / sessions.length).toFixed(1) + "/10" : "—"},
                  {label:"Best Score", value: sessions.length ? Math.max(...sessions.map(s => {
                    const c = avgScore(s,"communication"), t = avgScore(s,"technical"), cf = avgScore(s,"confidence");
                    return (c+t+cf)/3;
                  })).toFixed(1) + "/10" : "—"},
                ].map(stat => (
                  <div key={stat.label} className="text-center p-4 rounded-2xl border border-white/5 bg-white/2">
                    <div className="text-2xl font-black text-emerald-400">{stat.value}</div>
                    <div className="text-zinc-600 text-[10px] mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : loadingSession ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : selectedSession ? (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black">Interview Review</h2>
                  <p className="text-zinc-600 text-sm">{formatDate(selectedSession.createdAt)}</p>
                </div>
                <button onClick={() => { window.location.href = `/results?sessionId=${selectedId}`; }}
                  className="px-4 py-2 border border-white/8 text-zinc-400 text-xs rounded-xl hover:border-emerald-500/30 hover:text-emerald-400 transition-all">
                  Full Results →
                </button>
              </div>

              {/* Score cards */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                {[
                  {label:"Overall", value: Math.round(((avgScore(selectedSession,"communication")+avgScore(selectedSession,"technical")+avgScore(selectedSession,"confidence"))/3)*10)/10, color:"text-emerald-400"},
                  {label:"Comm", value: avgScore(selectedSession,"communication"), color:"text-blue-400"},
                  {label:"Tech", value: avgScore(selectedSession,"technical"), color:"text-purple-400"},
                  {label:"Conf", value: avgScore(selectedSession,"confidence"), color:"text-emerald-400"},
                ].map(s => (
                  <div key={s.label} className="p-4 rounded-2xl border border-white/5 bg-white/2 text-center">
                    <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-zinc-600 text-[10px] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Questions */}
              {selectedSession.questions?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-3">Questions Asked</h3>
                  <div className="space-y-2">
                    {selectedSession.questions.map((q: string, i: number) => (
                      <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/2">
                        <div className="text-emerald-400 text-[10px] font-mono font-bold mb-1">Q{i+1}</div>
                        <p className="text-sm text-zinc-300">{q}</p>
                        {selectedSession.scores?.[i] && (
                          <div className="flex gap-3 mt-2">
                            <span className="text-[10px] text-blue-400">Comm: {selectedSession.scores[i].communication}/10</span>
                            <span className="text-[10px] text-purple-400">Tech: {selectedSession.scores[i].technical}/10</span>
                            <span className="text-[10px] text-emerald-400">Conf: {selectedSession.scores[i].confidence}/10</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Study plan preview */}
              {selectedSession.studyPlan && (
                <div className="p-5 rounded-2xl border border-emerald-500/15 bg-emerald-500/3">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">📚 Study Plan</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap line-clamp-6">{selectedSession.studyPlan}</p>
                  <button onClick={() => { window.location.href = `/results?sessionId=${selectedId}`; }}
                    className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">View full plan →</button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return <Suspense><DashboardContent /></Suspense>;
}