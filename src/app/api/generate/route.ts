import { runOrchestrator } from "@/lib/agents/orchestrator";
import { resolveProviderConfig } from "@/lib/llm/provider";
import { NextResponse } from "next/server";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

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
        trace: [],
      });
    }

    const providerConfig = resolveProviderConfig(API_KEY);
    const { code, trace } = await runOrchestrator({
      providerConfig,
      sessionId,
      userRequest: prd,
      systemPrompt,
    });

    return NextResponse.json({ code, trace });
  } catch (error) {
    console.error("AI Generation failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Synthesis failed" }, { status: 500 });
  }
}
