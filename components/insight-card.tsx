"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import type { SoundscapeInsight } from "@/types/soundscape";

const VISIBILITY_WINDOW_MS = 9000;

export function InsightCard({ insight }: { insight: SoundscapeInsight | null }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!insight) {
      return;
    }

    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), VISIBILITY_WINDOW_MS);

    return () => window.clearTimeout(timeout);
  }, [insight]);

  return (
    <AnimatePresence>
      {insight && visible ? (
        <motion.aside
          className="pointer-events-none absolute bottom-6 left-6 z-20 max-w-sm rounded-3xl border border-white/15 bg-white/10 p-4 text-slate-100 shadow-2xl backdrop-blur-xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-sky-200/80">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.8)]" />
            Live context
          </div>
          {insight.recognized ? (
            <>
              <p className="text-lg font-semibold">🎵 {insight.song}</p>
              <p className="text-sm text-slate-300">{insight.artist}</p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold">{insight.genre}</p>
              <p className="text-sm text-slate-300">{insight.mood}</p>
            </>
          )}
          <p className="mt-3 text-xs leading-6 text-slate-300/90">
            {insight.style ?? `${insight.energyLabel} ${insight.genre}`}
          </p>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
