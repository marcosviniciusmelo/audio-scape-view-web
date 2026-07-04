import type { AnalyzeSoundscapeRequest } from "@/types/soundscape";

export function buildSoundscapePrompt(payload: AnalyzeSoundscapeRequest) {
  const { metrics, capturedAt } = payload;

  return [
    "You analyze short ambient music snippets for an immersive web visualizer.",
    "Return only valid JSON with this shape:",
    JSON.stringify(
      {
        recognized: true,
        artist: "string or null",
        song: "string or null",
        album: "string or null",
        genre: "string",
        style: "string",
        mood: "string",
        energyLabel: "string",
        confidence: 0.84,
        colors: ["#FFD54F", "#0D47A1", "#FFFFFF"],
        keywords: ["golden sky", "sunset", "stars", "nature", "light"],
      },
      null,
      2,
    ),
    "Only set recognized=true when there is strong evidence for a real song or artist.",
    "If you are unsure, set recognized=false and infer genre, mood, energy, palette, and image keywords from the audio context.",
    "Keywords must be short English visual search terms.",
    `Captured at: ${capturedAt}`,
    `Metrics: ${JSON.stringify(metrics)}`,
  ].join("\n\n");
}
