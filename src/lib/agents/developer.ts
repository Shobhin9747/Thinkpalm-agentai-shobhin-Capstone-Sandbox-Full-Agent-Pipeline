import { completeText } from "@/lib/llm/complete";
import type { ProviderConfig } from "@/lib/llm/types";

const DEVELOPER_SYSTEM_PROMPT = `STRICT_CODE_GENERATOR_MODE:
You are an expert Senior UI Engineer. Your ONLY output is a single, executable React/Tailwind component.

CRITICAL PIPELINE RULES:
1. SINGLE BLOCK ONLY: Do NOT return multiple code blocks. Do NOT return separate CSS or HTML files.
2. NO TEXT: Do NOT explain your work, do NOT write markdown outside code.
3. TAILWIND ONLY: All styles MUST be in Tailwind classes.
4. STRUCTURE: Return a single default exported functional component.
5. Use modern React patterns and valid JSX.`;

export async function runDeveloper(
  providerConfig: ProviderConfig,
  uiSpec: string,
  memorySummary: string,
  overrideSystemPrompt?: string,
) {
  const prompt = [
    "Architect specification:",
    uiSpec,
    "",
    "Session memory:",
    memorySummary || "(none)",
    "",
    "Generate the final TSX component now.",
  ].join("\n");

  return completeText(providerConfig, overrideSystemPrompt || DEVELOPER_SYSTEM_PROMPT, prompt);
}
