"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ResultsContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Loading your results...</p>
      </div>
    </main>
  );

  const commScore = avgScore("communication");
  const techScore = avgScore("technical");
  const confScore = avgScore("confidence");
  const overallScore = Math.round(((commScore + techScore + confScore) / 3) * 10) / 10;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,128,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,128,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-green-500/10">
        <div onClick={() => { window.location.href = "/"; }} className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">AI</span>
          </div>
          <span className="font-bold text-lg">InterviewCoach</span>
        </div>
        <button
          onClick={() => { window.location.href = "/upload"; }}
          className="px-4 py-2 border border-zinc-700 text-sm rounded-lg hover:border-green-500/50 transition-colors"
        >
          New Interview
        </button>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-12 pb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
          Step 3 of 3 — Your Results
        </div>

        <h1 className="text-4xl font-bold mb-2">Interview <span className="text-green-400">Complete!</span></h1>
        <p className="text-zinc-400 mb-10">Here's your detailed performance analysis and personalized study plan.</p>

        {/* Overall Score */}
        <div className="p-8 rounded-2xl border border-green-500/20 bg-green-500/5 mb-8 text-center">
          <div className="text-7xl font-bold text-green-400 mb-2">{overallScore}</div>
          <div className="text-zinc-400 text-sm">/10 Overall Score</div>
          <div className="mt-4 text-lg font-semibold">
            {overallScore >= 8 ? "🏆 Excellent Performance!" : overallScore >= 6 ? "👍 Good Job!" : "💪 Keep Practicing!"}
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Communication", score: commScore, color: "blue", emoji: "💬" },
            { label: "Technical", score: techScore, color: "purple", emoji: "⚙️" },
            { label: "Confidence", score: confScore, color: "green", emoji: "🎯" },
          ].map((item) => (
            <div key={item.label} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 text-center">
              <div className="text-3xl mb-2">{item.emoji}</div>
              <div className={`text-3xl font-bold mb-1 ${item.color === "blue" ? "text-blue-400" : item.color === "purple" ? "text-purple-400" : "text-green-400"}`}>
                {item.score}
              </div>
              <div className="text-zinc-500 text-xs">{item.label}</div>
              <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color === "blue" ? "bg-blue-400" : item.color === "purple" ? "bg-purple-400" : "bg-green-400"}`}
                  style={{ width: `${(item.score / 10) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Weak Areas */}
        {session?.weakAreas?.length > 0 && (
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 mb-8">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span>⚠️</span> Areas to Improve
            </h2>
            <div className="flex flex-wrap gap-2">
              {session.weakAreas.map((area: string, i: number) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Study Plan */}
        {session?.studyPlan && (
          <div className="p-6 rounded-2xl border border-green-500/20 bg-green-500/5 mb-8">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span>📚</span> Your Personalized 7-Day Study Plan
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
              {session.studyPlan}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-4">
          <button
            onClick={() => { window.location.href = "/upload"; }}
            className="flex-1 py-4 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition-all text-lg"
          >
            Practice Again →
          </button>
          <button
            onClick={() => { window.location.href = "/"; }}
            className="px-8 py-4 border border-zinc-700 rounded-xl hover:border-green-500/50 transition-colors"
          >
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
