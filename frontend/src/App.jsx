import { useState } from "react";
import Sidebar from "./components/SideBar.jsx";
import Topbar from "./components/TopBar.jsx";
import ChatArea from "./components/ChatArea.jsx";
import InputBar from "./components/InputBar.jsx";
import "./App.css";

const SUGGESTIONS = [
  "What is the current price of AAPL?",
  "Compare TSLA vs RIVN fundamentals",
  "Show latest news for NVDA",
  "What is a P/E ratio?",
  "Is MSFT a good buy right now?",
  "Show me AMZN analyst recommendations",
];

export default function App() {
  const [sessions, setSessions] = useState([
    { id: 1, label: "New Conversation", time: "Just now", messages: [] },
  ]);
  const [activeId, setActiveId] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const activeSession = sessions.find((s) => s.id === activeId);

  function newChat() {
    const id = Date.now();
    setSessions((prev) => [
      { id, label: "New Conversation", time: "Just now", messages: [] },
      ...prev,
    ]);
    setActiveId(id);
  }

  function updateSession(id, updater) {
    setSessions((prev) => prev.map((s) => (s.id === id ? updater(s) : s)));
  }

  async function sendMessage(text) {
    if (!text.trim() || isLoading) return;

    updateSession(activeId, (s) => ({
      ...s,
      label: s.label === "New Conversation"
        ? text.slice(0, 36) + (text.length > 36 ? "…" : "")
        : s.label,
      messages: [...s.messages, { role: "user", content: text }],
    }));

    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      updateSession(activeId, (s) => ({
        ...s,
        messages: [
          ...s.messages,
          { role: "ai", content: data.response || data.error || "Something went wrong." },
        ],
      }));
    } catch {
      updateSession(activeId, (s) => ({
        ...s,
        messages: [
          ...s.messages,
          { role: "ai", content: "⚠️ Could not reach the server. Make sure the backend is running on port 3000." },
        ],
      }));
    }

    setIsLoading(false);
  }

  return (
    <div className="app">
      <Topbar />
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={newChat}
        suggestions={SUGGESTIONS}
        onSuggest={sendMessage}
      />
      <main className="main">
        <ChatArea
          messages={activeSession?.messages || []}
          isLoading={isLoading}
          onSuggest={sendMessage}
        />
        <InputBar onSend={sendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
}