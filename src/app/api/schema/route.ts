import { NextResponse } from "next/server";
import { generateDataSchema } from "@/tools/uiTools";

export async function POST(req: Request) {
  try {
    const { structuredJson } = await req.json();

    if (!structuredJson) {
      return NextResponse.json({ error: "Structured JSON is required for Schema generation" }, { status: 400 });
    }

    // Agent 4: Generate Data Schema (runs in parallel to the UI pipeline in the frontend)
    const schemaCode = await generateDataSchema(structuredJson);

    return NextResponse.json({ 
      schema: schemaCode, 
      trace: [
        { agent: "schema_architect", action: "tool_call:generateDataSchema", ts: Date.now() }
      ]
    });

  } catch (error) {
    console.error("AI Schema Synthesis failed:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Schema Synthesis failed" 
    }, { status: 500 });
  }
}
