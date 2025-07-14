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
    <div className="input-area">
      <div className="input-container">
        <textarea
          id="message-input"
          className="message-input w-full border border-[#96D0E6] rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#214166] focus:border-transparent resize-none min-h-[40px] max-h-[100px]"
          placeholder="Ask anything"
          rows={1}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onTyping();
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          id="send-button"
          className="send-button text-white rounded-full w-10 h-10 flex items-center justify-center focus:outline-none absolute right-3 bottom-3 bg-[#214166] hover:bg-[#0C2038] transition-colors"
          aria-label="Send message"
          onClick={() => {
            onSend(value);
            setValue('');
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}