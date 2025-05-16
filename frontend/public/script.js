// -----------------------------
// 🔧 Utility Functions
// -----------------------------

function generateUserId() {
  return `guest_${Math.random().toString(36).substring(2, 15)}`;
}

function generateSessionId() {
  return crypto.randomUUID();
}

function isValidUUID(uuid) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

function getOrCreateLocalStorageItem(key, generatorFn) {
  let value = localStorage.getItem(key);
  if (!value || (key === 'sessionId' && !isValidUUID(value))) {
    value = generatorFn();
    localStorage.setItem(key, value);
  }
  return value;
}

// -----------------------------
// 🗂️ Session Initialization
// -----------------------------

function initializeSession() {
  const userId = getOrCreateLocalStorageItem('userId', generateUserId);
  const sessionId = getOrCreateLocalStorageItem('sessionId', generateSessionId);
  return { userId, sessionId };
}

// -----------------------------
// 💬 Chat Rendering
// -----------------------------

function appendMessage(sender, text) {
  const chatBox = document.getElementById('chat-box');
  const msg = document.createElement('div');
  msg.classList.add('chat-message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// -----------------------------
// 🚀 Chat API Logic
// -----------------------------

let nextEndpoint = 'http://localhost:5001/api/session'; // Default endpoint

async function sendMessage() {
  const input = document.getElementById('message-input');
  const message = input.value.trim();
  if (!message) return;

  appendMessage('user', message); // Append the user's message to the UI
  input.value = '';
  input.style.height = 'auto';

  // Retrieve userId and sessionId from localStorage
  let userId = localStorage.getItem('userId');
  let sessionId = localStorage.getItem('sessionId');

  try {
    const response = await fetch(nextEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatInput: message,
        userId: userId,
        sessionId: sessionId,
      })
    });

    const data = await response.json();
    if (data.response) {
      appendMessage('bot', data.response);
    } else {
      appendMessage('bot', 'No response received.');
    }

    if (data.sessionId) {
      sessionId = data.sessionId;
      localStorage.setItem('sessionId', sessionId);
    }
    if (data.userId) {
      userId = data.userId;
      localStorage.setItem('userId', userId);
    }

    if (data.nextEndpoint) {
      if (data.nextEndpoint.startsWith('/api/')) {
        nextEndpoint = `http://localhost:5001${data.nextEndpoint}`;
      } else {
        nextEndpoint = `http://localhost:5678${data.nextEndpoint}`;
      }
    }
  } catch (error) {
    appendMessage('bot', 'Sorry, something went wrong.');
    console.error('Fetch error:', error);
  }
}

// Return latest message 
fetch("http://localhost:5001/chat/latest")
  .then(res => res.json())
  .then(data => {
    console.log("Bot:", data.message);
  });

// -----------------------------
// 🎯 Event Listener
// -----------------------------

document.getElementById('send-button').addEventListener('click', sendMessage);

document.getElementById('message-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

document.getElementById('message-input').addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
  this.style.overflowY = this.scrollHeight > 100 ? 'auto' : 'hidden';
});

// Optional: Open/close chat logic (keep as in your new design)
document.getElementById('chat-toggle').addEventListener('click', () => {
  document.getElementById('chat-container').classList.add('active');
  document.getElementById('chat-toggle').classList.remove('pulse');
  document.getElementById('message-input').focus();
});
document.getElementById('close-chat').addEventListener('click', () => {
  document.getElementById('chat-container').classList.remove('active');
});

