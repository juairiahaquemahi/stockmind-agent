import fs from "fs";

const FILE = "./portfolioMemory.json";

export function loadMemory() {
  return fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf-8")) : [];
}

export function saveMemoryEntry(entry) {
  const history = loadMemory();
  history.push(entry);
  // keep last 14 entries so the context fed back to the model stays small (cost control)
  fs.writeFileSync(FILE, JSON.stringify(history.slice(-14), null, 2));
}

export function memoryAsContext() {
  const history = loadMemory();
  if (!history.length) return "No prior analysis on record.";
  return history.map((e) => `[${e.date}] ${e.ticker}: ${e.summary}`).join("\n");
}
