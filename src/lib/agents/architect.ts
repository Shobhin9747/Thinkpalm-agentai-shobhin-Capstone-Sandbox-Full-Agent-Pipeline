import { completeText } from "@/lib/llm/complete";
import type { ProviderConfig } from "@/lib/llm/types";

const ARCHITECT_SYSTEM_PROMPT = `You are the ARCHITECT agent.
Produce a concise implementation blueprint for a React + Tailwind UI.
Rules:
- Output plain text only.
- No code blocks.
- Include: sections, components, interactions, visual style tokens.
- Keep it practical and implementation-ready.`;

export async function runArchitect(
  providerConfig: ProviderConfig,
  userRequest: string,
  memorySummary: string,
) {
  const prompt = [
    "User request:",
    userRequest,
    "",
    "Session memory:",
    memorySummary || "(none)",
    "",
    "Return a structured UI specification with headings and bullet points.",
  ].join("\n");

  return completeText(providerConfig, ARCHITECT_SYSTEM_PROMPT, prompt);
}
