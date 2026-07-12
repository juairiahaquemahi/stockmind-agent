/*import "dotenv/config";
import express from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { agentPrompt } from "../agent/prompts.js";
import { toolsRegistry } from "../agent/tools.js";
import { HumanMessage, ToolMessage } from "@langchain/core/messages";

const router = express.Router();

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.1,
});

const modelWithTools = model.bindTools(toolsRegistry);

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message context string is required." });
    }

    let executionMessages = [new HumanMessage(message)];

    // Reasoning loop allowing up to 5 automatic iterations
    for (let loopCounter = 0; loopCounter < 5; loopCounter++) { 
      const formattedPrompt = await agentPrompt.formatMessages({
        messages: executionMessages,
      });

      const aiResponse = await modelWithTools.invoke(formattedPrompt);

      // Check if Gemini needs to use a tool to gather data
      if (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
        executionMessages.push(aiResponse);

        for (const toolCall of aiResponse.tool_calls) {
          const targetedTool = toolsRegistry.find((t) => t.name === toolCall.name);

          if (targetedTool) {
            console.log(`[Reasoning Loop ${loopCounter + 1}]: Running tool '${toolCall.name}' for:`, toolCall.args);
            try {
              const observation = await targetedTool.invoke(toolCall.args);
              executionMessages.push(
                new ToolMessage({
                  content: typeof observation === "string" ? observation : JSON.stringify(observation),
                  tool_call_id: toolCall.id,
                  name: toolCall.name,
                })
              );
            } catch (toolError) {
              console.error(`Tool '${toolCall.name}' failed:`, toolError.message);
              executionMessages.push(
                new ToolMessage({
                  content: `Error running tool '${toolCall.name}': ${toolError.message}`,
                  tool_call_id: toolCall.id,
                  name: toolCall.name,
                })
              );
            }
          } else {
            executionMessages.push(
              new ToolMessage({
                content: `Error: Tool '${toolCall.name}' not found in registry.`,
                tool_call_id: toolCall.id,
                name: toolCall.name,
              })
            );
          }
        }
        continue;
      }

      // No more tool calls — return final answer
      return res.json({ response: aiResponse.content });
    }

    return res.status(500).json({
      error: "Agent reasoning timed out without reaching a conclusion. Please try rephrasing your question.",
    });
  } catch (error) {
    console.error("Stock Agent Runtime Error:", error);
    return res.status(500).json({ error: "Internal processing error: " + error.message });
  }
});

export { router as chatRouter };*/

import "dotenv/config";
import express from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { agentPrompt } from "../agent/prompts.js";
import { toolsRegistry } from "../agent/tools.js";
import { HumanMessage } from "@langchain/core/messages";
import { runAgentLoop } from "../agent/engine.js";

const router = express.Router();

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.1,
}).bindTools(toolsRegistry);

const toolsMap = toolsRegistry.reduce((m, t) => ((m[t.name] = t), m), {});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message context string is required." });
    }

    const { finalText } = await runAgentLoop({
      model,
      toolsMap,
      promptTemplate: agentPrompt,
      messages: [new HumanMessage(message)],
      maxLoops: 5,
    });

    return res.json({ response: finalText });
  } catch (error) {
    console.error("Stock Agent Runtime Error:", error);
    return res.status(500).json({ error: "Internal processing error: " + error.message });
  }
});

export { router as chatRouter };
