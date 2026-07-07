"use client";
import { useEffect, useRef, useState } from "react";

export interface LogLine {
  text: string;
  type?: "info" | "success" | "warn" | "error" | "step";
}

interface LogTerminalProps {
  lines: LogLine[];
  title?: string;
  height?: number;
}

const TYPE_COLORS: Record<string, string> = {
  info:    "var(--muted)",
  success: "var(--accent)",
  warn:    "var(--amber)",
  error:   "var(--error, #f87171)",
  step:    "var(--cyan)",
};

const TYPE_PREFIX: Record<string, string> = {
  info:    "·",
  success: "✓",
  warn:    "⚠",
  error:   "✗",
  step:    "→",
};

export function LogTerminal({ lines, title = "AI Processing", height = 180 }: LogTerminalProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState(true);

  // Blink cursor
  useEffect(() => {
    const id = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll to bottom when new lines arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  return (
    <div className="log-terminal animate-fade-in">
      {/* Title bar */}
      <div className="log-terminal-bar">
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
        <span style={{
          marginLeft: 8,
          fontFamily: "Space Mono, monospace",
          fontSize: 10,
          color: "var(--muted)",
          letterSpacing: "0.06em",
        }}>
          {title}
        </span>
        {lines.length > 0 && (
          <span style={{
            marginLeft: "auto",
            fontFamily: "Space Mono, monospace",
            fontSize: 9,
            color: "var(--accent)",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}>
            <span className="dot-sm animate-pulse-glow" style={{ background: "var(--accent)" }} />
            LIVE
          </span>
        )}
      </div>

      {/* Log lines */}
      <div style={{
        padding: "12px 16px",
        height,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}>
        {lines.length === 0 ? (
          <span style={{ color: "var(--faint)", fontFamily: "Space Mono, monospace", fontSize: 11 }}>
            Waiting for AI...
          </span>
        ) : (
          lines.map((line, i) => (
            <div
              key={i}
              className="animate-fade-in"
              style={{
                fontFamily: "Space Mono, monospace",
                fontSize: 11,
                lineHeight: 1.7,
                color: TYPE_COLORS[line.type || "info"],
                display: "flex",
                gap: 8,
              }}
            >
              <span style={{ opacity: 0.5, flexShrink: 0 }}>
                {TYPE_PREFIX[line.type || "info"]}
              </span>
              <span>{line.text}</span>
            </div>
          ))
        )}
        {/* Blinking cursor */}
        <div style={{
          fontFamily: "Space Mono, monospace",
          fontSize: 11,
          color: "var(--accent)",
          opacity: cursor ? 1 : 0,
          transition: "opacity 0.1s",
        }}>█</div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

/**
 * Hook — progressively feeds log lines with a small delay between each,
 * so the terminal feels like a real streaming output.
 */
export function useLogStream(messages: LogLine[], active: boolean, intervalMs = 380) {
  const [shown, setShown] = useState<LogLine[]>([]);
  const idxRef = useRef(0);

  useEffect(() => {
    if (!active) { setShown([]); idxRef.current = 0; return; }
    const id = setInterval(() => {
      if (idxRef.current < messages.length) {
        setShown(prev => [...prev, messages[idxRef.current]]);
        idxRef.current++;
      } else {
        clearInterval(id);
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [active, messages, intervalMs]);

  return shown;
}
