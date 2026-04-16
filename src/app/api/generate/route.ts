import { NextResponse } from "next/server";
import { generateComponentTree, previewUI, exportCode } from "@/tools/uiTools";

export async function POST(req: Request) {
  try {
    const { prd, sessionId, structuredJson } = await req.json();

    if (!structuredJson) {
      return NextResponse.json({ error: "Structured JSON is required for Phase 2 synthesis" }, { status: 400 });
    }

    // Phase 2: Tool-Calling Sequence
    // 1. Tool Call: Generate Code (Agent 2)
    const code = await generateComponentTree(structuredJson);

    // 2. Tool Call: Preview Preparation (Simulation)
    const previewRes = previewUI(code);

    // 3. Tool Call: Export Preparation (Simulation)
    const exportRes = exportCode(code);

    // Prepare Trace for UI
    const trace = [
      { agent: "generator", action: "tool_call:generateComponentTree", ts: Date.now() },
      { agent: "system", action: "tool_call:previewUI", ts: Date.now() + 10 },
      { agent: "system", action: "tool_call:exportCode", ts: Date.now() + 20 }
    ];

    return NextResponse.json({ 
      code, 
      trace,
      toolResults: {
        preview: previewRes,
        export: exportRes
      }
    });

  } catch (error) {
    console.error("AI Generation failed:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Synthesis failed" 
    }, { status: 500 });
  }
}
