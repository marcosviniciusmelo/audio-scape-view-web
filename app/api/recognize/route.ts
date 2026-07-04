import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text();

  return fetch(new URL("/api/gemini", request.url), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });
}
