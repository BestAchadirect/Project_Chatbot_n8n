/**
 * @fileoverview Message handling utilities for chat application
 * Provides functions for parsing, formatting, and processing chat messages
 */

/**
 * Parses incoming WebSocket messages and processes them appropriately
 * @param {MessageEvent} event - The WebSocket message event
 * @param {Function} addMessage - Callback function to add message to chat
 * @description
 * Handles different message formats:
 * - JSON messages with sender and message
 * - Join messages (ignored)
 * - String messages (treated as bot messages)
 * - Raw data (fallback)
 */
export function parseWebSocketMessage(event, addMessage) {
  try {
    const data = JSON.parse(event.data);
    if (data.type === 'join') return;
    if (data.sender && data.message) {
      addMessage(data.sender, data.message);
    } else if (typeof data === 'string') {
      addMessage('bot', data);
    }
  } catch (e) {
    // If parsing fails, treat as raw message
    addMessage('bot', event.data);
  }
}

/**
 * Formats bot response data into a consistent message format
 * @param {Object|Array} data - Response data from the backend
 * @returns {string} Formatted message text
 * @description
 * Handles multiple response formats:
 * - Direct response object
 * - Array of outputs
 * - Provides fallback message for invalid responses
 */
export function formatBotResponse(data) {
  return data?.response || 
         data[0]?.output || 
         'Sorry, I am having trouble processing your request. Please try again.';
}
