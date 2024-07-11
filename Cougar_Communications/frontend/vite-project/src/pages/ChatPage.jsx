import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import nadeshiko from '../assets/images/nadeshiko.png';
import bluedragon from '../assets/images/bluedragon.png';
import reddragon from '../assets/images/reddragon.png';
import trash from '../assets/images/trash.png';
import wow from '../assets/images/wow.png';
import dodrio from '../assets/images/dodrio.png';
import './ChatPage.css'; // Ensure this file contains the required styles

function ChatPage() {
  const [messages, setMessages] = useState([
    { text: "Hello dude!", sender: "left", time: "10:00" },
    { text: "Hello dude!", sender: "right", time: "10:01" },
    { text: "Hello dude!", sender: "right", time: "10:02" },
    { text: "Hello dude!", sender: "left", time: "10:03" },
    { text: "Hello dude!", sender: "left", time: "10:04" },
    { text: "Hello dude!", sender: "left", time: "10:05" },
    { text: "Hello dude!", sender: "right", time: "10:06" },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFriend, setSelectedFriend] = useState({ img: nadeshiko, name: "Nadeshiko" });
  const [chatMinimized, setChatMinimized] = useState(false);
  const navigate = useNavigate();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() !== '') {
      setMessages([...messages, { text: inputMessage, sender: "right", time: new Date().toLocaleTimeString() }]);
      setInputMessage('');
    }
  };

  const handleMinimizeChat = () => {
    setChatMinimized(!chatMinimized);
  };

  return (
    <div className="chat-page">
      <header className="header">
        <div className="header-left">
          <Link to="/" className="logo">
            <img src={logo} alt="Logo" />
          </Link>
          <h1>Cougar Communications</h1>
        </div>
        <button className="logout-button" onClick={() => navigate('/login')}>Logout</button>
      </header>

      <div className="main-content">
        <div className="friends-bar">
          <div className="search-box">
            <input type="text" placeholder="Search for friends..." />
          </div>
          <div className="friends-list">
            {[
              { img: nadeshiko, name: "Nadeshiko", message: "You have to see this view!", time: "13:21" },
              { img: bluedragon, name: "Blue Eyes", message: "Red is bad, don't listen to him.", time: "12:42" },
              { img: reddragon, name: "Red Eyes", message: "Blue is outdated, don't even try.", time: "12:39" },
              { img: trash, name: "Ex-Girlfriend", message: "I bet you miss me.", time: "09:02" },
              { img: wow, name: "Jenkins", message: "Hop on World of Warcraft.", time: "04:34" },
              { img: dodrio, name: "Dodrio", message: "Early bird gets the worm!", time: "01:00" },
            ].map((friend, index) => (
              <div
                key={index}
                className={`friend-item ${selectedFriend.name === friend.name ? 'selected' : ''}`}
                onClick={() => setSelectedFriend(friend)}
              >
                <img className="profile-image" src={friend.img} alt="" />
                <div className="friend-info">
                  <h6>{friend.name}</h6>
                  <p>{friend.message}</p>
                </div>
                <span className="time">{friend.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-area" style={{ display: chatMinimized ? 'none' : 'flex' }}>
          <button className="minimize-chat-button" onClick={handleMinimizeChat}>
            {chatMinimized ? 'Expand Chat' : 'Minimize Chat'}
          </button>
          <div className="chat-header">
            <img className="profile-image" src={selectedFriend.img} alt="" />
            <h4>{selectedFriend.name}</h4>
          </div>
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`chat-message ${message.sender}`}>
                <img className="profile-image" src={message.sender === 'right' ? 'path/to/your-profile-img' : selectedFriend.img} alt="" />
                <div>
                  {message.text}
                  <div className="time">{message.time}</div>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="message-input">
            <input
              type="text"
              placeholder="Type your message here..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button type="submit" className="send-button">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;

