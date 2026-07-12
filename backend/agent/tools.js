import { tool } from "@langchain/core/tools";
import { z } from "zod";

const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const BASE = "https://finnhub.io/api/v1";

// Helper: Finnhub GET request
async function finnhubGet(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("token", FINNHUB_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Finnhub API error: ${res.status} ${res.statusText}`);
  return res.json();
}

// 1. Live Stock Price
export const getStockPrice = tool(
  async ({ ticker }) => {
    try {
      const data = await finnhubGet("/quote", { symbol: ticker.toUpperCase() });
      if (!data || data.c === 0) return `Error: Could not find live price for '${ticker}'. Please check the ticker symbol.`;
      return (
        `Live Quote for ${ticker.toUpperCase()}:\n` +
        `- Current Price: $${data.c}\n` +
        `- Open: $${data.o}\n` +
        `- High: $${data.h}\n` +
        `- Low: $${data.l}\n` +
        `- Previous Close: $${data.pc}\n` +
        `- Change: $${(data.c - data.pc).toFixed(2)} (${(((data.c - data.pc) / data.pc) * 100).toFixed(2)}%)`
      );
    } catch (e) {
      return `Failed to fetch price for ${ticker}: ${e.message}`;
    }
  },
  {
    name: "get_stock_price",
    description: "Fetches the real-time live stock price and daily quote data (open, high, low, close, change) for any ticker symbol.",
    schema: z.object({
      ticker: z.string().describe("Stock ticker symbol e.g. AAPL, TSLA, NVDA, AMZN"),
    }),
  }
);

// 2. Company Fundamentals
export const getCompanyFundamentals = tool(
  async ({ ticker }) => {
    try {
      const data = await finnhubGet("/stock/metric", {
        symbol: ticker.toUpperCase(),
        metric: "all",
      });
      const m = data.metric;
      if (!m) return `No fundamental data found for '${ticker}'.`;
      return (
        `Fundamental Metrics for ${ticker.toUpperCase()}:\n` +
        `- P/E Ratio (TTM): ${m["peNormalizedAnnual"] ?? "N/A"}\n` +
        `- P/B Ratio: ${m["pb"] ?? "N/A"}\n` +
        `- EPS (TTM): $${m["epsNormalizedAnnual"] ?? "N/A"}\n` +
        `- Revenue Growth (YoY): ${m["revenueGrowthTTMYoy"] ?? "N/A"}%\n` +
        `- Gross Margin: ${m["grossMarginTTM"] ?? "N/A"}%\n` +
        `- Net Profit Margin: ${m["netProfitMarginTTM"] ?? "N/A"}%\n` +
        `- ROE: ${m["roeTTM"] ?? "N/A"}%\n` +
        `- Debt/Equity: ${m["totalDebt/totalEquityAnnual"] ?? "N/A"}\n` +
        `- 52-Week High: $${m["52WeekHigh"] ?? "N/A"}\n` +
        `- 52-Week Low: $${m["52WeekLow"] ?? "N/A"}\n` +
        `- Beta: ${m["beta"] ?? "N/A"}\n` +
        `- Dividend Yield: ${m["dividendYieldIndicatedAnnual"] ?? "N/A"}%`
      );
    } catch (e) {
      return `Failed to fetch fundamentals for ${ticker}: ${e.message}`;
    }
  },
  {
    name: "get_company_fundamentals",
    description: "Fetches detailed fundamental valuation and financial health metrics: P/E, P/B, EPS, margins, ROE, debt/equity, beta, dividend yield, and 52-week range.",
    schema: z.object({
      ticker: z.string().describe("Stock ticker symbol e.g. MSFT, GOOGL, META"),
    }),
  }
);

// 3. Company Profile
export const getCompanyProfile = tool(
  async ({ ticker }) => {
    try {
      const data = await finnhubGet("/stock/profile2", { symbol: ticker.toUpperCase() });
      if (!data || !data.name) return `No company profile found for '${ticker}'.`;
      return (
        `Company Profile: ${data.name} (${ticker.toUpperCase()})\n` +
        `- Industry: ${data.finnhubIndustry ?? "N/A"}\n` +
        `- Country: ${data.country ?? "N/A"}\n` +
        `- Exchange: ${data.exchange ?? "N/A"}\n` +
        `- Market Cap: $${data.marketCapitalization ? (data.marketCapitalization / 1000).toFixed(2) + "B" : "N/A"}\n` +
        `- Shares Outstanding: ${data.shareOutstanding ? data.shareOutstanding.toFixed(2) + "M" : "N/A"}\n` +
        `- IPO Date: ${data.ipo ?? "N/A"}\n` +
        `- Website: ${data.weburl ?? "N/A"}`
      );
    } catch (e) {
      return `Failed to fetch profile for ${ticker}: ${e.message}`;
    }
  },
  {
    name: "get_company_profile",
    description: "Fetches company background info: full name, industry, country, exchange, market cap, IPO date, and website.",
    schema: z.object({
      ticker: z.string().describe("Stock ticker symbol e.g. AAPL, TSLA"),
    }),
  }
);

// 4. Latest News
export const getStockNews = tool(
  async ({ ticker }) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const data = await finnhubGet("/company-news", {
        symbol: ticker.toUpperCase(),
        from: weekAgo,
        to: today,
      });
      if (!data || data.length === 0) return `No recent news found for '${ticker}'.`;
      const top5 = data.slice(0, 5);
      return (
        `Latest News for ${ticker.toUpperCase()} (Last 7 Days):\n\n` +
        top5
          .map(
            (n, i) =>
              `${i + 1}. [${n.source}] ${n.headline}\n   Summary: ${n.summary?.slice(0, 150) ?? "N/A"}...\n   Date: ${new Date(n.datetime * 1000).toDateString()}`
          )
          .join("\n\n")
      );
    } catch (e) {
      return `Failed to fetch news for ${ticker}: ${e.message}`;
    }
  },
  {
    name: "get_stock_news",
    description: "Fetches the latest news headlines and summaries for a stock from the past 7 days. Useful for understanding recent sentiment and events.",
    schema: z.object({
      ticker: z.string().describe("Stock ticker symbol e.g. AMZN, NVDA"),
    }),
  }
);

// 5. Analyst Recommendations
export const getAnalystRecommendations = tool(
  async ({ ticker }) => {
    try {
      const data = await finnhubGet("/stock/recommendation", { symbol: ticker.toUpperCase() });
      if (!data || data.length === 0) return `No analyst recommendations found for '${ticker}'.`;
      const latest = data[0];
      return (
        `Analyst Recommendations for ${ticker.toUpperCase()} (as of ${latest.period}):\n` +
        `- Strong Buy: ${latest.strongBuy}\n` +
        `- Buy: ${latest.buy}\n` +
        `- Hold: ${latest.hold}\n` +
        `- Sell: ${latest.sell}\n` +
        `- Strong Sell: ${latest.strongSell}\n` +
        `- Total Analysts: ${latest.strongBuy + latest.buy + latest.hold + latest.sell + latest.strongSell}`
      );
    } catch (e) {
      return `Failed to fetch recommendations for ${ticker}: ${e.message}`;
    }
  },
  {
    name: "get_analyst_recommendations",
    description: "Fetches the latest Wall Street analyst buy/sell/hold ratings and recommendations count for a stock.",
    schema: z.object({
      ticker: z.string().describe("Stock ticker symbol e.g. AAPL, MSFT"),
    }),
  }
);

// 6. EPS history (Earnings per Share) for the last 4 quarters
export const getEarningsHistory = tool(
  async ({ ticker }) => {
    try {
      const data = await finnhubGet("/stock/earnings", { symbol: ticker.toUpperCase() });
      if (!data || data.length === 0) return `No earnings data found for '${ticker}'.`;
      const recent = data.slice(0, 4);
      return (
        `Earnings History for ${ticker.toUpperCase()} (Last 4 Quarters):\n\n` +
        recent
          .map(
            (e) =>
              `Q${e.period}:\n  - Actual EPS: $${e.actual ?? "N/A"}\n  - Estimated EPS: $${e.estimate ?? "N/A"}\n  - Surprise: ${e.surprisePercent?.toFixed(2) ?? "N/A"}%`
          )
          .join("\n\n")
      );
    } catch (e) {
      return `Failed to fetch earnings for ${ticker}: ${e.message}`;
    }
  },
  {
    name: "get_earnings_history",
    description: "Fetches the last 4 quarters of EPS earnings history including actual vs estimated EPS and surprise percentage.",
    schema: z.object({
      ticker: z.string().describe("Stock ticker symbol e.g. GOOGL, META"),
    }),
  }
);

// 7. (Insider/Market Sentiment)
export const getInsiderSentiment = tool(
  async ({ ticker }) => {
    try {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split("T")[0];
      const to = now.toISOString().split("T")[0];
      const data = await finnhubGet("/stock/insider-sentiment", {
        symbol: ticker.toUpperCase(),
        from,
        to,
      });
      if (!data || !data.data || data.data.length === 0) return `No insider sentiment data found for '${ticker}'.`;
      const latest = data.data[data.data.length - 1];
      return (
        `Insider Sentiment for ${ticker.toUpperCase()} (${latest.year}-${String(latest.month).padStart(2, "0")}):\n` +
        `- MSPR (Monthly Share Purchase Ratio): ${latest.mspr?.toFixed(4) ?? "N/A"}\n` +
        `- Change (Net Insider Buy/Sell): ${latest.change ?? "N/A"}\n` +
        `Note: Positive MSPR indicates insider buying (bullish signal). Negative indicates selling.`
      );
    } catch (e) {
      return `Failed to fetch insider sentiment for ${ticker}: ${e.message}`;
    }
  },
  {
    name: "get_insider_sentiment",
    description: "Fetches insider trading sentiment data showing whether company insiders are buying or selling shares — a key signal for institutional confidence.",
    schema: z.object({
      ticker: z.string().describe("Stock ticker symbol e.g. TSLA, NVDA"),
    }),
  }
);

// all tools are being exported (chat.js will use this registry to call tools dynamically)
export const toolsRegistry = [
  getStockPrice,
  getCompanyFundamentals,
  getCompanyProfile,
  getStockNews,
  getAnalystRecommendations,
  getEarningsHistory,
  getInsiderSentiment,
];
