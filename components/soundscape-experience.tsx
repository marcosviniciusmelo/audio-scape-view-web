"use client";

import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BackgroundStage } from "@/components/background-stage";
import { InsightCard } from "@/components/insight-card";
import { useAudioAnalysis } from "@/hooks/use-audio-analysis";
import { useSoundscapeStore } from "@/lib/soundscape-store";
import { analyzeAudioSnippet, fetchContextImages } from "@/services/soundscape-api";
import { SoundScapeCanvas } from "@/three/soundscape-canvas";
import type { AnalyzeSoundscapeRequest } from "@/types/soundscape";

const starterKeywords = ["aurora", "neon landscape", "cinematic sky", "abstract waves"];

export function SoundScapeExperience() {
  const [isReady, setIsReady] = useState(false);
  const insight = useSoundscapeStore((state) => state.insight);
  const images = useSoundscapeStore((state) => state.images);
  const setImages = useSoundscapeStore((state) => state.setImages);
  const setInsight = useSoundscapeStore((state) => state.setInsight);
  const colors = insight?.colors ?? ["#38BDF8", "#A855F7", "#020617"];

  const imageMutation = useMutation({
    mutationFn: fetchContextImages,
    onSuccess: (nextImages) => setImages(nextImages),
  });

  const analyzeMutation = useMutation({
    mutationFn: analyzeAudioSnippet,
    onSuccess: async (nextInsight) => {
      setInsight(nextInsight);
      await imageMutation.mutateAsync({
        keywords: nextInsight.keywords,
        mood: nextInsight.mood,
      });
    },
  });

  useEffect(() => {
    imageMutation.mutate({ keywords: starterKeywords, mood: "cinematic" });
  }, [imageMutation]);

  const handleSnippet = useCallback(
    async (payload: AnalyzeSoundscapeRequest) => {
      if (analyzeMutation.isPending) {
        return;
      }

      await analyzeMutation.mutateAsync(payload);
    },
    [analyzeMutation],
  );

  const { error, start, status } = useAudioAnalysis({ onSnippet: handleSnippet });

  const handleEnableMicrophone = useCallback(async () => {
    const started = await start();

    if (started) {
      setIsReady(true);
    }
  }, [start]);

  const statusLabel = useMemo(() => {
    if (status === "active") {
      return analyzeMutation.isPending ? "Analyzing soundscape" : "Visualizer live";
    }

    if (status === "requesting") {
      return "Requesting microphone";
    }

    return "Waiting for microphone";
  }, [analyzeMutation.isPending, status]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-white">
      <BackgroundStage colors={colors} images={images} />
      <SoundScapeCanvas colors={colors} isActive={status === "active"} />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.58)_0%,transparent_28%,transparent_72%,rgba(2,6,23,0.75)_100%)]" />

      <header className="absolute top-5 left-5 z-20 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-slate-200/80 backdrop-blur-xl">
        SoundScape 3D
      </header>

      <div className="absolute top-5 right-5 z-20 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs text-slate-200/80 backdrop-blur-xl">
        {statusLabel}
      </div>

      {!isReady ? (
        <motion.section
          className="relative z-20 mx-6 max-w-2xl rounded-[2rem] border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl sm:p-12"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="mb-4 text-sm uppercase tracking-[0.5em] text-sky-200/80">
            Immersive audio canvas
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Transform any room into a cinematic 3D soundscape.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-200/80 sm:text-lg">
            Enable your microphone to drive neon waves, particles, bloom, and smart visual backdrops that adapt to the music around you.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              className="pointer-events-auto rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02] hover:bg-sky-100"
              onClick={handleEnableMicrophone}
              type="button"
            >
              Enable Microphone
            </button>
            <p className="text-sm text-slate-300/80">
              Low-latency FFT analysis with Gemini-driven context.
            </p>
          </div>
          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </motion.section>
      ) : null}

      <div className="absolute bottom-6 right-6 z-20 rounded-3xl border border-white/10 bg-white/8 px-4 py-3 text-right text-xs text-slate-200/75 backdrop-blur-xl">
        <p className="uppercase tracking-[0.3em]">Realtime</p>
        <p className="mt-1 text-[11px] text-slate-300/70">
          React Three Fiber · Web Audio · Gemini · Smooth image transitions
        </p>
      </div>

      <InsightCard insight={insight} />
    </main>
  );
}
