// -----------------------------
// 🔧 Utility Functions
// -----------------------------

function generateSessionId() {
  // Generate a random 20-character alphanumeric string (varchar-like)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let sessionId = '';
  for (let i = 0; i < 20; i++) {
    sessionId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return sessionId;
}

function isValidSessionId(id) {
  // Check if id is a 20-character alphanumeric string
  return typeof id === 'string' && /^[A-Za-z0-9]{20}$/.test(id);
}

function getOrCreateSessionId() {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId || !isValidSessionId(sessionId)) {
    sessionId = generateSessionId();
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

function askQuestion(question) {
  const input = document.getElementById('message-input');
  input.value = question;
  input.focus();

  // Prevent duplicate calls by disabling the button temporarily
  const sendButton = document.getElementById('send-button');
  sendButton.disabled = true;

  sendMessage().finally(() => {
    sendButton.disabled = false; // Re-enable the button after the message is sent
  });
}

// -----------------------------
// 🌐 WebSocket Connection
// -----------------------------

let socket = null;
let isConnected = false;

function initializeWebSocket() {
  // Connect to WebSocket server
  socket = io('http://localhost:5001');
  
  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
    isConnected = true;
    
    // Join the current session
    const sessionId = getOrCreateSessionId();
    socket.emit('join_session', { sessionId });
    
    // Show connection status
    showConnectionStatus('connected');
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
    isConnected = false;
    showConnectionStatus('disconnected');
  });
  
  socket.on('new_message', (data) => {
    // Handle incoming real-time messages
    if (data.sender === 'bot') {
      removeTypingIndicator();
      appendMessage('bot', data.message);
    }
  });
  
  socket.on('user_typing', (data) => {
    // Show typing indicator for other users
    if (data.isTyping) {
      showTypingIndicator();
    } else {
      removeTypingIndicator();
    }
  });
  
  socket.on('error', (data) => {
    console.error('WebSocket error:', data.error);
    appendMessage('system', `Error: ${data.error}`);
  });
}

function showConnectionStatus(status) {
  const statusElement = document.getElementById('connection-status');
  if (statusElement) {
    statusElement.textContent = status === 'connected' ? '🟢 Online' : '🔴 Offline';
    statusElement.className = `text-xs ${status === 'connected' ? 'text-green-500' : 'text-red-500'}`;
  }
}

// -----------------------------
// 🗂️ Session Initialization
// -----------------------------

function initializeSession() {
  const sessionId = getOrCreateSessionId();
  
  // Initialize WebSocket connection
  initializeWebSocket();
  
  // Load chat history if available
  loadChatHistory();
  
  return { sessionId };
}

// -----------------------------
// 💬 Chat Rendering
// -----------------------------

function appendMessage(sender, text) {
  const chatBox = document.getElementById('chat-box');
  const msg = document.createElement('div');
  msg.classList.add('chat-message', sender);

  // Create message bubble
  const messageBubble = document.createElement('div');
  messageBubble.classList.add('message-bubble');
  
  // Add timestamp
  const timestamp = new Date().toLocaleTimeString();
  messageBubble.innerHTML = `
    <div class="message-content">${typeof text === 'string' ? text : JSON.stringify(text)}</div>
    <div class="message-time text-xs opacity-60">${timestamp}</div>
  `;
  
  msg.appendChild(messageBubble);
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  // Auto-scroll to bottom
  setTimeout(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 100);
}

function showTypingIndicator() {
  const chatBox = document.getElementById('chat-box');
  const typingIndicator = document.createElement('div');
  typingIndicator.id = 'typing-indicator';
  typingIndicator.classList.add('chat-message', 'bot', 'typing-indicator');
  typingIndicator.innerHTML = `
    <div class="message-bubble typing-indicator">
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  chatBox.appendChild(typingIndicator);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
  try {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  } catch (error) {
    console.error('Remove typing indicator error:', error);
  }
}

// -----------------------------
// 📚 Chat History
// -----------------------------

async function loadChatHistory() {
  const sessionId = getOrCreateSessionId();
  
  try {
    const response = await fetch(`http://localhost:5001/chat/messages/${sessionId}`);
    if (response.ok) {
      const data = await response.json();
      
      // Clear existing messages
      const chatBox = document.getElementById('chat-box');
      chatBox.innerHTML = '';
      
      // Load messages
      data.messages.forEach(msg => {
        appendMessage(msg.sender, msg.message);
      });
    }
  } catch (error) {
    console.error('Error loading chat history:', error);
  }
}

// -----------------------------
// 🚀 Chat API Logic
// -----------------------------

async function sendMessage() {
  const input = document.getElementById('message-input');
  const message = input.value.trim();
  if (!message) return;

  const sessionId = getOrCreateSessionId();
  
  // Add user message to chat
  appendMessage('user', message);
  input.value = '';
  input.style.height = 'auto';

  // Send message via WebSocket if connected
  if (socket && isConnected) {
    socket.emit('send_message', {
      sessionId: sessionId,
      message: message,
      sender: 'user'
    });
  }

  // Show typing indicator
  showTypingIndicator();

  try {
    // Also send via HTTP API for n8n processing
    const response = await fetch('http://localhost:5001/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        message: message
      })
    });

    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

    removeTypingIndicator();

    // Display the bot's response in the chat
    if (Array.isArray(data) && data[0] && data[0].output) {
      appendMessage('bot', data[0].output);
    } else if (data && data.response) {
      appendMessage('bot', data.response);
    } else {
      appendMessage('bot', 'No response received.');
    }

  } catch (error) {
    removeTypingIndicator();
    appendMessage('bot', 'Sorry, something went wrong.');
    console.error('Backend error:', error);
  }
}

// -----------------------------
// ⌨️ Typing Indicator
// -----------------------------

let typingTimer = null;

function handleTyping() {
  const sessionId = getOrCreateSessionId();
  
  // Clear existing timer
  if (typingTimer) {
    clearTimeout(typingTimer);
  }
  
  // Emit typing start
  if (socket && isConnected) {
    socket.emit('typing', {
      sessionId: sessionId,
      isTyping: true
    });
  }
  
  // Set timer to stop typing indicator
  typingTimer = setTimeout(() => {
    if (socket && isConnected) {
      socket.emit('typing', {
        sessionId: sessionId,
        isTyping: false
      });
    }
  }, 1000);
}

// -----------------------------
// 🎯 Event Listeners
// -----------------------------

document.addEventListener('DOMContentLoaded', function() {
  // Initialize session
  initializeSession();
  
  // Send button event
  const sendButton = document.getElementById('send-button');
  if (sendButton) {
    sendButton.addEventListener('click', sendMessage);
  }

  // Message input events
  const messageInput = document.getElementById('message-input');
  if (messageInput) {
    messageInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    messageInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
      this.style.overflowY = this.scrollHeight > 100 ? 'auto' : 'hidden';
      
      // Handle typing indicator
      handleTyping();
    });
  }

  // Chat toggle events
  const chatToggle = document.getElementById('chat-toggle');
  const chatContainer = document.getElementById('chat-container');
  const closeChat = document.getElementById('close-chat');

  if (chatToggle && chatContainer && messageInput) {
    chatToggle.addEventListener('click', function() {
      chatContainer.classList.add('active');
      chatToggle.classList.remove('pulse');
      messageInput.focus();
      this.style.display = 'none';
    });
  }

  if (closeChat && chatContainer) {
    closeChat.addEventListener('click', function() {
      chatContainer.classList.remove('active');
      if (chatToggle) {
        chatToggle.style.display = 'flex';
      }
    });
  }
  
  // Add welcome message
  setTimeout(() => {
    appendMessage('bot', 'Hello! I\'m your AI assistant. How can I help you today?');
  }, 500);
});
