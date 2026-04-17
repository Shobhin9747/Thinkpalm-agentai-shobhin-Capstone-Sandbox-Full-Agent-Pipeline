const DEFAULT_SCHEMA_PROMPT = `SCHEMA_ARCHITECT_MODE:
You are an elite Backend Data Architect acting as Agent 4 in an AI UI Generation pipeline.
Your task is to take a structured UI JSON breakdown and synthesize the exact backend data schemas required to power the interface smoothly.

CRITICAL PIPELINE RULES:
1. OUTPUT FORMAT: Return your code in a single comprehensive markdown block starting with \`\`\`tsx and ending with \`\`\`. 
2. CONTENTS: Include BOTH TypeScript Interfaces/Types and a Prisma schema block (as a multi-line comment or template literal) if applicable. 
3. NO CHIT-CHAT: Do NOT write conversational text like "Here is the schema". Only output code.
4. MOCK DATA: Provide a 'const mockDataPayload' export demonstrating exactly what the JSON payload driving the UI state should look like.

Focus on creating scalable, clean schemas that seamlessly back the visual elements provided in the JSON breakdown.`;

export async function synthesizeSchema(structuredJson: any): Promise<string> {
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  
  if (!API_KEY) {
    throw new Error("Missing AI Provider API Key for Schema Generator");
  }

  const isGroq = API_KEY.trim().startsWith("gsk_");
  const isXai = API_KEY.trim().startsWith("xai-");
  
  const providerLabel = isGroq ? "Groq" : isXai ? "xAI (Grok)" : "Gemini";
  console.log(`[SCHEMA GENERATOR] Provider Detected: ${providerLabel}`);

  const promptContent = `STRUCTURED_UI_REQUIREMENTS:
${JSON.stringify(structuredJson, null, 2)}

Generate the appropriate TypeScript types, Prisma schema, and mock data payload corresponding to the above UI components. Return only code.`;

  let text = "";

  if (isGroq || isXai) {
    const modelName = isGroq ? "llama-3.3-70b-versatile" : "grok-beta";
    const apiUrl = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.x.ai/v1/chat/completions";

    const aiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY.trim()}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: DEFAULT_SCHEMA_PROMPT },
          { role: "user", content: promptContent }
        ],
        temperature: 0.2, // slightly higher than review to allow creative structuring
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json();
      throw new Error(`${providerLabel} Error in Schema Generator: ${errorData.error?.message || aiResponse.statusText}`);
    }

    const data = await aiResponse.json();
    text = data.choices[0].message.content;
  } else {
    // Gemini
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); 
    
    const result = await model.generateContent(`${DEFAULT_SCHEMA_PROMPT}\n\n${promptContent}`);
    text = result.response.text();
  }

  // Parse Multi-Block Selection Logic
  let schemaCode = "";
  const codeBlocks = Array.from(text.matchAll(/```(?:tsx|ts|typescript|javascript|json|prisma)?\n([\s\S]*?)```/g)).map(m => m[1].trim());
  
  if (codeBlocks.length > 0) {
    // Join blocks if LLM gave separate ts / prisma blocks
    schemaCode = codeBlocks.join('\n\n// ----------------------------\n\n');
  } else {
    // Fallback
    schemaCode = text.trim();
  }

  return schemaCode;
}
