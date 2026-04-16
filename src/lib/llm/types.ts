export type ProviderKind = "gemini" | "groq" | "xai";

export interface ProviderConfig {
  apiKey: string;
  provider: ProviderKind;
  model: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface ToolResult {
  id: string;
  name: string;
  result: unknown;
}

export interface OrchestratorTraceEntry {
  agent: "orchestrator" | "architect" | "developer";
  action: string;
  ts: number;
}

export type ToolHandler = (
  args: Record<string, unknown>,
  callId: string,
) => Promise<unknown>;

export interface ToolLoopInput {
  config: ProviderConfig;
  systemPrompt: string;
  userPrompt: string;
  tools: ToolDefinition[];
  toolHandlers: Record<string, ToolHandler>;
  maxSteps?: number;
}

export interface ToolLoopOutput {
  finalText: string;
  calls: ToolCall[];
}
