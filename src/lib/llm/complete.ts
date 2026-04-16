import { createGeminiClient, getOpenAICompatibleEndpoint } from "@/lib/llm/provider";
import type { ProviderConfig } from "@/lib/llm/types";

export async function completeText(config: ProviderConfig, systemPrompt: string, userPrompt: string) {
  if (config.provider === "gemini") {
    const client = createGeminiClient(config.apiKey);
    const model = client.getGenerativeModel({
      model: config.model,
      systemInstruction: systemPrompt,
    });
    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    return response.text() ?? "";
  }

  const endpoint = getOpenAICompatibleEndpoint(config.provider);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || response.statusText || "Provider completion failed");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}
