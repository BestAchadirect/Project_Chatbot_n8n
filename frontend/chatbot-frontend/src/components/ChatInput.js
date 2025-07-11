import { useState } from 'react';

export default function ChatInput({ onSend, onTyping }) {
  const [value, setValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(value);
      setValue('');
    }
  };

  return (
    <div className="chat-input">
      <textarea
        id="message-input"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onTyping();
        }}
        onKeyDown={handleKeyDown}
      />
      <button id="send-button" onClick={() => {
        onSend(value);
        setValue('');
      }}>
        Send
      </button>
    </div>
  );
}