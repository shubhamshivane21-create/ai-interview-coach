"use client";
import { useState, useEffect } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") { setFile(dropped); setError(""); }
    else setError("Please upload a PDF file only.");
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await fetch("/api/resume", { method: "POST", body: formData });
      const data = await res.json();
      if (data.sessionId) {
        window.location.href = `/interview?sessionId=${data.sessionId}`;
      } else {
        setError(data.error || "Failed to process resume. Try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080C10] text-white">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,200,100,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,200,100,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="fixed top-[-20%] left-[20%] w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />

      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5 backdrop-blur-sm">
        <div onClick={() => { window.location.href = "/"; }} className="flex items-center gap-3 cursor-pointer group">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all">
            <span className="text-black font-black text-sm">P</span>
          </div>
          <span className="font-bold text-lg tracking-tight">PrepMind <span className="text-emerald-400">AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-zinc-500 text-sm">Step 1 of 3</span>
        </div>
      </nav>

      <div className={`relative z-10 flex flex-col items-center justify-center px-6 pt-12 pb-24 transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

        {/* Progress */}
        <div className="w-full max-w-lg mb-10">
          <div className="flex items-center justify-between mb-2">
            {["Upload Resume", "Interview", "Results"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i === 0 ? "bg-emerald-500 border-emerald-500 text-black" : "border-white/15 text-zinc-600"}`}>
                  {i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i === 0 ? "text-emerald-400" : "text-zinc-600"}`}>{s}</span>
                {i < 2 && <div className="w-8 sm:w-16 h-[1px] bg-white/8 ml-2" />}
              </div>
            ))}
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-center mb-3">
          Upload Your <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Resume</span>
        </h1>
        <p className="text-zinc-500 text-center mb-10 max-w-md text-sm leading-relaxed">
          Our AI will analyze your resume and generate 8 personalized interview questions just for you.
        </p>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput")?.click()}
          className={`w-full max-w-lg rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 p-12 ${
            dragging ? "border-emerald-400 bg-emerald-500/10 scale-[1.02]" :
            file ? "border-emerald-500 bg-emerald-500/5" :
            "border-white/10 bg-white/2 hover:border-emerald-500/40 hover:bg-emerald-500/3"
          }`}
        >
          <input id="fileInput" type="file" accept=".pdf" className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f?.type === "application/pdf") { setFile(f); setError(""); }
              else setError("Please upload a PDF file only.");
            }}
          />
          {file ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-emerald-400 font-bold text-lg">{file.name}</p>
              <p className="text-zinc-600 text-sm mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              <p className="text-zinc-700 text-xs mt-3 hover:text-zinc-500 transition-colors">Click to change file</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-white/3 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/8">
                <span className="text-3xl">📄</span>
              </div>
              <p className="text-white font-bold mb-1">Drop your resume here</p>
              <p className="text-zinc-500 text-sm">or click to browse files</p>
              <p className="text-zinc-700 text-xs mt-4">PDF files only &bull; Max 10MB</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 w-full max-w-lg px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <button onClick={handleUpload} disabled={!file || loading}
          className={`mt-6 w-full max-w-lg py-4 font-bold rounded-2xl text-lg transition-all duration-200 ${
            file && !loading
              ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-black hover:from-emerald-400 hover:to-cyan-400 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02]"
              : "bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Analyzing Resume...
            </span>
          ) : "Analyze & Start Interview →"}
        </button>

        {loading && (
          <div className="mt-4 text-center">
            <p className="text-zinc-600 text-sm animate-pulse">AI is reading your resume... This may take 10-15 seconds</p>
            <div className="flex justify-center gap-1 mt-3">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        <p className="mt-8 text-zinc-700 text-xs text-center max-w-sm">
          Your resume is processed securely and never stored permanently. We only extract skills and experience to generate questions.
        </p>
      </div>
    </main>
  );
}