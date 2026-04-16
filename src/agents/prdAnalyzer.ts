const DEFAULT_ANALYZER_PROMPT = `
You are an expert Product Manager and AI Architect.
Your task is to analyze the provided Product Requirements Document (PRD) and extract structured information.

Your ONLY output must be a valid JSON object matching this exact structure:
{
  "pages": ["List of pages to be created"],
  "components": ["List of distinct UI components needed"],
  "features": ["List of key features described in the PRD"]
}

Do NOT wrap the output in markdown code blocks like \`\`\`json. Return RAW JSON.
`;

export async function analyzePRD(prd: string): Promise<any> {
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  
  if (!API_KEY) {
    throw new Error("Missing AI Provider API Key for Analysis");
  }

  const isGroq = API_KEY.trim().startsWith("gsk_");
  const isXai = API_KEY.trim().startsWith("xai-");
  
  const providerLabel = isGroq ? "Groq" : isXai ? "xAI (Grok)" : "Gemini";
  const keySuffix = API_KEY.length > 5 ? `...${API_KEY.slice(-5)}` : "unknown";
  
  console.log(`[ANALYZER] Provider Detected: ${providerLabel} (Key: ${keySuffix})`);

  let text = "";

  if (isGroq || isXai) {
    const modelName = isGroq ? "llama-3.3-70b-versatile" : "grok-beta";
    const apiUrl = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.x.ai/v1/chat/completions";

    console.log(`[ANALYZER] Calling ${providerLabel} API: ${modelName}`);

    const aiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY.trim()}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: DEFAULT_ANALYZER_PROMPT },
          { role: "user", content: `Here is the PRD:\n\n${prd}` }
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
    // Gemini
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log("ANALYZER [Gemini]: Synthesizing with gemini-1.5-flash");
    
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: `${DEFAULT_ANALYZER_PROMPT}\n\nHere is the PRD:\n\n${prd}` }] }
      ]
    });
    
    text = result.response.text();
  }

  // Parse JSON
  text = text.trim();
  // Strip markdown code blocks if the AI accidentally added them
  if (text.startsWith("\`\`\`json")) {
    text = text.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
  } else if (text.startsWith("\`\`\`")) {
    text = text.replace(/^\`\`\`/, "").replace(/\`\`\`$/, "").trim();
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse JSON from analyzer:", text);
    throw new Error("Analyzer agent failed to return valid JSON.");
  }
}
