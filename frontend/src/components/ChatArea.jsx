import { useEffect, useRef } from "react";
import Message from "./Message.jsx";
import "./ChatArea.css";

const CHIPS = [
  "What is the current stock price of Apple?",
  "Is NVDA a good buy right now?",
  "Explain what a bull market is",
  "Show me MSFT analyst recommendations",
  "Compare AMZN and GOOGL fundamentals",
];

export default function ChatArea({ messages, isLoading, onSuggest }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="chat-area">
      <div className="chat-inner">
        {messages.length === 0 ? (
          <div className="welcome">
            <div className="welcome-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <h1>Your <span>Financial AI</span> Analyst</h1>
            <p>Ask anything about stocks — live prices, fundamentals, news, analyst ratings, earnings, or financial concepts.</p>
            <div className="welcome-chips">
              {CHIPS.map((c, i) => (
                <button key={i} className="chip" onClick={() => onSuggest(c)}>{c}</button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <Message key={i} role={msg.role} content={msg.content} />
            ))}
            {isLoading && (
              <div className="message">
                <div className="avatar ai-avatar">🤖</div>
                <div className="typing-bubble">
                  <div className="dots"><span /><span /><span /></div>
                  <span className="typing-text">Analyzing...</span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}