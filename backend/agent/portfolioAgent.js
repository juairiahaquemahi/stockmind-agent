import { HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { toolsRegistry } from "./tools.js";
import { portfolioPrompt } from "./prompts.js";
import { runAgentLoop } from "./engine.js";
import { saveMemoryEntry, memoryAsContext } from "./portfolioMemory.js";
import { sendPortfolioEmail } from "../services/mailer.js";

const toolsMap = toolsRegistry.reduce((m, t) => ((m[t.name] = t), m), {});

// flash-lite: this run is unattended/batch, checks up to 4 tickers x 7 possible tools,
// so cost matters more here than on the interactive chat where a user is waiting.
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  temperature: 0.1,
}).bindTools(toolsRegistry);

const PORTFOLIO = (process.env.PORTFOLIO_TICKERS || "AAPL,NVDA,MSFT,AMZN").split(",");

export async function runDailyPortfolioAnalysis() {
  const prompt = new HumanMessage(
    `Analyze these tickers: ${PORTFOLIO.join(", ")}. For each, decide BUY, SELL, SHORT, or HOLD ` +
    `with a short reason grounded only in fetched data. Call each data tool at most once per ticker ` +
    `this run — do not re-fetch data you already have.\nPrior context from previous runs:\n${memoryAsContext()}`
  );

  const { finalText, toolTrace } = await runAgentLoop({
    model,
    toolsMap,
    promptTemplate: portfolioPrompt,
    messages: [prompt],
    maxLoops: 8,
  });

  const date = new Date().toISOString().split("T")[0];
  saveMemoryEntry({ date, ticker: "ALL", summary: finalText.slice(0, 200) });

  await sendPortfolioEmail(
    `📈 Portfolio Update — ${date}`,
    `<pre style="white-space:pre-wrap">${finalText}</pre><hr/><small>Tools called: ${toolTrace.map((t) => t.tool).join(", ") || "none"}</small>`
  );

  return { finalText, toolTrace };
}

