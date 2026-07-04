import { NextRequest, NextResponse } from "next/server";

import { analyzeSoundscape } from "@/lib/gemini";
import type { AnalyzeSoundscapeRequest } from "@/types/soundscape";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as AnalyzeSoundscapeRequest;
  const insight = await analyzeSoundscape(payload);

  return NextResponse.json(insight, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
