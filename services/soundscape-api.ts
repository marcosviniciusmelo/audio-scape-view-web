import type {
  AnalyzeSoundscapeRequest,
  BackgroundImage,
  ImageSearchRequest,
  SoundscapeInsight,
} from "@/types/soundscape";

export async function analyzeAudioSnippet(
  payload: AnalyzeSoundscapeRequest,
): Promise<SoundscapeInsight> {
  const response = await fetch("/api/recognize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze audio snippet.");
  }

  return (await response.json()) as SoundscapeInsight;
}

export async function fetchContextImages(
  payload: ImageSearchRequest,
): Promise<BackgroundImage[]> {
  const response = await fetch("/api/images", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch context images.");
  }

  return ((await response.json()) as { images: BackgroundImage[] }).images;
}
