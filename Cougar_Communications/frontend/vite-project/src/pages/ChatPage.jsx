import React, { useState } from 'react';
import axios from 'axios';

function ChatPage() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (message.trim() === '') {
      return; // Prevent sending empty messages
    }

    // Prepare the message object
    const newMessage = {
      text: message,
    };

    try {
      // Send message to backend (replace '/api/chatbot' with your backend endpoint)
      const response = await axios.post('/api/chatbot', newMessage);

      // Update chat history with the response from backend
      const botResponse = response.data.response;
      setChatHistory([...chatHistory, { text: message, sender: 'user' }]);
      setChatHistory([...chatHistory, { text: botResponse, sender: 'bot' }]);

      // Clear input field after sending message
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error state or show error message to the user
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-history">
        {chatHistory.map((entry, index) => (
          <div key={index} className={`chat-message ${entry.sender}`}>
            <p>{entry.text}</p>
          </div>
        ))}
      </div>
      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={handleChange}
          placeholder="Type your message..."
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatPage;
