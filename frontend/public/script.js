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
              sessionId: sessionId,
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
      