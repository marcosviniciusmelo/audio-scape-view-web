import type { DominantBand, SoundMetrics } from "@/types/soundscape";

const clamp = (value: number) => Number(value.toFixed(3));

export const EMPTY_METRICS: SoundMetrics = {
  volume: 0,
  bass: 0,
  mid: 0,
  treble: 0,
  energy: 0,
  spectrum: Array.from({ length: 24 }, () => 0),
  dominantBand: "mid",
  timestamp: 0,
};

function averageRange(values: Uint8Array, start: number, end: number) {
  const safeEnd = Math.max(start + 1, end);
  let total = 0;

  for (let index = start; index < safeEnd; index += 1) {
    total += values[index] ?? 0;
  }

  return total / (safeEnd - start) / 255;
}

export function buildMetricsFromFrequencyData(data: Uint8Array): SoundMetrics {
  if (data.length === 0) {
    return EMPTY_METRICS;
  }

  const bass = averageRange(data, 0, Math.floor(data.length * 0.12));
  const mid = averageRange(
    data,
    Math.floor(data.length * 0.12),
    Math.floor(data.length * 0.45),
  );
  const treble = averageRange(
    data,
    Math.floor(data.length * 0.45),
    data.length,
  );

  const volume =
    data.reduce((sum, value) => sum + value / 255, 0) / data.length;
  const energy = bass * 0.38 + mid * 0.34 + treble * 0.28 + volume * 0.18;
  const bands: [DominantBand, number][] = [
    ["bass", bass],
    ["mid", mid],
    ["treble", treble],
  ];

  const dominantBand =
    bands.sort((left, right) => right[1] - left[1])[0]?.[0] ?? "mid";

  const bucketSize = Math.max(1, Math.floor(data.length / 24));
  const spectrum = Array.from({ length: 24 }, (_, index) => {
    const start = index * bucketSize;
    const end = index === 23 ? data.length : start + bucketSize;
    return clamp(averageRange(data, start, end));
  });

  return {
    volume: clamp(volume),
    bass: clamp(bass),
    mid: clamp(mid),
    treble: clamp(treble),
    energy: clamp(Math.min(1, energy)),
    spectrum,
    dominantBand,
    timestamp: Date.now(),
  };
}
