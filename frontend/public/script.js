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
// 🗂️ Session Initialization
// -----------------------------

function initializeSession() {
  const sessionId = getOrCreateSessionId();
  return { sessionId };
}

// -----------------------------
// 💬 Chat Rendering
// -----------------------------

function appendMessage(sender, text) {
  const chatBox = document.getElementById('chat-box');
  const msg = document.createElement('div');
  msg.classList.add('chat-message', sender);

  // Only render plain text, no FAQ suggestions
  msg.textContent = typeof text === 'string' ? text : JSON.stringify(text);

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
  const chatBox = document.getElementById('chat-box');
  const typingIndicator = document.createElement('div');
  typingIndicator.id = 'typing-indicator';
  typingIndicator.classList.add('chat-message', 'bot', 'typing-indicator');
  typingIndicator.innerHTML = `
    <div class="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
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
    removeTypingIndicator();
    appendMessage('bot', 'Sorry, something went wrong.');
    console.error('Remove typing indicator error:', error);
  }
}

// -----------------------------
// 🚀 Chat API Logic
// -----------------------------

async function sendMessage() {
  const input = document.getElementById('message-input');
  const message = input.value.trim();
  if (!message) return;

  appendMessage('user', message);
  input.value = '';
  input.style.height = 'auto';

  // Retrieve sessionId from sessionStorage
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId || !isValidSessionId(sessionId)) {
    sessionId = generateSessionId();
    sessionStorage.setItem('sessionId', sessionId);
  }

  showTypingIndicator();

  try {
    // Send message to n8n workflow (replace with your actual n8n endpoint)
    const response = await fetch('http://localhost:5678/webhook-test/returning-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        message: message
      })
    });

    if (!response.ok) throw new Error('Network response was not ok');
    await response.json();

    removeTypingIndicator();

    // Display the bot's response in the chat
    if (data && data.response) {
      appendMessage('bot', data.response);
    } else {
      appendMessage('bot', 'No response received.');
    }

  } catch (error) {
    removeTypingIndicator();
    appendMessage('bot', 'Sorry, something went wrong.');
    console.error('n8n error:', error);
  }
}

// -----------------------------
// 🎯 Event Listener
// -----------------------------


const sendButton = document.getElementById('send-button');
if (sendButton) {
  sendButton.addEventListener('click', sendMessage);
}

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
  });
}

// Open/close chat logic (keep as in your new design)
const chatToggle = document.getElementById('chat-toggle');
const chatContainer = document.getElementById('chat-container');
const closeChat = document.getElementById('close-chat');

if (chatToggle && chatContainer && messageInput) {
  chatToggle.addEventListener('click', function() {
    chatContainer.classList.add('active');
    chatToggle.classList.remove('pulse');
    messageInput.focus();
    this.style.display = 'none'; // Hide the toggle button
  });
}

if (closeChat && chatContainer) {
  closeChat.addEventListener('click', function() {
    chatContainer.classList.remove('active');
    if (chatToggle) {
      chatToggle.style.display = 'flex'; // Show the toggle button
    }
  });
}

// Removed FAQ suggestion click handler
