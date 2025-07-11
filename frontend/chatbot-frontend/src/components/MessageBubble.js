export default function MessageBubble({ sender, text }) {
    return (
      <div className={`chat-message ${sender}`}>
        <div className="message-bubble">
          <div className="message-content">{text}</div>
          <div className="message-time text-xs opacity-60">{new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    );
  }  