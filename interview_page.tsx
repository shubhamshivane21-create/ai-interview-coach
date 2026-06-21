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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!sessionId) return;
    fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then((d) => { setQuestions(d.questions || []); setLoading(false); });
  }, [sessionId]);

  const startRecording = async () => {
    setSttError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Pick a supported MIME type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mr = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size < 1000) {
          setSttError("Recording too short. Please speak longer.");
          return;
        }

        const fd = new FormData();
        // Use .webm or .mp4 extension based on mimeType
        const ext = mimeType.includes("mp4") ? "mp4" : "webm";
        fd.append("audio", blob, `recording.${ext}`);

        try {
          const res = await fetch("/api/stt", { method: "POST", body: fd });
          const data = await res.json();
          if (data.text && data.text.trim()) {
            setAnswer((prev) => prev ? prev + " " + data.text : data.text);
          } else {
            setSttError("Could not understand audio. Please type your answer.");
          }
        } catch {
          setSttError("Voice transcription failed. Please type your answer.");
        }
      };

      mr.start(100); // collect data every 100ms
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch {
      setSttError("Microphone access denied. Please type your answer.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
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
      setTimeout(() => {
        window.location.href = `/results?sessionId=${sessionId}`;
      }, 1500);
    } else {
      setCurrentIndex(currentIndex + 1);
      setAnswer("");
      setSttError("");
    }
    setSubmitting(false);
  };

  if (loading) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Generating your personalized questions...</p>
      </div>
    </main>
  );

  if (done) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-400">Interview Complete!</h2>
        <p className="text-zinc-400 mt-2">Generating your results...</p>
      </div>
    </main>
  );

  const progress = (currentIndex / questions.length) * 100;

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
        <span className="text-zinc-400 text-sm">Question {currentIndex + 1} of {questions.length}</span>
      </nav>

      {/* Progress Bar */}
      <div className="relative z-10 w-full h-1 bg-zinc-800">
        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-12 pb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Step 2 of 3 — Interview Session
        </div>

        {/* Question Card */}
        <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 mb-8">
          <div className="text-green-400 text-xs font-mono font-bold mb-4">
            QUESTION {currentIndex + 1}/{questions.length}
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-white leading-relaxed">
            {questions[currentIndex]}
          </h2>
        </div>

        {/* Answer Area */}
        <div className="mb-6">
          <label className="text-zinc-400 text-sm mb-3 block">Your Answer:</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here, or use the microphone button below..."
            className="w-full h-40 bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-green-500/50 transition-colors"
          />
        </div>

        {sttError && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
            {sttError}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              recording
                ? "bg-red-500 text-white animate-pulse"
                : "border border-zinc-700 text-zinc-300 hover:border-green-500/50"
            }`}
          >
            {recording ? "⏹ Stop Recording" : "🎤 Record Answer"}
          </button>

          <button
            onClick={submitAnswer}
            disabled={!answer.trim() || submitting}
            className="flex-1 py-3 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Evaluating...
              </span>
            ) : currentIndex + 1 >= questions.length ? "Finish Interview →" : "Next Question →"}
          </button>
        </div>

        {recording && (
          <p className="mt-3 text-red-400 text-sm animate-pulse text-center">
            🔴 Recording... Click Stop when done speaking
          </p>
        )}

        {/* Previous scores */}
        {scores.length > 0 && (
          <div className="mt-8 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30">
            <h3 className="text-zinc-400 text-sm font-semibold mb-4">Previous Scores</h3>
            <div className="space-y-2">
              {scores.map((score, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Q{i + 1}</span>
                  <div className="flex gap-4">
                    <span className="text-blue-400">Comm: {score?.communication}/10</span>
                    <span className="text-purple-400">Tech: {score?.technical}/10</span>
                    <span className="text-green-400">Conf: {score?.confidence}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function InterviewPage() {
  return <Suspense><InterviewContent /></Suspense>;
}
