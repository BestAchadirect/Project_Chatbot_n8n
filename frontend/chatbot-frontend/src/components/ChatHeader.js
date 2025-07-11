export default function ChatHeader({ connected }) {
    return (
      <div className="chat-header">
        <span className={`text-xs ${connected ? 'text-green-500' : 'text-red-500'}`}>
          {connected ? '🟢 Online' : '🔴 Offline'}
        </span>
      </div>
    );
  }  