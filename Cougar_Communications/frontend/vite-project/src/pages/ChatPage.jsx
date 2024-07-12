import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/images/logo.png';
import nadeshiko from '../assets/images/nadeshiko.png';
import bluedragon from '../assets/images/bluedragon.png';
import reddragon from '../assets/images/reddragon.png';
import trash from '../assets/images/trash.png';
import wow from '../assets/images/wow.png';
import dodrio from '../assets/images/dodrio.png';
import GroupChatItem from '../components/GroupChatItem';
import GroupChatMessage from '../components/GroupChatMessage';
import { validateLogin, setUserAuth, getUserAuth, isAuthenticated } from './validation';
import './ChatPage.css';

function ChatPage() {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [groupChats, setGroupChats] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = getUserAuth();
    setCurrentUserId(userId);
    if (!userId) {
      navigate('/login');
    } else {
      fetchGroupChats();
    }
  }, [navigate]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() !== '') {
      // Here you would typically send the message to the server
      // For now, we'll just clear the input
      setInputMessage('');
    }
  };

  const handleMinimizeChat = () => {
    setChatMinimized(!chatMinimized);
  };

  const fetchGroupChats = async () => {
    try {
      const userId = getUserAuth();
      const response = await axios.get(`http://localhost:3000/user-group-chats/${userId}`);
      setGroupChats(response.data);
    } catch (error) {
      console.error('Error fetching group chats:', error);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
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
            {groupChats.map((chat) => (
              <GroupChatItem 
                key={chat.groupId}
                groupName={chat.groupName}
                lastMessage={chat.lastMessage}
                lastMessageTime={new Date(chat.lastMessageTime).toLocaleTimeString()}
                senderProfilePicture={chat.senderProfilePicture}
                isSelected={selectedChat && selectedChat.groupId === chat.groupId}
                onClick={() => handleChatSelect(chat)}
              />
            ))}
            
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
                className={`friend-item ${selectedChat && selectedChat.name === friend.name ? 'selected' : ''}`}
                onClick={() => handleChatSelect(friend)}
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
          {selectedChat && (
            <>
              <div className="chat-header">
                <img className="profile-image" src={selectedChat.senderProfilePicture || selectedChat.img} alt="" />
                <h4>{selectedChat.groupName || selectedChat.name}</h4>
              </div>
              <GroupChatMessage groupId={selectedChat.groupId} currentUserId={currentUserId} />
              <form onSubmit={handleSendMessage} className="message-input">
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                />
                <button type="submit" className="send-button">Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
