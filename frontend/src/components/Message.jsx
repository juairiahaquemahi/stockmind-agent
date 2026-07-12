import "./Message.css";

const DATA_PATTERN = /^[-•*]?\s*(Current Price|Open|High|Low|Previous Close|Change|P\/E|P\/B|EPS|Market Cap|52-Week|Beta|ROE|Revenue|Margin|Dividend|Debt|Shares|IPO|Strong Buy|Buy:|Hold:|Sell:|Strong Sell|MSPR|Actual EPS|Estimated EPS|Surprise).*:/i;

function parseContent(text) {
  const lines = text.split("\n");
  const parts = [];
  let textLines = [], cardLines = [], inCard = false;

  for (const line of lines) {
    if (DATA_PATTERN.test(line.trim())) {
      if (!inCard && textLines.length > 0) { parts.push({ type: "text", lines: [...textLines] }); textLines = []; }
      inCard = true;
      cardLines.push(line);
    } else {
      if (inCard) { parts.push({ type: "card", lines: [...cardLines] }); cardLines = []; inCard = false; }
      textLines.push(line);
    }
  }
  if (cardLines.length > 0) parts.push({ type: "card", lines: cardLines });
  if (textLines.length > 0) parts.push({ type: "text", lines: textLines });
  return parts;
}

function StockCard({ lines }) {
  const rows = lines.map((line) => {
    const trimmed = line.replace(/^[-•*]\s*/, "").trim();
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) return null;
    const label = trimmed.substring(0, colonIdx).trim();
    const value = trimmed.substring(colonIdx + 1).trim();
    if (!label || !value) return null;
    let cls = "value";
    if (value.startsWith("+")) cls += " green";
    else if (value.startsWith("-")) cls += " red";
    else if (/strong buy|buy/i.test(label)) cls += " green";
    else if (/sell/i.test(label)) cls += " red";
    return { label, value, cls };
  }).filter(Boolean);

  return (
    <div className="stock-card">
      <div className="stock-card-title">📊 Market Data</div>
      {rows.map((r, i) => (
        <div key={i} className="stock-row">
          <span className="row-label">{r.label}</span>
          <span className={r.cls}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Message({ role, content }) {
  if (role === "user") {
    return (
      <div className="message user">
        <div className="avatar user">👤</div>
        <div className="bubble user-bubble">{content}</div>
      </div>
    );
  }
  const parts = parseContent(content);
  return (
    <div className="message">
      <div className="avatar ai-avatar">🤖</div>
      <div className="bubble ai-bubble">
        {parts.map((part, i) =>
          part.type === "card"
            ? <StockCard key={i} lines={part.lines} />
            : <p key={i} className="text-part">{part.lines.join("\n").trim()}</p>
        )}
      </div>
    </div>
  );
}