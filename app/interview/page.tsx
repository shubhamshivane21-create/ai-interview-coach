"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function InterviewContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [done, setDone] = useState(false);
  const [sttError, setSttError] = useState("");
  const [sttLoading, setSttLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!sessionId) return;
    fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).then((r) => r.json()).then((d) => { setQuestions(d.questions || []); setLoading(false); });
  }, [sessionId]);

  const startRecording = async () => {
    setSttError(""); setSttLoading(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const mr = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size < 1000) { setSttError("Recording too short. Please speak longer."); return; }
        setSttLoading(true);
        const fd = new FormData();
        fd.append("audio", blob, `recording.${mimeType.includes("mp4") ? "mp4" : "webm"}`);
        try {
          const res = await fetch("/api/stt", { method: "POST", body: fd });
          const data = await res.json();
          if (data.text?.trim()) {
            setAnswer((prev) => prev ? prev + " " + data.text : data.text);
          } else {
            setSttError("Could not understand audio. Please type your answer.");
          }
        } catch { setSttError("Voice transcription failed. Please type your answer."); }
        finally { setSttLoading(false); }
      };
      mr.start(100);
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch { setSttError("Microphone access denied. Please type your answer."); }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setRecording(false); };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    setFadeIn(false);
    const res = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, questionIndex: currentIndex, answer }),
    });
    const data = await res.json();
    const newScores = [...scores, data.score];
    setScores(newScores);
    if (currentIndex + 1 >= questions.length) {
      await fetch("/api/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      setDone(true);
      setTimeout(() => { window.location.href = `/results?sessionId=${sessionId}`; }, 1800);
    } else {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setAnswer(""); setSttError("");
        setFadeIn(true);
      }, 300);
    }
    setSubmitting(false);
  };

  if (loading) return (
    <main className="min-h-screen bg-[#080C10] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6" />
        <p className="text-zinc-500 text-sm">Generating your personalized questions...</p>
        <div className="flex justify-center gap-1 mt-4">
          {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
        </div>
      </div>
    </main>
  );

  if (done) return (
    <main className="min-h-screen bg-[#080C10] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Interview Complete!</h2>
        <p className="text-zinc-500 mt-2 text-sm">Generating your results...</p>
      </div>
    </main>
  );

  const progress = (currentIndex / questions.length) * 100;
  const lastScore = scores[scores.length - 1];

  return (
    <main className="min-h-screen bg-[#080C10] text-white">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,200,100,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,200,100,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div onClick={() => { window.location.href = "/"; }} className="flex items-center gap-3 cursor-pointer group">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center">
            <span className="text-black font-black text-sm">P</span>
          </div>
          <span className="font-bold text-base">PrepMind <span className="text-emerald-400">AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-600 text-xs">Q{currentIndex + 1}/{questions.length}</span>
          <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-10 pb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 text-emerald-400 text-xs font-semibold mb-8">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Step 2 of 3 — Interview Session
        </div>

        {/* Question Card */}
        <div className={`p-8 rounded-2xl border border-white/6 bg-white/2 mb-6 transition-all duration-300 ${fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          <div className="flex items-center justify-between mb-5">
            <span className="text-emerald-400 text-xs font-black font-mono tracking-widest">QUESTION {currentIndex + 1}/{questions.length}</span>
            <span className="text-zinc-700 text-xs">{Math.round(progress)}% complete</span>
          </div>
          <h2 className="text-xl font-bold text-white leading-relaxed">{questions[currentIndex]}</h2>
        </div>

        {/* Last score badge */}
        {lastScore && (
          <div className="flex gap-2 mb-4">
            {[
              { label: "Comm", val: lastScore.communication, color: "text-blue-400" },
              { label: "Tech", val: lastScore.technical, color: "text-purple-400" },
              { label: "Conf", val: lastScore.confidence, color: "text-emerald-400" },
            ].map(s => (
              <div key={s.label} className="flex-1 px-3 py-2 rounded-xl bg-white/2 border border-white/5 text-center">
                <div className={`text-sm font-bold ${s.color}`}>{s.val}/10</div>
                <div className="text-zinc-700 text-[10px]">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Answer */}
        <div className="mb-4">
          <label className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2 block">Your Answer</label>
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here, or use the microphone below..."
            className="w-full h-36 bg-white/2 border border-white/8 rounded-2xl p-4 text-white placeholder-zinc-700 resize-none focus:outline-none focus:border-emerald-500/40 focus:bg-emerald-500/3 transition-all duration-200 text-sm leading-relaxed"
          />
          <div className="flex justify-between mt-1">
            <span className="text-zinc-700 text-xs">{answer.length} chars</span>
            {answer.length > 50 && <span className="text-emerald-600 text-xs">✓ Good length</span>}
          </div>
        </div>

        {sttLoading && (
          <div className="mb-3 px-4 py-2 rounded-xl bg-emerald-500/8 border border-emerald-500/15 text-emerald-400 text-xs flex items-center gap-2">
            <span className="w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin" />
            Transcribing your voice...
          </div>
        )}

        {sttError && (
          <div className="mb-3 px-4 py-2 rounded-xl bg-yellow-500/8 border border-yellow-500/15 text-yellow-400 text-xs">{sttError}</div>
        )}

        <div className="flex gap-3">
          <button onClick={recording ? stopRecording : startRecording}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
              recording ? "bg-red-500/15 border border-red-500/30 text-red-400 animate-pulse" :
              "border border-white/8 text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5"
            }`}
          >
            <span>{recording ? "⏹" : "🎤"}</span>
            {recording ? "Stop" : "Record"}
          </button>

          <button onClick={submitAnswer} disabled={!answer.trim() || submitting}
            className={`flex-1 py-3 font-bold rounded-2xl text-sm transition-all duration-200 ${
              answer.trim() && !submitting
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-black hover:from-emerald-400 hover:to-cyan-400 shadow-lg shadow-emerald-500/20"
                : "bg-white/3 text-zinc-700 cursor-not-allowed border border-white/5"
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Evaluating...
              </span>
            ) : currentIndex + 1 >= questions.length ? "Finish Interview →" : "Next Question →"}
          </button>
        </div>

        {recording && <p className="mt-2 text-red-400 text-xs animate-pulse text-center">🔴 Recording... speak now, click Stop when done</p>}
      </div>
    </main>
  );
}

export default function InterviewPage() {
  return <Suspense><InterviewContent /></Suspense>;
}