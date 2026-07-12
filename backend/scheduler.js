import cron from "node-cron";
import { runDailyPortfolioAnalysis } from "./agent/portfolioAgent.js";

const TZ = process.env.TIMEZONE || "Asia/Dhaka";

export function startScheduler() {
  cron.schedule(process.env.CRON_1 || "0 9 * * *", runDailyPortfolioAnalysis, { timezone: TZ });
  cron.schedule(process.env.CRON_2 || "0 17 * * *", runDailyPortfolioAnalysis, { timezone: TZ });
  console.log(`⏰ Portfolio scheduler active (${TZ}): ${process.env.CRON_1 || "09:00"} & ${process.env.CRON_2 || "17:00"}`);
}

