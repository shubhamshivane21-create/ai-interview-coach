"use client";

import { useEffect } from "react";

const ENDPOINT = "http://127.0.0.1:7704/ingest/1098c676-89f8-422c-97a8-7eeaa4dbfd5d";
const SESSION_ID = "374539";

function sendLog(
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>
) {
  // #region agent log
  fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": SESSION_ID },
    body: JSON.stringify({
      sessionId: SESSION_ID,
      runId: "pre-fix",
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

export function ResponsiveDebug() {
  useEffect(() => {
    function measure() {
      const w = window.innerWidth;
      const nav = document.querySelector(".site-nav");
      const tabBar = document.querySelector(".tab-bar");
      const heroGrid = document.querySelector(".hero-grid");
      const dashboardLayout = document.querySelector(".dashboard-layout");

      // Hypothesis A: nav overflows viewport on small screens
      if (nav) {
        sendLog("A", "ResponsiveDebug.tsx:nav", "nav overflow check", {
          viewportWidth: w,
          navClientWidth: nav.clientWidth,
          navScrollWidth: nav.scrollWidth,
          overflows: nav.scrollWidth > nav.clientWidth,
        });
      }

      // Hypothesis B: tab bar items overlap / exceed container
      if (tabBar) {
        const buttons = Array.from(tabBar.querySelectorAll(".tab-btn"));
        sendLog("B", "ResponsiveDebug.tsx:tabs", "tab bar layout", {
          viewportWidth: w,
          tabBarClientWidth: tabBar.clientWidth,
          tabBarScrollWidth: tabBar.scrollWidth,
          tabCount: buttons.length,
          tabWidths: buttons.map((b) => b.clientWidth),
        });
      }

      // Hypothesis C: hero grid stays 2-column on mobile
      if (heroGrid) {
        const cols = getComputedStyle(heroGrid).gridTemplateColumns;
        sendLog("C", "ResponsiveDebug.tsx:hero", "hero grid columns", {
          viewportWidth: w,
          gridTemplateColumns: cols,
          isSingleColumn: cols.split(" ").length <= 1 || cols.includes("100%"),
        });
      }

      // Hypothesis D: dashboard sidebar not stacking
      if (dashboardLayout) {
        const dir = getComputedStyle(dashboardLayout).flexDirection;
        sendLog("D", "ResponsiveDebug.tsx:dashboard", "dashboard flex direction", {
          viewportWidth: w,
          flexDirection: dir,
          isColumn: dir === "column",
        });
      }

      // Hypothesis E: missing viewport causes wrong innerWidth vs screen
      sendLog("E", "ResponsiveDebug.tsx:viewport", "viewport meta check", {
        viewportWidth: w,
        screenWidth: window.screen.width,
        devicePixelRatio: window.devicePixelRatio,
        hasViewportMeta: !!document.querySelector('meta[name="viewport"]'),
      });
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return null;
}
