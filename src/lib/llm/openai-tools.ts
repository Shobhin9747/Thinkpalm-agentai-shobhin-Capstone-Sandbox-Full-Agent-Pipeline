import { getOpenAICompatibleEndpoint } from "@/lib/llm/provider";
import type { ToolCall, ToolLoopInput, ToolLoopOutput } from "@/lib/llm/types";

type OpenAIMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content?: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
  name?: string;
};

export async function runOpenAIToolLoop(input: ToolLoopInput): Promise<ToolLoopOutput> {
  const maxSteps = input.maxSteps ?? 10;
  const endpoint = getOpenAICompatibleEndpoint(input.config.provider);
  const calls: ToolCall[] = [];

  const messages: OpenAIMessage[] = [
    { role: "system", content: input.systemPrompt },
    { role: "user", content: input.userPrompt },
  ];

  for (let step = 0; step < maxSteps; step += 1) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.config.apiKey}`,
      },
      body: JSON.stringify({
        model: input.config.model,
        temperature: 0,
        messages,
        tools: input.tools.map((tool) => ({
          type: "function",
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || response.statusText || "OpenAI-compatible call failed");
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message as OpenAIMessage | undefined;
    if (!assistantMessage) {
      throw new Error("Provider returned an empty assistant message");
    }

    messages.push({
      role: "assistant",
      content: assistantMessage.content ?? "",
      tool_calls: assistantMessage.tool_calls,
    });

    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      return {
        finalText: assistantMessage.content ?? "",
        calls,
      };
    }

    for (const toolCall of assistantMessage.tool_calls) {
      const callId = toolCall.id;
      const toolName = toolCall.function.name;
      let parsedArgs: Record<string, unknown> = {};
      try {
        parsedArgs = JSON.parse(toolCall.function.arguments || "{}");
      } catch {
        parsedArgs = {};
      }

      calls.push({
        id: callId,
        name: toolName,
        args: parsedArgs,
      });

      const handler = input.toolHandlers[toolName];
      if (!handler) {
        throw new Error(`No handler registered for tool: ${toolName}`);
      }

      const result = await handler(parsedArgs, callId);
      messages.push({
        role: "tool",
        tool_call_id: callId,
        name: toolName,
        content: JSON.stringify(result),
      });
    }
  }

  throw new Error("Tool loop exceeded max iterations");
}
