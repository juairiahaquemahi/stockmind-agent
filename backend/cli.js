import "dotenv/config";
import readline from "readline";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, ToolMessage } from "@langchain/core/messages";
import { agentPrompt } from "./agent/prompts.js";


import * as stockTools from "./agent/tools.js";


const tools = Object.values(stockTools).filter(item => typeof item === "object" && "name" in item);
const toolsMap = tools.reduce((map, tool) => {
  map[tool.name] = tool;
  return map;
}, {});

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite", // ১,০০০ ফ্রি রিকোয়েস্ট প্রতিদিন
  temperature: 0.1,
}).bindTools(tools);


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


const conversationHistory = [];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function handleTerminalInput(userInput) {
  if (userInput.trim().toLowerCase() === "exit") {
    console.log("\n👋 Goodbye! Happy investing.");
    rl.close();
    return;
  }


  conversationHistory.push(new HumanMessage(userInput));
  
  console.log("\n🧠 Think Loop Started...");
  let loopCounter = 0;
  let keepRunning = true;

  while (keepRunning && loopCounter < 5) {
    loopCounter++;
    
   
    await sleep(1000);


    const formattedPrompt = await agentPrompt.formatMessages({
      messages: conversationHistory,
    });

    const response = await model.invoke(formattedPrompt);
    conversationHistory.push(response);

  
    if (response.tool_calls && response.tool_calls.length > 0) {
      for (const toolCall of response.tool_calls) {
        console.log(`🔧 [Executing Tool]: ${toolCall.name} with inputs:`, toolCall.args);
        
        const targetTool = toolsMap[toolCall.name];
        let toolOutput;

        if (targetTool) {
          try {
            toolOutput = await targetTool.invoke(toolCall.args);
          } catch (error) {
            toolOutput = `Error running tool: ${error.message}`;
          }
        } else {
          toolOutput = `Error: Requested tool '${toolCall.name}' not found in tools mapping.`;
        }

        console.log(`📊 [Tool Data Feed Completed]`);
        

        conversationHistory.push(
          new ToolMessage({
            content: toolOutput,
            tool_call_id: toolCall.id,
            name: toolCall.name,
          })
        );
      }
    } else {
  
      console.log("\n🎯 Final Analysis:\n----------------------------------------");
      console.log(response.content);
      console.log("----------------------------------------\n");
      keepRunning = false;
    }
  }

  if (loopCounter >= 5) {
    console.log("⚠️ Agent breakout: Maximum reasoning loop cycles hit.\n");
  }


  promptUser();
}

function promptUser() {
  rl.question("👤 Ask the Agent (or type 'exit'): ", handleTerminalInput);
}

console.log("🤖 Financial AI Reasoning Agent Terminal Active (High Quota Mode).");
console.log("=================================================================");
promptUser();