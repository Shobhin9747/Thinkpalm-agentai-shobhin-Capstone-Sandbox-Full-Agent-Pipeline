import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ProviderConfig } from "@/lib/llm/types";

export function resolveProviderConfig(rawApiKey: string): ProviderConfig {
  if (rawApiKey.startsWith("gsk_")) {
    return {
      apiKey: rawApiKey,
      provider: "groq",
      model: "llama-3.3-70b-versatile",
    };
  }

  if (rawApiKey.startsWith("xai-")) {
    return {
      apiKey: rawApiKey,
      provider: "xai",
      model: "grok-beta",
    };
  }

  return {
    apiKey: rawApiKey,
    provider: "gemini",
    model: "gemini-1.5-flash",
  };
}

export function createGeminiClient(apiKey: string) {
  return new GoogleGenerativeAI(apiKey);
}

export function getOpenAICompatibleEndpoint(provider: ProviderConfig["provider"]) {
  if (provider === "groq") {
    return "https://api.groq.com/openai/v1/chat/completions";
  }

  if (provider === "xai") {
    return "https://api.x.ai/v1/chat/completions";
  }

  throw new Error("No OpenAI-compatible endpoint configured for this provider");
}
