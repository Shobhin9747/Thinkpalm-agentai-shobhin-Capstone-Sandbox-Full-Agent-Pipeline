import { mergeSessionMemory, readSessionMemory } from "@/lib/agent-memory/store";
import { runArchitect } from "@/lib/agents/architect";
import { runDeveloper } from "@/lib/agents/developer";
import { runGeminiToolLoop } from "@/lib/llm/gemini-tools";
import { runOpenAIToolLoop } from "@/lib/llm/openai-tools";
import type { OrchestratorTraceEntry, ProviderConfig, ToolDefinition, ToolHandler } from "@/lib/llm/types";

const ORCHESTRATOR_SYSTEM_PROMPT = `You are the ORCHESTRATOR for a 2+1 UI agent pipeline.
You can call tools to read/write memory, ask the Architect for a UI spec, ask the Developer for TSX, then submit final code.
Rules:
- Prefer memory continuity across turns.
- For non-trivial requests, call run_architect before run_developer.
- You MUST call submit_final_component exactly once with final TSX.
- Keep tool arguments concise and valid JSON.`;

function stringifyMemory(sessionId: string) {
  const memory = readSessionMemory(sessionId);
  return JSON.stringify(memory);
}

function extractCodeFromText(text: string) {
  const codeBlocks = Array.from(
    text.matchAll(/```(?:tsx|jsx|javascript|typescript|react|html|css)?\n([\s\S]*?)```/g),
  ).map((match) => match[1].trim());

  if (codeBlocks.length > 0) {
    const reactBlock = codeBlocks.find(
      (block) => (block.includes("export default") || block.includes("return (")) && !block.includes("### CSS"),
    );
    return reactBlock || codeBlocks[0];
  }

  if (text.includes("export default") || (text.includes("<") && text.includes(">"))) {
    return text.trim();
  }

  throw new Error("AI returned descriptive text instead of a visual component. Try refining your requirements.");
}

interface RunOrchestratorInput {
  providerConfig: ProviderConfig;
  sessionId: string;
  userRequest: string;
  systemPrompt?: string;
  onTrace?: (entry: OrchestratorTraceEntry) => void;
}

interface RunOrchestratorOutput {
  code: string;
  trace: OrchestratorTraceEntry[];
}

export async function runOrchestrator(input: RunOrchestratorInput): Promise<RunOrchestratorOutput> {
  const trace: OrchestratorTraceEntry[] = [];
  const log = (agent: OrchestratorTraceEntry["agent"], action: string) => {
    const entry = { agent, action, ts: Date.now() } as OrchestratorTraceEntry;
    trace.push(entry);
    input.onTrace?.(entry);
  };

  let latestSpec = "";
  let latestDraft = "";
  let submittedCode = "";

  const tools: ToolDefinition[] = [
    {
      name: "memory_read",
      description: "Read current session memory.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "memory_write",
      description: "Merge notes into session memory.",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string" },
          facts: { type: "array", items: { type: "string" } },
          lastSpec: { type: "string" },
        },
      },
    },
    {
      name: "run_architect",
      description: "Generate architecture spec from user request and memory context.",
      parameters: {
        type: "object",
        properties: {
          user_request: { type: "string" },
        },
        required: ["user_request"],
      },
    },
    {
      name: "run_developer",
      description: "Generate TSX candidate from UI spec and memory context.",
      parameters: {
        type: "object",
        properties: {
          ui_spec: { type: "string" },
        },
        required: ["ui_spec"],
      },
    },
    {
      name: "submit_final_component",
      description: "Submit final TSX for response. Pass tsx directly or use_latest_draft=true.",
      parameters: {
        type: "object",
        properties: {
          tsx: { type: "string" },
          use_latest_draft: { type: "boolean" },
        },
      },
    },
  ];

  const toolHandlers: Record<string, ToolHandler> = {
    memory_read: async () => {
      log("orchestrator", "memory_read");
      return readSessionMemory(input.sessionId);
    },
    memory_write: async (args) => {
      log("orchestrator", "memory_write");
      const summary = typeof args.summary === "string" ? args.summary : undefined;
      const facts = Array.isArray(args.facts)
        ? args.facts.filter((item): item is string => typeof item === "string")
        : undefined;
      const lastSpec = typeof args.lastSpec === "string" ? args.lastSpec : undefined;
      return mergeSessionMemory(input.sessionId, { summary, facts, lastSpec });
    },
    run_architect: async (args) => {
      log("architect", "generate_spec");
      const userRequest =
        typeof args.user_request === "string" && args.user_request.trim()
          ? args.user_request
          : input.userRequest;
      latestSpec = await runArchitect(input.providerConfig, userRequest, stringifyMemory(input.sessionId));
      mergeSessionMemory(input.sessionId, { lastSpec: latestSpec });
      return { spec: latestSpec };
    },
    run_developer: async (args) => {
      log("developer", "generate_component");
      const uiSpec = typeof args.ui_spec === "string" && args.ui_spec.trim() ? args.ui_spec : latestSpec || input.userRequest;
      latestDraft = await runDeveloper(
        input.providerConfig,
        uiSpec,
        stringifyMemory(input.sessionId),
        input.systemPrompt,
      );
      return { draft: latestDraft };
    },
    submit_final_component: async (args) => {
      log("orchestrator", "submit_final_component");
      const useLatestDraft = Boolean(args.use_latest_draft);
      const tsx = typeof args.tsx === "string" ? args.tsx : "";
      submittedCode = useLatestDraft ? latestDraft : tsx || latestDraft;
      if (!submittedCode) {
        throw new Error("submit_final_component called without tsx and no draft exists");
      }
      return { ok: true };
    },
  };

  log("orchestrator", "start");

  const loopInput = {
    config: input.providerConfig,
    systemPrompt: ORCHESTRATOR_SYSTEM_PROMPT,
    userPrompt: `Session ID: ${input.sessionId}\nUser request: ${input.userRequest}`,
    tools,
    toolHandlers,
    maxSteps: 10,
  };

  if (input.providerConfig.provider === "gemini") {
    await runGeminiToolLoop(loopInput);
  } else {
    await runOpenAIToolLoop(loopInput);
  }

  const rawCode = submittedCode || latestDraft;
  if (!rawCode) {
    throw new Error("Orchestrator completed without final component");
  }

  const code = extractCodeFromText(rawCode);
  log("orchestrator", "completed");

  return { code, trace };
}
