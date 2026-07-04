"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";

import { useBackgroundCycle } from "@/hooks/use-background-cycle";
import type { BackgroundImage } from "@/types/soundscape";

const defaultImages: BackgroundImage[] = [
  {
    id: "fallback-aurora",
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80",
    alt: "Aurora landscape",
    source: "fallback",
  },
  {
    id: "fallback-neon",
    url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1800&q=80",
    alt: "Neon city lights",
    source: "fallback",
  },
  {
    id: "fallback-night",
    url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1800&q=80",
    alt: "Dreamy night landscape",
    source: "fallback",
  },
];

export function BackgroundStage({
  colors,
  images,
}: {
  colors: string[];
  images: BackgroundImage[];
}) {
  const resolvedImages = images.length > 0 ? images : defaultImages;
  const activeIndex = useBackgroundCycle(resolvedImages.length);
  const activeImage = resolvedImages[activeIndex] ?? resolvedImages[0];
  const gradient = useMemo(() => {
    const [primary = "#38BDF8", secondary = "#A855F7", accent = "#020617"] = colors;
    return `radial-gradient(circle at top, ${primary}40, transparent 34%), radial-gradient(circle at right, ${secondary}35, transparent 38%), linear-gradient(140deg, ${accent} 5%, #020617 48%, ${secondary}18 100%)`;
  }, [colors]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: gradient,
        }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={activeImage.id}
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${activeImage.url})` }}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.5, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 2.8, ease: "easeInOut" }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-slate-950/42 backdrop-blur-2xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.35)_48%,rgba(2,6,23,0.82)_100%)]" />
    </div>
  );
}
