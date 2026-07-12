import { ToolMessage } from "@langchain/core/messages";

// Shared reasoning loop — used by both routes/chat.js's logic and portfolioAgent.js
// so there's one reasoning engine, not two copies of the same code.
export async function runAgentLoop({ model, toolsMap, promptTemplate, messages, maxLoops = 5 }) {
  const history = [...messages];
  const toolTrace = [];
  let loops = 0;

  while (loops < maxLoops) {
    loops++;
    const formatted = await promptTemplate.formatMessages({ messages: history });
    const response = await model.invoke(formatted);
    history.push(response);

    if (!response.tool_calls?.length) {
      return { finalText: response.content, toolTrace, loops };
    }

    for (const call of response.tool_calls) {
      const targetTool = toolsMap[call.name];
      let output;
      try {
        output = targetTool
          ? await targetTool.invoke(call.args)
          : `Error: tool '${call.name}' not found in registry.`;
      } catch (e) {
        output = `Error running tool '${call.name}': ${e.message}`;
      }
      toolTrace.push({ tool: call.name, args: call.args, output });
      history.push(
        new ToolMessage({
          content: typeof output === "string" ? output : JSON.stringify(output),
          tool_call_id: call.id,
          name: call.name,
        })
      );
    }
  }
  return { finalText: "⚠️ Max reasoning loops hit without a final answer.", toolTrace, loops };
}
