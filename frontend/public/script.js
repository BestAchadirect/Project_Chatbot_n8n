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

  if (sender === 'bot') {
    let parsed = text;
    // Try to parse twice if needed (for stringified JSON)
    try {
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
    } catch (e) {
      parsed = null;
    }

    if (parsed && parsed.suggestions && Array.isArray(parsed.suggestions)) {
      msg.innerHTML = `
        <div class="faq-text">${parsed.text ? parsed.text : ''}</div>
        <div class="faq-suggestions">
          ${parsed.suggestions.map(s => {
            let postbackValue;
            if (typeof s.postback === 'object') {
              postbackValue = encodeURIComponent(JSON.stringify(s.postback));
            } else if (typeof s.postback === 'string') {
              postbackValue = s.postback.replace(/'/g, "\\'");
            } else {
              postbackValue = String(s.postback);
            }
            return `<span class="faq-suggestion" data-postback="${postbackValue}">${s.label}</span>`;
          }).join('')}
        </div>
      `;
    } else {
      msg.textContent = typeof text === 'string' ? text : JSON.stringify(text);
    }
  } else {
    msg.textContent = text;
  }

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


document.addEventListener('click', function (e) {
  if (e.target.classList.contains('faq-suggestion')) {
    const postbackValue = decodeURIComponent(e.target.getAttribute('data-postback'));
    askQuestion(postbackValue);
  }
});