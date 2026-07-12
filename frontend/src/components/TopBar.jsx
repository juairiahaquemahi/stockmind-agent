import { useState, useEffect } from "react";
import "./TopBar.css";

export default function Topbar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(new Date().toUTCString().split(" ")[4] + " UTC");
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="topbar-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </div>
        <span className="topbar-name">Stock<span>Mind</span> AI</span>
      </div>
      <div className="topbar-status">
        <div className="status-dot" />
        Finnhub Live · Gemini 2.5
      </div>
      <div className="topbar-meta">
        <span className="market-badge">{time}</span>
      </div>
    </header>
  );
}
