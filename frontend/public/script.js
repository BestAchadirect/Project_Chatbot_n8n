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

  if (sender === 'bot' && /<\/?[a-z][\s\S]*>/i.test(text)) {
    // If the bot's message contains HTML, render it as HTML
    msg.innerHTML = text;
  } else {
    // Otherwise, render as plain text (safe for user messages)
    msg.textContent = text;
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
  const chatBox = document.getElementById('chat-box');
  if (document.getElementById('typing-indicator')) return; // Prevent duplicates

  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-message bot flex typing-indicator-container';
  typingDiv.id = 'typing-indicator';

  typingDiv.innerHTML = `
    <div class="message-bubble typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div> `;

  chatBox.appendChild(typingDiv);
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

  showTypingIndicator(); // Show typing indicator

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
    removeTypingIndicator();
    if (data.response || data.html) {
      appendMessage('bot', data.response || data.html);
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
    removeTypingIndicator();
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

// Open/close chat logic (keep as in your new design)
document.getElementById('chat-toggle').addEventListener('click', () => {
  document.getElementById('chat-container').classList.add('active');
  document.getElementById('chat-toggle').classList.remove('pulse');
  document.getElementById('message-input').focus();
});
document.getElementById('close-chat').addEventListener('click', () => {
  document.getElementById('chat-container').classList.remove('active');
});

document.getElementById('close-chat').addEventListener('click', 
function() {
  document.getElementById('chat-container').classList.remove('active');
  document.getElementById('chat-toggle').style.display = 'flex'; // Show the toggle button
});

// When chat-toggle is clicked, show chat and hide toggle
document.getElementById('chat-toggle').addEventListener('click', function() {
  document.getElementById('chat-container').classList.add('active');
  this.style.display = 'none'; // Hide the toggle button
});

