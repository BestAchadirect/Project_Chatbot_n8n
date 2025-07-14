import MessageBubble from './MessageBubble';

export default function ChatBox({ messages }) {
  return (
    <div id="chat-box" className="chat-box flex flex-col gap-2 overflow-y-auto p-4 h-[74%] bg-white">
      {messages.map((msg, index) => (
        <MessageBubble key={index} sender={msg.sender} text={msg.text} timestamp={msg.timestamp} />
      ))}
    </div>
  );
}