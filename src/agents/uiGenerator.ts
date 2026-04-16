const DEFAULT_SYSTEM_PROMPT = `STRICT_CODE_GENERATOR_MODE:
You are an expert Senior UI Engineer and Agentic Component Generator. 
Your ONLY output is a single, executable React/Tailwind file containing a complete Component Tree based on the provided structured requirements JSON.

CRITICAL PIPELINE RULES:
1. SINGLE BLOCK ONLY: Do NOT return multiple code blocks. Do NOT return separate CSS or HTML files. 
2. NO TEXT: Do NOT explain your work, do NOT write a PRD or documentation, do NOT use markdown text outside the code block.
3. TAILWIND ONLY: All styles MUST be in Tailwind classes. Do NOT generate separate CSS blocks.
4. INPUT HANDLING: Analyze the entire JSON and translate all requirements into a comprehensive UI interface.
5. STRUCTURE: Return a single file with a 'default exported' main component. You MUST define any necessary sub-components within the same file to create a complete, modular React component tree.

DESIGN LANGUAGE:
- Premium Dark Glassmorphism.
- Accent Palette: Cyan (#22d3ee) for actions, Purple (#a855f7) for depth.
- Standard SVG icons (stroke-width: 1.5).`;

export async function generateUI(structuredJson: any): Promise<string> {
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  
  if (!API_KEY) {
    throw new Error("Missing AI Provider API Key for Generation");
  }

  const isGroq = API_KEY.trim().startsWith("gsk_");
  const isXai = API_KEY.trim().startsWith("xai-");
  
  const providerLabel = isGroq ? "Groq" : isXai ? "xAI (Grok)" : "Gemini";
  const keySuffix = API_KEY.length > 5 ? `...${API_KEY.slice(-5)}` : "unknown";
  
  console.log(`[GENERATOR] Provider Detected: ${providerLabel} (Key: ${keySuffix})`);

  let text = "";

  if (isGroq || isXai) {
    const modelName = isGroq ? "llama-3.3-70b-versatile" : "grok-beta";
    const apiUrl = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.x.ai/v1/chat/completions";

    console.log(`[GENERATOR] Calling ${providerLabel} API: ${modelName}`);

    const aiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY.trim()}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: DEFAULT_SYSTEM_PROMPT },
          { role: "user", content: `STRUCTURED_REQUIREMENTS:\n${JSON.stringify(structuredJson, null, 2)}\n\nGenerate the complete UI component tree.` }
        ],
        temperature: 0,
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json();
      throw new Error(`${providerLabel} Error: ${errorData.error?.message || aiResponse.statusText}`);
    }

    const data = await aiResponse.json();
    text = data.choices[0].message.content;
  } else {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log("GENERATOR [Gemini]: Synthesizing with gemini-1.5-flash");
    
    const result = await model.generateContent(`${DEFAULT_SYSTEM_PROMPT}\n\nSTRUCTURED_REQUIREMENTS:\n${JSON.stringify(structuredJson, null, 2)}\n\nGenerate the complete UI component tree.`);
    const response = await result.response;
    text = response.text();
  }

  // Advanced Multi-Block Selection Logic
  let code = "";
  const codeBlocks = Array.from(text.matchAll(/```(?:tsx|jsx|javascript|typescript|react|html|css)?\n([\s\S]*?)```/g)).map(m => m[1].trim());
  
  if (codeBlocks.length > 0) {
    // Prioritize the block that looks like a React component
    const reactBlock = codeBlocks.find(b => 
      (b.includes("export default") || b.includes("return (")) && 
      !b.includes("### CSS") // Filter out blocks that are just CSS descriptions
    );
    code = reactBlock || codeBlocks[0];
  } else {
    // Fallback if AI returned raw code without backticks
    if (text.includes("export default") || (text.includes("<") && text.includes(">"))) {
      code = text.trim();
    } else {
      throw new Error("AI returned descriptive text instead of a visual component. Try refining your requirements.");
    }
  }

  return code;
}
