import { NextRequest } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

function getApiKeyFromDotEnv() {
  try {
    const envPath = path.join(process.cwd(), ".env");
    const raw = readFileSync(envPath, "utf8");
    const line = raw
      .split(/\r?\n/)
      .find((l) => l.trim().startsWith("ANTHROPIC_API_KEY="));
    if (!line) return "";
    const value = line.slice(line.indexOf("=") + 1).trim();
    return value.replace(/^['"]|['"]$/g, "").trim();
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  const apiKey = (process.env.ANTHROPIC_API_KEY?.trim() || getApiKeyFromDotEnv()).trim();
  if (!apiKey) {
    return Response.json(
      { error: { message: "Missing ANTHROPIC_API_KEY in server environment" } },
      { status: 500 }
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: { message: "Invalid JSON payload" } }, { status: 400 });
  }

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  const contentType = upstream.headers.get("content-type") || "application/json";
  if (!upstream.ok) {
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        "content-type": contentType,
        "cache-control": "no-store"
      }
    });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type": contentType,
      "cache-control": "no-store"
    }
  });
}
