import { NextResponse } from "next/server";
import { reviewCode } from "@/tools/uiTools";

export async function POST(req: Request) {
  try {
    const { code, structuredJson } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required for Reviewer" }, { status: 400 });
    }

    // Agent 3: Review and Refine
    const refinedCode = await reviewCode(code, structuredJson);

    return NextResponse.json({ 
      code: refinedCode, 
      trace: [
        { agent: "reviewer", action: "tool_call:reviewCode", ts: Date.now() }
      ]
    });

  } catch (error) {
    console.error("AI Review failed:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Review failed" 
    }, { status: 500 });
  }
}
