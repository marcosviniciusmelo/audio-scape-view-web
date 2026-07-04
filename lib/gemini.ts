import { buildSoundscapePrompt } from "@/api/soundscape-prompts";
import {
  buildFallbackInsight,
} from "@/lib/fallback-analysis";
import type {
  AnalyzeSoundscapeRequest,
  SoundscapeInsight,
} from "@/types/soundscape";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

function stripCodeFence(value: string) {
  return value.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

function normalizeInsight(
  raw: Partial<SoundscapeInsight>,
  fallback: SoundscapeInsight,
): SoundscapeInsight {
  const colors = Array.isArray(raw.colors)
    ? raw.colors.filter(Boolean).slice(0, 5)
    : fallback.colors;
  const keywords = Array.isArray(raw.keywords)
    ? raw.keywords.filter(Boolean).slice(0, 6)
    : fallback.keywords;
  const recognized =
    Boolean(raw.recognized) && Boolean(raw.artist || raw.song);

  return {
    recognized,
    artist: raw.artist?.trim() || undefined,
    song: raw.song?.trim() || undefined,
    album: raw.album?.trim() || undefined,
    genre: raw.genre?.trim() || fallback.genre,
    style: raw.style?.trim() || fallback.style,
    mood: raw.mood?.trim() || fallback.mood,
    energyLabel: raw.energyLabel?.trim() || fallback.energyLabel,
    confidence:
      typeof raw.confidence === "number"
        ? Math.max(0, Math.min(1, raw.confidence))
        : fallback.confidence,
    colors: colors.length > 0 ? colors : fallback.colors,
    keywords: keywords.length > 0 ? keywords : fallback.keywords,
    source: "gemini",
  };
}

async function requestGemini(payload: AnalyzeSoundscapeRequest) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: buildSoundscapePrompt(payload) },
              ...(payload.audioBase64 && payload.mimeType
                ? [
                    {
                      inlineData: {
                        mimeType: payload.mimeType,
                        data: payload.audioBase64,
                      },
                    },
                  ]
                : []),
            ],
          },
        ],
        generationConfig: {
          temperature: 0.6,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with ${response.status}`);
  }

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof text !== "string" || text.length === 0) {
    throw new Error("Gemini response did not include text output.");
  }

  return JSON.parse(stripCodeFence(text)) as Partial<SoundscapeInsight>;
}

export async function analyzeSoundscape(
  payload: AnalyzeSoundscapeRequest,
): Promise<SoundscapeInsight> {
  const fallback = buildFallbackInsight(payload);

  if (!process.env.GEMINI_API_KEY) {
    return fallback;
  }

  try {
    const rawInsight = await requestGemini(payload);
    return normalizeInsight(rawInsight, fallback);
  } catch {
    return fallback;
  }
}
