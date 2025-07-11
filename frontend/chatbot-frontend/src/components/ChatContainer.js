import useChat from '../hooks/useChat';
import ChatBox from './ChatBox';
import ChatInput from './ChatInput';
import ChatHeader from './ChatHeader';

export default function ChatContainer() {
  const { messages, sendMessage, handleTyping, connected } = useChat();

  return (
    <div id="chat-container">
      <ChatHeader connected={connected} />
      <ChatBox messages={messages} />
      <ChatInput onSend={sendMessage} onTyping={handleTyping} />
    </div>
  );
}