import { create } from "zustand";

import type { BackgroundImage, SoundMetrics, SoundscapeInsight } from "@/types/soundscape";
import { EMPTY_METRICS } from "@/utils/audio-metrics";

type SoundscapeState = {
  metrics: SoundMetrics;
  insight: SoundscapeInsight | null;
  images: BackgroundImage[];
  setMetrics: (metrics: SoundMetrics) => void;
  setInsight: (insight: SoundscapeInsight) => void;
  setImages: (images: BackgroundImage[]) => void;
};

export const useSoundscapeStore = create<SoundscapeState>((set) => ({
  metrics: EMPTY_METRICS,
  insight: null,
  images: [],
  setMetrics: (metrics) => set({ metrics }),
  setInsight: (insight) => set({ insight }),
  setImages: (images) => set({ images }),
}));
