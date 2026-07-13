/*
import "dotenv/config"; // 🌟 Loaded first to prevent initialization crashes in routes
import express from "express";
import { chatRouter } from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Expose the clean API Routing address endpoint path
app.use("/api/chat", chatRouter);

app.listen(PORT, () => {
  console.log(`🚀 AI Reasoning Stock Agent Server live on: http://localhost:${PORT}`);
});

*/

import "dotenv/config"; 
import express from "express"; 
import { chatRouter } from "./routes/chat.js"; 
import { startScheduler } from "./scheduler.js"; 
import { runDailyPortfolioAnalysis } from "./agent/portfolioAgent.js"; 
const app = express(); 
const PORT = process.env.PORT || 3000; 
app.use(express.json()); 
app.use("/api/chat", chatRouter); 
app.post("/api/portfolio/run", async (req, res) => { 
try { 
const result = await runDailyPortfolioAnalysis(); 
res.json(result); 
} catch (e) { 
res.status(500).json({ error: e.message }); 
} 
}); 
app.get("/health", (req, res) => {
  res.json({ status: "alive", time: new Date().toISOString() });
});
app.listen(PORT, () => { 
console.log(`
🚀
 AI Reasoning Stock Agent Server live on: http://localhost:${PORT}`); 
startScheduler(); 
}); 
