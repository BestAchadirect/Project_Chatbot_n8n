import React, { useState } from 'react';
import useChat from '../hooks/useChat';
import ChatBox from './ChatBox';
import ChatInput from './ChatInput';
import ChatHeader from './ChatHeader';

function ChatToggle({ onClick }) {
  return (
    <div
      id="chat-toggle"
      className="chat-toggle fixed bottom-8 right-8 w-16 h-16 bg-[#214166] text-white flex items-center justify-center rounded-full cursor-pointer shadow-lg z-50 hover:bg-[#0C2038] transition-all animate-bounce group"
      onClick={onClick}
      title="Chat with us!"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      {/* Tooltip for desktop */}
      <span className="absolute bottom-20 left-1/2 -translate-x-1/2 px-3 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        Chat with us!
      </span>
    </div>
  );
}

export default function ChatContainer() {
  const { messages, sendMessage, handleTyping, connected } = useChat();
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && <ChatToggle onClick={() => setOpen(true)} />}
      {open && (
        <div
          id="chat-container"
          className="chat-container fixed bottom-12 right-8 w-[380px] h-[600px] bg-white border border-[#96D0E6]/30 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col opacity-100 scale-100 transition-all"
        >
          <ChatHeader connected={connected} onClose={() => setOpen(false)} />
          <ChatBox messages={messages} />
          <ChatInput onSend={sendMessage} onTyping={handleTyping} />
        </div>
      )}
    </>
  );
}