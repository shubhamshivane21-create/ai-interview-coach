"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ResultsContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!sessionId) return;
    fetch(`/api/results?sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((d) => { setSession(d.session); setLoading(false); });
  }, [sessionId]);

  const avgScore = (key: string) => {
    if (!session?.scores?.length) return 0;
    const avg = session.scores.reduce((sum: number, s: any) => sum + (s?.[key] || 0), 0) / session.scores.length;
    return Math.round(avg * 10) / 10;
  };

  if (loading) return (
    <main className="min-h-screen bg-[#080C10] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6" />
        <p className="text-zinc-500 text-sm">Loading your results...</p>
      </div>
    </main>
  );

  const commScore = avgScore("communication");
  const techScore = avgScore("technical");
  const confScore = avgScore("confidence");
  const overallScore = Math.round(((commScore + techScore + confScore) / 3) * 10) / 10;
  const overallPercent = (overallScore / 10) * 100;

  const getGrade = () => {
    if (overallScore >= 8) return { emoji: "🏆", label: "Excellent!", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
    if (overallScore >= 6) return { emoji: "👍", label: "Good Job!", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" };
    if (overallScore >= 4) return { emoji: "📈", label: "Keep Improving", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" };
    return { emoji: "💪", label: "Keep Practicing!", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" };
  };

  const grade = getGrade();

  return (
    <main className="min-h-screen bg-[#080C10] text-white">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,200,100,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,200,100,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="fixed top-[-10%] right-[10%] w-[300px] h-[300px] bg-emerald-500/6 rounded-full blur-[80px] pointer-events-none" />

      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div onClick={() => { window.location.href = "/"; }} className="flex items-center gap-3 cursor-pointer">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center">
            <span className="text-black font-black text-sm">P</span>
          </div>
          <span className="font-bold text-base">PrepMind <span className="text-emerald-400">AI</span></span>
        </div>
        <button onClick={() => { window.location.href = "/upload"; }} className="px-4 py-2 border border-white/8 text-zinc-400 text-xs rounded-xl hover:border-emerald-500/30 hover:text-emerald-400 transition-all">
          New Interview
        </button>
      </nav>

      <div className={`relative z-10 max-w-3xl mx-auto px-6 pt-10 pb-24 transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 text-emerald-400 text-xs font-semibold mb-8">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          Step 3 of 3 — Your Results
        </div>

        <h1 className="text-4xl font-black mb-2">Interview <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Complete!</span></h1>
        <p className="text-zinc-600 mb-8 text-sm">{"Here's your detailed performance analysis and personalized study plan."}</p>

        {/* Overall Score */}
        <div className={`p-8 rounded-2xl border mb-6 text-center ${grade.bg}`}>
          <div className="text-5xl mb-2">{grade.emoji}</div>
          <div className="text-6xl font-black mb-1">
            <span className={grade.color}>{overallScore}</span>
            <span className="text-zinc-700 text-2xl">/10</span>
          </div>
          <p className={`text-lg font-bold mb-4 ${grade.color}`}>{grade.label}</p>
          {/* Progress bar */}
          <div className="w-full max-w-xs mx-auto h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-1000" style={{ width: `${overallPercent}%` }} />
          </div>
          <p className="text-zinc-600 text-xs mt-2">Overall Score</p>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Communication", score: commScore, color: "blue", emoji: "💬", barColor: "bg-blue-400" },
            { label: "Technical", score: techScore, color: "purple", emoji: "⚙️", barColor: "bg-purple-400" },
            { label: "Confidence", score: confScore, color: "emerald", emoji: "🎯", barColor: "bg-emerald-400" },
          ].map((item) => (
            <div key={item.label} className="p-5 rounded-2xl border border-white/6 bg-white/2 text-center group hover:border-white/10 transition-all">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{item.emoji}</div>
              <div className={`text-2xl font-black mb-0.5 ${item.color === "blue" ? "text-blue-400" : item.color === "purple" ? "text-purple-400" : "text-emerald-400"}`}>
                {item.score}
              </div>
              <div className="text-zinc-700 text-[10px] mb-2">{item.label}</div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${item.barColor}`} style={{ width: `${(item.score / 10) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Per-question scores */}
        {session?.scores?.length > 0 && (
          <div className="p-5 rounded-2xl border border-white/6 bg-white/2 mb-6">
            <h2 className="text-sm font-bold text-zinc-400 mb-3 uppercase tracking-widest">Question Breakdown</h2>
            <div className="space-y-2">
              {session.scores.map((score: any, i: number) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="text-zinc-700 w-6 shrink-0">Q{i + 1}</span>
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(score.communication / 10) * 100}%` }} />
                    </div>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(score.technical / 10) * 100}%` }} />
                    </div>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(score.confidence / 10) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-zinc-600 shrink-0">{Math.round(((score.communication + score.technical + score.confidence) / 3) * 10) / 10}/10</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 justify-end">
              {[{label:"Comm",color:"bg-blue-400"},{label:"Tech",color:"bg-purple-400"},{label:"Conf",color:"bg-emerald-400"}].map(l => (
                <div key={l.label} className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${l.color}`}/><span className="text-zinc-700 text-[10px]">{l.label}</span></div>
              ))}
            </div>
          </div>
        )}

        {/* Weak Areas */}
        {session?.weakAreas?.length > 0 && (
          <div className="p-5 rounded-2xl border border-yellow-500/15 bg-yellow-500/3 mb-6">
            <h2 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">⚠️ Areas to Improve</h2>
            <div className="flex flex-wrap gap-2">
              {session.weakAreas.map((area: string, i: number) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-yellow-500/8 border border-yellow-500/15 text-yellow-400 text-xs font-medium">{area}</span>
              ))}
            </div>
          </div>
        )}

        {/* Study Plan */}
        {session?.studyPlan && (
          <div className="p-6 rounded-2xl border border-emerald-500/15 bg-emerald-500/3 mb-8">
            <h2 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">📚 Your Personalized 7-Day Study Plan</h2>
            <div className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{session.studyPlan}</div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => { window.location.href = "/upload"; }} className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold rounded-2xl hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02]">
            Practice Again →
          </button>
          <button onClick={() => { window.location.href = "/"; }} className="px-6 py-4 border border-white/8 rounded-2xl hover:border-emerald-500/30 hover:text-emerald-400 transition-all text-zinc-400 text-sm">
            Home
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return <Suspense><ResultsContent /></Suspense>;
}