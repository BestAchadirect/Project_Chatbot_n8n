// let sessionId = localStorage.getItem('chatSessionId');

// // If not, generate a new one
// if (!sessionId) {
//   sessionId = crypto.randomUUID(); // Generates a UUID
//   localStorage.setItem('chatSessionId', sessionId);

  // // Optional: Send it to backend to log the session creation
  // fetch('http://localhost:5678/webhook-test/new-session', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     sessionId: sessionId,
  //     message: 'Session started',
  //     sender: 'user'
  //   })
  // }).catch(console.error);

const chatBox = document.getElementById('chat-box');

    function appendMessage(sender, text) {
        const msg = document.createElement('div');
        msg.classList.add('chat-message', sender);
        msg.textContent = text;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function sendMessage() {
        const input = document.getElementById('user-input');
        const message = input.value.trim();
        if (!message) return;
      
        appendMessage('user', message);
        input.value = '';
      
        try {
          const response = await fetch('http://localhost:5678/webhook-test/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatInput: message,
              // sessionId: sessionId,
              sender: 'user',
            })
            
          });
          
          const data = await response.text();
          appendMessage('bot', data);
        } catch (err) {
          appendMessage('bot', 'Sorry, something went wrong.');
          console.error(err);
        }
      }
      