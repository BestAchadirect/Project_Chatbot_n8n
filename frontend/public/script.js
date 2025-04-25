// User ID Setup
let userId = localStorage.getItem('userId');
if (!userId) {
  userId = `guest_${Math.random().toString(36).substring(2, 15)}`;
  localStorage.setItem('userId', userId);
}

// Don't prefix the UUID with 'session_' or 'guest_'
let sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
  sessionId = crypto.randomUUID();  // clean, proper UUID
  localStorage.setItem('sessionId', sessionId);
}

// Append a message to the chat
function appendMessage(sender, text) {
  const chatBox = document.getElementById('chat-box');
  const msg = document.createElement('div');
  msg.classList.add('chat-message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Send Message Handler
async function sendMessage() {
  const input = document.getElementById('user-input');
  const message = input.value.trim();
  if (!message) return;

  appendMessage('user', message); // Append the user's message to the UI
  input.value = '';

  // Retrieve userId and sessionId from localStorage
  const userId = localStorage.getItem('userId');
  const sessionId = localStorage.getItem('sessionId');

  if (!userId || !sessionId) {
    console.error('userId or sessionId is missing.');
    appendMessage('bot', 'An error occurred. Please refresh the page.');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/session', {
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
  } catch (error) {
    appendMessage('bot', 'Sorry, something went wrong.');
    console.error('Fetch error:', error);
  }
}

// Add Enter Key Event Listener
document.getElementById('user-input').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});