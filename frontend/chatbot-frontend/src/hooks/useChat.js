// src/hooks/useChat.js
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const typingTimer = useRef(null);
  const sessionId = useRef(getOrCreateSessionId());

  useEffect(() => {
    const socket = io('http://localhost:5001');
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_session', { sessionId: sessionId.current });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('new_message', (data) => {
      if (data.sender === 'bot') {
        setMessages(prev => [...prev, { sender: 'bot', text: data.message }]);
      }
    });

    socket.on('user_typing', (data) => {
      // optional: handle real-time typing UI
    });

    loadChatHistory();

    return () => socket.disconnect();
  }, []);

  async function loadChatHistory() {
    const res = await fetch(`http://localhost:5001/chat/messages/${sessionId.current}`);
    const data = await res.json();
    if (data.messages) {
      setMessages(data.messages.map(msg => ({ sender: msg.sender, text: msg.message })));
    }
  }

  function sendMessage(message) {
    if (!message.trim()) return;

    const msg = { sender: 'user', text: message };
    setMessages(prev => [...prev, msg]);

    socketRef.current?.emit('send_message', {
      sessionId: sessionId.current,
      message: message,
      sender: 'user'
    });

    // Show typing + fetch response
    setMessages(prev => [...prev, { sender: 'system', text: '...' }]);
    fetch('http://localhost:5001/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sessionId.current, message })
    })
      .then(res => res.json())
      .then(data => {
        setMessages(prev => [...prev.slice(0, -1), { sender: 'bot', text: data?.response || data[0]?.output || 'No response.' }]);
      })
      .catch(err => {
        setMessages(prev => [...prev.slice(0, -1), { sender: 'bot', text: 'Error occurred.' }]);
        console.error(err);
      });
  }

  function handleTyping() {
    socketRef.current?.emit('typing', { sessionId: sessionId.current, isTyping: true });

    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('typing', { sessionId: sessionId.current, isTyping: false });
    }, 1000);
  }

  return { messages, sendMessage, handleTyping, connected };
}

// Include your session utils here:
function generateSessionId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
function getOrCreateSessionId() {
  let id = sessionStorage.getItem('sessionId');
  if (!id || !/^[A-Za-z0-9]{20}$/.test(id)) {
    id = generateSessionId();
    sessionStorage.setItem('sessionId', id);
  }
  return id;
}