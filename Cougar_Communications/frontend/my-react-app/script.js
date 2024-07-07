const userMessageInput = document.getElementById('user-input');
const sendMessageButton = document.getElementById('send-message');
const chatHistory = document.getElementById('chat-history');

sendMessageButton.addEventListener('click', () => {
  const userMessage = userMessageInput.value;
  if (userMessage.trim() !== '') {
    displayMessage('user', userMessage);
    userMessageInput.value = '';

    fetch('/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: userMessage }),
    })
      .then(response => response.json())
      .then(data => {
        displayMessage('bot', data.response);
      })
      .catch(error => {
        console.error('Error fetching chatbot response:', error);
      });
  }
});

function displayMessage(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);
  messageElement.textContent = message;
  chatHistory.appendChild(messageElement);
}
const modeToggle = document.getElementById('mode-toggle-button');
const body = document.body;
const header = document.querySelector('header');

modeToggle.addEventListener('click', () => {
  // Toggle between "dark-mode" and removing the class
  body.classList.toggle('dark-mode');
  header.classList.toggle('dark-mode');

  // Update the button text
  if (body.classList.contains('dark-mode')) {
    modeToggle.textContent = 'Light';
  } else {
    modeToggle.textContent = 'Dark';
  }
});
