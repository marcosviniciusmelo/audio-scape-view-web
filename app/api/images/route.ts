import { NextRequest, NextResponse } from "next/server";

import type { BackgroundImage, ImageSearchRequest } from "@/types/soundscape";

function buildFallbackImages(keywords: string[], mood?: string): BackgroundImage[] {
  return keywords.slice(0, 6).map((keyword, index) => ({
    id: `fallback-${index}-${keyword}`,
    url: `https://source.unsplash.com/featured/1920x1080/?${encodeURIComponent(`${keyword},${mood ?? "cinematic"}`)}&sig=${index + 1}`,
    alt: `${keyword} background`,
    source: "fallback",
  }));
}

async function fetchUnsplashImages(query: string) {
  const response = await fetch(
    `https://api.unsplash.com/search/photos?orientation=landscape&per_page=8&query=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Unsplash request failed with ${response.status}`);
  }

  const result = await response.json();
  return (result.results ?? []) as Array<{
    id: string;
    alt_description?: string;
    urls?: { regular?: string };
  }>;
}

export async function POST(request: NextRequest) {
  const { keywords, mood } = (await request.json()) as ImageSearchRequest;
  const safeKeywords = keywords.filter(Boolean);

  if (safeKeywords.length === 0) {
    return NextResponse.json({ images: buildFallbackImages(["aurora", "cinematic sky"], mood) });
  }

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    return NextResponse.json({ images: buildFallbackImages(safeKeywords, mood) }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  try {
    const result = await fetchUnsplashImages(`${safeKeywords.join(" ")} ${mood ?? ""}`.trim());
    const images: BackgroundImage[] = result
      .filter((entry) => entry.urls?.regular)
      .map((entry) => ({
        id: entry.id,
        url: entry.urls?.regular ?? "",
        alt: entry.alt_description ?? "Soundscape background",
        source: "unsplash",
      }));

    return NextResponse.json(
      { images: images.length > 0 ? images : buildFallbackImages(safeKeywords, mood) },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { images: buildFallbackImages(safeKeywords, mood) },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
