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

let nextEndpoint = 'http://localhost:5000/api/session'; // Default endpoint

async function sendMessage() {
  const input = document.getElementById('user-input');
  const message = input.value.trim();
  if (!message) return;

  appendMessage('user', message); // Append the user's message to the UI
  input.value = '';

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
    appendMessage('bot', data.response || 'No response received.');

    // Update sessionId and userId if provided in the response
    if (data.sessionId) {
      sessionId = data.sessionId;
      localStorage.setItem('sessionId', sessionId);
    }
    if (data.userId) {
      userId = data.userId;
      localStorage.setItem('userId', userId);
    }

    // Update nextEndpoint if provided in the response
    if (data.nextEndpoint) {
      nextEndpoint = `http://localhost:5678${data.nextEndpoint}`;
    }
  } catch (error) {
    appendMessage('bot', 'Sorry, something went wrong.');
    console.error('Fetch error:', error);
  }
}

fetch("http://localhost:5000/chat/latest")
  .then(res => res.json())
  .then(data => {
    console.log("Bot:", data.message);
  });


// -----------------------------
// 🎯 Event Listener
// -----------------------------

document.getElementById('user-input').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

