import MessageBubble from './MessageBubble';

export default function ChatBox({ messages }) {
  return (
    <div id="chat-box">
      {messages.map((msg, index) => (
        <MessageBubble key={index} sender={msg.sender} text={msg.text} />
      ))}
    </div>
  );
}