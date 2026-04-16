import { runOrchestrator } from "@/lib/agents/orchestrator";
import { resolveProviderConfig } from "@/lib/llm/provider";
import { NextResponse } from "next/server";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { prd, systemPrompt, sessionId } = await req.json();

    if (!prd) {
      return NextResponse.json({ error: "Input prompt is required" }, { status: 400 });
    }

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    if (!API_KEY) {
      return NextResponse.json({
        code: `
import React from 'react';

export default function EntryPoint() {
  return (
    <div className="min-h-screen bg-[#030408] text-white flex flex-col items-center justify-center p-8">
      <div className="glass p-12 max-w-xl text-center rounded-[3rem] border border-white/5">
        <h1 className="text-3xl font-black mb-4">API KEY REQUIRED</h1>
        <p className="text-slate-400">Please provide a valid Gemini or Groq API key in the configuration.</p>
      </div>
    </div>
  );
}
        `.trim(),
      });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: string, payload: unknown) => {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`),
          );
        };

        try {
          const providerConfig = resolveProviderConfig(API_KEY);
          const { code } = await runOrchestrator({
            providerConfig,
            sessionId,
            userRequest: prd,
            systemPrompt,
            onTrace: (entry) => send("trace", entry),
          });

          send("done", { code });
          controller.close();
        } catch (error) {
          const message = error instanceof Error ? error.message : "Synthesis failed";
          send("error", { message });
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "SSE request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

