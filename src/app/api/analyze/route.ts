import { NextResponse } from 'next/server';
import { analyzePRD } from '@/agents/prdAnalyzer';

export async function POST(req: Request) {
  try {
    const { prd } = await req.json();

    if (!prd) {
      return NextResponse.json({ error: "PRD input is required" }, { status: 400 });
    }

    const structuredData = await analyzePRD(prd);
    return NextResponse.json({ data: structuredData });

  } catch (error) {
    console.error("Analysis route error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Analysis failed" 
    }, { status: 500 });
  }
}
