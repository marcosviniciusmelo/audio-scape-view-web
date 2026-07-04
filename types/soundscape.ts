export type DominantBand = "bass" | "mid" | "treble";

export type SoundMetrics = {
  volume: number;
  bass: number;
  mid: number;
  treble: number;
  energy: number;
  spectrum: number[];
  dominantBand: DominantBand;
  timestamp: number;
};

export type AnalyzeSoundscapeRequest = {
  audioBase64?: string;
  mimeType?: string;
  metrics: SoundMetrics;
  capturedAt: string;
};

export type SoundscapeInsight = {
  recognized: boolean;
  artist?: string;
  song?: string;
  album?: string;
  genre: string;
  style?: string;
  mood: string;
  energyLabel: string;
  confidence: number;
  colors: string[];
  keywords: string[];
  source: "gemini" | "heuristic";
};

export type BackgroundImage = {
  id: string;
  url: string;
  alt: string;
  source: "unsplash" | "fallback";
};

export type ImageSearchRequest = {
  keywords: string[];
  mood?: string;
};
