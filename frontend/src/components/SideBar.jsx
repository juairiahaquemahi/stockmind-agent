import "./SideBar.css";

export default function Sidebar({ sessions, activeId, onSelect, onNew, suggestions, onSuggest }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Sessions</span>
        <button className="new-chat-btn" onClick={onNew}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New
        </button>
      </div>
      <div className="sidebar-sessions">
        {sessions.map((s) => (
          <div key={s.id} className={`session-item ${s.id === activeId ? "active" : ""}`} onClick={() => onSelect(s.id)}>
            <div className="session-label">{s.label}</div>
            <div className="session-time">{s.time}</div>
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        <div className="suggested-label">Quick Ask</div>
        {suggestions.map((s, i) => (
          <button key={i} className="suggested-btn" onClick={() => onSuggest(s)}>{s}</button>
        ))}
      </div>
    </aside>
  );
}
