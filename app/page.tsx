"use client";
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => { setMounted(true); }, []);

  return (
    <main className="min-h-screen bg-[#060809] text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,150,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,150,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/6 rounded-full blur-[150px] pointer-events-none" />

      {/* NAVBAR */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="text-black font-black text-base">P</span>
          </div>
          <span className="font-black text-xl tracking-tight">PrepMind <span className="text-emerald-400">AI</span></span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How it works", "Companies"].map(l => (
            <span key={l} onClick={() => document.getElementById(l.toLowerCase().replace(/ /g,"-"))?.scrollIntoView({behavior:"smooth"})}
              className="text-sm text-zinc-500 hover:text-white cursor-pointer transition-colors font-medium">{l}</span>
          ))}
        </div>

        {/* Auth area */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <img src={session.user?.image || ""} alt="" className="w-8 h-8 rounded-full border border-white/10" />
              <span className="text-sm text-zinc-400 hidden md:block">{session.user?.name?.split(" ")[0]}</span>
              <button onClick={() => { window.location.href = "/upload"; }}
                className="px-4 py-2 bg-emerald-500 text-black text-sm font-bold rounded-xl hover:bg-emerald-400 transition-all">
                Dashboard →
              </button>
              <button onClick={() => signOut()} className="text-xs text-zinc-700 hover:text-zinc-400 transition-colors hidden md:block">Sign out</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => signIn("google", { callbackUrl: "/" })}
                className="hidden md:flex items-center gap-2 px-4 py-2 border border-white/8 rounded-xl text-sm text-zinc-400 hover:text-white hover:border-white/15 transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button onClick={() => signIn("github", { callbackUrl: "/" })}
                className="hidden md:flex items-center gap-2 px-4 py-2 border border-white/8 rounded-xl text-sm text-zinc-400 hover:text-white hover:border-white/15 transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>
              <button onClick={() => { window.location.href = "/sign-in"; }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-sm font-bold rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20 hover:scale-105">
                Get Started →
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20">
        <div className={`transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/25 bg-emerald-500/8 text-emerald-400 text-xs font-bold mb-10 tracking-wide uppercase">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Powered by Gemini 2.5 Flash AI
          </div>
        </div>

        <h1 className={`font-black tracking-tight mb-8 transition-all duration-1000 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ fontSize: "clamp(3rem, 8vw, 7rem)", lineHeight: 1.05, fontFamily: "'Geist', system-ui, sans-serif" }}>
          Your AI Interview
          <br />
          <span style={{
            background: "linear-gradient(135deg, #34d399, #06b6d4, #34d399)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shimmer 4s ease-in-out infinite"
          }}>
            Coach is Here.
          </span>
        </h1>

        <p className={`text-zinc-400 max-w-xl mb-12 transition-all duration-1000 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", lineHeight: 1.7 }}>
          Upload your resume. Get 6 smart questions tailored to your skills. Answer by voice or text. Get scored and receive a personalized study plan — all in minutes.
        </p>

        <div className={`flex flex-col sm:flex-row gap-4 mb-20 transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <button onClick={() => { window.location.href = session ? "/upload" : "/sign-in"; }}
            className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black rounded-2xl hover:from-emerald-400 hover:to-teal-400 transition-all shadow-2xl shadow-emerald-500/30 hover:scale-105 hover:shadow-emerald-500/50"
            style={{ fontSize: "1.1rem" }}>
            {session ? "Start Your Interview →" : "Try Free — No Login Needed →"}
          </button>
          {!session && (
            <button onClick={() => { window.location.href = "/sign-in"; }}
              className="px-10 py-4 border border-white/8 text-zinc-300 font-semibold rounded-2xl hover:border-white/20 hover:bg-white/3 transition-all"
              style={{ fontSize: "1.1rem" }}>
              Sign In
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className={`flex flex-wrap justify-center gap-10 transition-all duration-1000 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {[
            { value: "6", label: "Smart Questions" },
            { value: "3", label: "Score Metrics" },
            { value: "7-Day", label: "Study Plan" },
            { value: "100%", label: "Resume-Based" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-black text-3xl" style={{ background: "linear-gradient(135deg, #34d399, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.value}</div>
              <div className="text-zinc-600 text-xs mt-1 font-medium tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SIGN IN PANEL (only if not logged in) */}
      {!session && (
        <section className="relative z-10 px-6 pb-20">
          <div className="max-w-sm mx-auto p-8 rounded-3xl border border-white/6 bg-white/2 backdrop-blur-sm">
            <h2 className="text-xl font-black text-center mb-2">Sign in to save progress</h2>
            <p className="text-zinc-600 text-xs text-center mb-6">Your sessions, scores and study plans are saved to your account</p>
            <button onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/6 transition-all mb-3 text-sm font-semibold text-white">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button onClick={() => signIn("github", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/6 transition-all mb-4 text-sm font-semibold text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
            <button onClick={() => { window.location.href = "/upload"; }}
              className="w-full py-3 text-zinc-600 text-xs hover:text-zinc-400 transition-colors">
              Skip — Continue as Guest
            </button>
          </div>
        </section>
      )}

      {/* FEATURES */}
      <section id="features" className="relative z-10 px-6 pb-24">
        <div className="text-center mb-16">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">Why PrepMind AI</p>
          <h2 className="font-black" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Everything you need to
            <br /><span style={{ background: "linear-gradient(135deg, #34d399, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>crack any interview</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {[
            { icon: "📄", title: "Resume-Based Questions", desc: "AI reads your actual resume and asks questions specific to YOUR skills, projects and experience — not generic ones.", badge: "Smart" },
            { icon: "💻", title: "DSA + Coding Questions", desc: "Get real DSA questions relevant to your tech stack. Arrays, trees, graphs — tailored to your level.", badge: "New" },
            { icon: "🎤", title: "Voice Answers", desc: "Speak your answers naturally. Gemini AI transcribes and evaluates your communication in real time.", badge: null },
            { icon: "📊", title: "3-Metric Scoring", desc: "Scored on Communication clarity, Technical accuracy, and Confidence — just like a real interviewer.", badge: null },
            { icon: "📚", title: "7-Day Study Plan", desc: "AI pinpoints your exact weak areas and builds a day-by-day study roadmap with free resources.", badge: "Personalized" },
            { icon: "🔐", title: "Saved Sessions", desc: "Sign in with Google or GitHub and all your interview sessions, scores and plans are saved forever.", badge: null },
          ].map(f => (
            <div key={f.title} className="p-6 rounded-2xl border border-white/5 bg-white/1 hover:border-emerald-500/20 hover:bg-emerald-500/3 transition-all duration-300 group hover:-translate-y-1">
              {f.badge && <span className="inline-block mb-3 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/15 tracking-wide">{f.badge}</span>}
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">{f.icon}</div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative z-10 px-6 pb-24">
        <div className="text-center mb-16">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">Process</p>
          <h2 className="font-black" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            From resume to offer
            <br /><span style={{ background: "linear-gradient(135deg, #34d399, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>in 4 simple steps</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { step: "01", title: "Upload Resume", desc: "Drop your PDF. AI extracts your skills, projects and experience in seconds.", icon: "📄" },
            { step: "02", title: "Get 6 Smart Questions", desc: "Personalized technical, DSA and behavioral questions based on your resume.", icon: "🧠" },
            { step: "03", title: "Answer by Voice or Text", desc: "Speak or type your answers. The AI listens and understands both.", icon: "🎤" },
            { step: "04", title: "Scores + Study Plan", desc: "Get detailed scores and a personalized 7-day improvement plan.", icon: "🏆" },
          ].map((item, idx) => (
            <div key={item.step} className="relative p-6 rounded-2xl border border-white/5 bg-white/1 hover:border-emerald-500/15 transition-all group hover:-translate-y-1">
              {idx < 3 && <div className="hidden md:block absolute top-10 right-[-13px] w-6 h-px bg-emerald-500/15 z-10" />}
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
              <div className="text-emerald-400 text-xs font-black font-mono mb-2 tracking-widest">{item.step}</div>
              <h3 className="font-bold text-white mb-2 text-sm">{item.title}</h3>
              <p className="text-zinc-600 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPANIES */}
      <section id="companies" className="relative z-10 px-6 pb-24">
        <p className="text-center text-zinc-700 text-xs uppercase tracking-widest mb-6">Practice for top companies</p>
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {["Google", "Amazon", "Microsoft", "TCS", "Infosys", "Wipro", "Meta", "Flipkart", "Accenture", "Cognizant"].map(c => (
            <span key={c} className="px-4 py-2 rounded-xl border border-white/5 text-zinc-600 text-sm hover:border-emerald-500/20 hover:text-emerald-400 transition-all cursor-default">{c}</span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-2xl mx-auto text-center p-12 rounded-3xl border border-emerald-500/10 bg-gradient-to-br from-emerald-500/4 to-teal-500/4">
          <h2 className="font-black mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>Ready to ace your next interview?</h2>
          <p className="text-zinc-500 mb-8 text-sm">Free to use. No credit card. Start in 30 seconds.</p>
          <button onClick={() => { window.location.href = session ? "/upload" : "/sign-in"; }}
            className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black rounded-2xl hover:from-emerald-400 hover:to-teal-400 transition-all shadow-xl shadow-emerald-500/25 hover:scale-105 text-lg">
            Start Free →
          </button>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/4 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-xs">P</span>
          </div>
          <span className="text-zinc-600 text-sm font-bold">PrepMind AI</span>
        </div>
        <span className="text-zinc-800 text-xs">Built with Next.js + Gemini 2.5 Flash · 2026</span>
      </footer>

      <style>{`
        @keyframes shimmer {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </main>
  );
}