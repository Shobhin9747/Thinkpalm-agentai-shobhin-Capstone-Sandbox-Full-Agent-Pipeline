import { createGeminiClient } from "@/lib/llm/provider";
import type { ToolCall, ToolLoopInput, ToolLoopOutput } from "@/lib/llm/types";

export async function runGeminiToolLoop(input: ToolLoopInput): Promise<ToolLoopOutput> {
  const maxSteps = input.maxSteps ?? 10;
  const calls: ToolCall[] = [];
  const client = createGeminiClient(input.config.apiKey);

  const model = client.getGenerativeModel({
    model: input.config.model,
    systemInstruction: input.systemPrompt,
    tools: [
      {
        functionDeclarations: input.tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        })),
      },
    ],
  });

  const chat = model.startChat({
    history: [],
    generationConfig: {
      temperature: 0,
    },
  });

  let nextPrompt = input.userPrompt;

  for (let step = 0; step < maxSteps; step += 1) {
    const result = await chat.sendMessage(nextPrompt);
    const response = await result.response;
    const functionCalls = response.functionCalls() ?? [];

    if (functionCalls.length === 0) {
      return {
        finalText: response.text() ?? "",
        calls,
      };
    }

    const toolResponses: Array<{ functionResponse: { name: string; response: unknown } }> = [];

    for (let index = 0; index < functionCalls.length; index += 1) {
      const fn = functionCalls[index];
      const callId = `${step}-${index}-${fn.name}`;
      const args = (fn.args || {}) as Record<string, unknown>;
      const handler = input.toolHandlers[fn.name];
      if (!handler) {
        throw new Error(`No handler registered for tool: ${fn.name}`);
      }

      calls.push({
        id: callId,
        name: fn.name,
        args,
      });

      const handlerResult = await handler(args, callId);
      toolResponses.push({
        functionResponse: {
          name: fn.name,
          response: handlerResult,
        },
      });
    }

    const followUp = await chat.sendMessage(toolResponses);
    const followUpResponse = await followUp.response;
    if ((followUpResponse.functionCalls() ?? []).length === 0) {
      return {
        finalText: followUpResponse.text() ?? "",
        calls,
      };
    }

    nextPrompt = "";
  }

  throw new Error("Tool loop exceeded max iterations");
}
