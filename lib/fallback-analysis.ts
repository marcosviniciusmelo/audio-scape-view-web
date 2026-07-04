import type {
  AnalyzeSoundscapeRequest,
  SoundMetrics,
  SoundscapeInsight,
} from "@/types/soundscape";

function resolveGenre(metrics: SoundMetrics) {
  if (metrics.bass > 0.66 && metrics.treble > 0.58) {
    return "Electronic";
  }

  if (metrics.mid > 0.58 && metrics.treble < 0.4) {
    return "Jazz";
  }

  if (metrics.bass > 0.52 && metrics.mid > 0.5) {
    return "Alternative Rock";
  }

  if (metrics.treble > 0.62 && metrics.mid < 0.45) {
    return "Ambient";
  }

  return "Lo-fi";
}

function resolveMood(metrics: SoundMetrics) {
  if (metrics.energy > 0.72) {
    return "Electric";
  }

  if (metrics.volume < 0.24) {
    return "Introspective";
  }

  if (metrics.treble > metrics.bass) {
    return "Dreamy";
  }

  return "Cinematic";
}

function resolveKeywords(genre: string, mood: string, metrics: SoundMetrics) {
  if (genre === "Jazz") {
    return ["jazz club", "warm lights", "night city", "coffee bar", "saxophone"];
  }

  if (genre === "Electronic") {
    return ["neon skyline", "laser haze", "digital waves", "futuristic stage", "night drive"];
  }

  if (genre === "Alternative Rock") {
    return ["festival crowd", "guitar smoke", "arena lights", "stormy sky", "road trip"];
  }

  if (genre === "Ambient") {
    return ["stars", "mist forest", "soft clouds", "aurora", "moonlight"];
  }

  return metrics.energy > 0.45
    ? ["city neon", "rain window", "retro room", "late night", "vinyl glow"]
    : ["lofi room", "rainy city", "desk lamp", "night window", "soft haze"];
}

function resolveColors(genre: string, mood: string) {
  if (genre === "Jazz") {
    return ["#F59E0B", "#7C3AED", "#1E293B"];
  }

  if (genre === "Electronic") {
    return ["#22D3EE", "#A855F7", "#0F172A"];
  }

  if (genre === "Alternative Rock") {
    return ["#F97316", "#FB7185", "#172554"];
  }

  if (mood === "Dreamy") {
    return ["#38BDF8", "#C084FC", "#E2E8F0"];
  }

  return ["#60A5FA", "#22D3EE", "#0F172A"];
}

function resolveEnergyLabel(metrics: SoundMetrics) {
  if (metrics.energy > 0.72) {
    return "High Energy";
  }

  if (metrics.energy > 0.45) {
    return "Steady Groove";
  }

  return "Low Pulse";
}

export function buildFallbackInsight(
  payload: AnalyzeSoundscapeRequest,
): SoundscapeInsight {
  const genre = resolveGenre(payload.metrics);
  const mood = resolveMood(payload.metrics);

  return {
    recognized: false,
    genre,
    mood,
    style: `${mood} ${genre}`,
    energyLabel: resolveEnergyLabel(payload.metrics),
    confidence: 0.42,
    colors: resolveColors(genre, mood),
    keywords: resolveKeywords(genre, mood, payload.metrics),
    source: "heuristic",
  };
}
