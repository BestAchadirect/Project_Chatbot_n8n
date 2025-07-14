import React from 'react';

export default function ChatHeader({ connected, onClose }) {
  return (
    <div className="chat-header">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-14 h-14 rounded-full bg-white border-2 border-[#96D0E6] flex items-center justify-center overflow-hidden shadow-md">
            <img
              src="https://www.achadirect.com/static/version1746504482/frontend/store/acha/en_US/images/logo.webp"
              alt="Jewelry Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg">Jewelry Assistant</h3>
            <p className="text-xs text-[#96D0E6]">Wholesale Support</p>
            <div id="connection-status" className="text-xs text-gray-500">
              {connected ? '🟢 Online' : '🔴 Offline'}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-[#96D0E6] hover:text-white transition-colors"
          aria-label="Close chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}  