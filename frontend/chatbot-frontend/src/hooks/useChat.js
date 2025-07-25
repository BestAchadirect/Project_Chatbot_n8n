
/**
 * @fileoverview Custom React Hook for managing chat functionality
 * This hook handles WebSocket connections, message history, and chat interactions
 * with the backend server. It implements real-time messaging and handles both
 * WebSocket and REST API communications.
 */

import { useState, useEffect, useRef } from 'react';
import { config } from '../utils/config';
import { createRequestHeaders } from '../utils/security';
import { getOrCreateSessionId, getOrCreateUserId } from '../utils/session';
import { parseWebSocketMessage, formatBotResponse } from '../utils/messageHandling';

/**
 * Custom hook for chat functionality
 * @returns {Object} Chat interface methods and state
 * @property {Array} messages - Array of chat messages
 * @property {Array} sessions - Array of chat sessions
 * @property {Function} sendMessage - Function to send a new message
 * @property {Function} handleTyping - Function to handle typing events
 * @property {boolean} connected - WebSocket connection status
 */
export default function useChat() {
  // State for storing chat messages, sessions and connection status
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [connected, setConnected] = useState(false);
  
  // Refs for persistent values across renders
  const wsRef = useRef(null);  // WebSocket reference
  const userId = useRef(getOrCreateUserId());  // Persistent user identifier
  const sessionId = useRef(getOrCreateSessionId());  // Session-based chat ID

  /**
   * Effect hook to load chat sessions and history when component mounts
   */
  useEffect(() => {
    loadChatSessions();
  }, []);

  /**
   * Effect hook to establish and manage WebSocket connection
   * Handles connection lifecycle events (open, close, error, message)
   * Automatically reconnects when connection is lost
   */
  useEffect(() => {
    const ws = new window.WebSocket(config.WS_URL);
    wsRef.current = ws;

    // Handle successful connection
    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: 'join', sessionId: sessionId.current }));
    };

    // Handle connection closure
    ws.onclose = () => setConnected(false);

    // Handle connection errors
    ws.onerror = (err) => {
      setConnected(false);
      console.error('WebSocket error:', err);
    };

    // Handle incoming messages
    ws.onmessage = (event) => parseWebSocketMessage(event, addMessage);

    return () => ws.close();
    // eslint-disable-next-line
  }, []);

  /**
   * Message Handlers Section
   * Contains functions for processing different types of messages
   */

  /**
   * Handles incoming WebSocket messages
   * Parses the message data and updates chat state accordingly
   * @param {MessageEvent} event - The WebSocket message event
   */
  function handleWsMessage(event) {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'join') return;
      if (data.sender && data.message) {
        addMessage(data.sender, data.message);
      } else if (typeof data === 'string') {
        addMessage('bot', data);
      }
    } catch (e) {
      addMessage('bot', event.data);
    }
  }

  /**
   * Adds a new message to the chat state
   * @param {string} sender - The sender of the message ('user', 'bot', or 'system')
   * @param {string} text - The message content
   */
  function addMessage(sender, text) {
    setMessages(prev => [...prev, { 
      sender, 
      text, 
      timestamp: Date.now() 
    }]);
  }

  /**
   * Loads previous chat messages from the backend API
   * Retrieves and formats the chat history for the current session
   */
  /**
   * Load available chat sessions for the current user
   */
  async function loadChatSessions() {
    try {
      const res = await fetch(`${config.API_BASE}/chat/sessions?user_id=${userId.current}`);
      const data = await res.json();
      if (data.sessions) {
        setSessions(data.sessions);
        // Load messages for current session if it exists
        if (sessionId.current) {
          loadChatHistory(sessionId.current);
        }
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    }
  }

  /**
   * Load chat history for a specific session
   */
  async function loadChatHistory(targetSessionId = null) {
    try {
      const sid = targetSessionId || sessionId.current;
      const res = await fetch(`${config.API_BASE}/chat/messages/${sid}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages.map(msg => ({ 
          sender: msg.sender, 
          text: msg.message, 
          timestamp: msg.timestamp || Date.now() 
        })));
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  }


  /**
   * Sends a user message to the backend through both WebSocket and REST API
   * Handles message delivery, typing indicators, and response processing
   * @param {string} message - The message to send
   */
  function sendMessage(message) {
    // Validate message
    if (!message.trim()) return;

    // Add user message to local state
    addMessage('user', message);

    // Send message via WebSocket if connection is active
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({
        sessionId: sessionId.current,
        message,
        sender: 'user',
        type: 'message'
      }));
    }

    // Show typing indicator while waiting for response
    addMessage('system', 'Thinking...');
    
    // Setup request timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.API_TIMEOUT);

    // Send message to backend via REST API
    fetch(`${config.API_BASE}/chat/message`, {
      method: 'POST',
      headers: createRequestHeaders(process.env.REACT_APP_ENABLE_SECURITY_HEADERS),
      credentials: 'same-origin', // Enhance CSRF protection
      body: JSON.stringify({ sessionId: sessionId.current, message }),
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => {
        // Replace typing indicator with formatted bot response
        setMessages(prev => [
          ...prev.slice(0, -1),
          { 
            sender: 'bot', 
            text: formatBotResponse(data), 
            timestamp: Date.now() 
          }
        ]);
      })
      .catch(err => {
        // Handle errors by showing error message
        setMessages(prev => [
          ...prev.slice(0, -1),
          { 
            sender: 'bot', 
            text: 'Error occurred.', 
            timestamp: Date.now() 
          }
        ]);
        console.error('Chat message error:', err);
      })
      .finally(() => {
        // Clean up timeout
        clearTimeout(timeoutId);
      });
  }

  /**
   * Handles user typing events
   * Can be implemented to show typing indicators or send typing status
   */
  function handleTyping() {
    // Implementation for typing events can be added here
  }

  // Return public interface
  return {
    messages,    // Array of chat messages
    sendMessage, // Function to send messages
    handleTyping,// Function to handle typing events
    connected    // WebSocket connection status
  };
}