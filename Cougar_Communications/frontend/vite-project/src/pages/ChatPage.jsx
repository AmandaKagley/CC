import React, { useState, useEffect, useRef } from 'react';
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
  const [fetchMessages, setFetchMessages] = useState(false); // New state to control message fetching
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = getUserAuth();
    setCurrentUserId(userId);
    if (!userId) {
      navigate('/login');
    } else {
      fetchGroupChats();
      
      // Establish WebSocket connection with user ID
      const ws = new WebSocket(`ws://localhost:8080?userId=${userId}`);
      setSocket(ws);
      socketRef.current = ws;
  
      ws.onopen = () => {
        console.log('WebSocket connection established');
      };
  
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'newMessage') {
          handleNewMessage(data.message);
        }
      };
  
      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    }
  }, [navigate]);

  const [latestMessage, setLatestMessage] = useState(null);

  const handleNewMessage = (newMessage) => {
    // Only update if the message is not from the current user
    if (String(newMessage.SenderID) !== String(currentUserId)) {
      setGroupChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.groupId === newMessage.GroupID) {
            return {
              ...chat,
              lastMessage: newMessage.Message,
              lastMessageTime: newMessage.Timestamp
            };
          }
          return chat;
        });
      });
  
      // Set the latest message
      setLatestMessage(newMessage);
  
      // If the new message belongs to the currently selected chat, update it
      if (selectedChat && selectedChat.groupId === newMessage.GroupID) {
        setLatestMessage(newMessage);
      }
    }
  };
  


  

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() !== '' && selectedChat && currentUserId) {
      try {
        const response = await axios.post('http://localhost:3000/messages', {
          groupId: selectedChat.groupId,
          senderId: currentUserId,
          message: inputMessage.trim(),
          timestamp: new Date().toISOString()
        });
  
        if (response.status === 201) {
          console.log('Message sent successfully');
          // Use the newMessage object returned from the server
          const { newMessage } = response.data;
          setLatestMessage(newMessage);
          // Update the group chat list
          setGroupChats(prevChats => prevChats.map(chat => 
            chat.groupId === newMessage.GroupID 
              ? {...chat, lastMessage: newMessage.Message, lastMessageTime: newMessage.Timestamp}
              : chat
          ));
          setInputMessage('');
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
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
      <title>Chat</title>
      <header className="header">
        <div className="header-left">
          <Link to="/" className="logo">
            <img src={logo} alt="Logo" />
          </Link>
          <h1>Cougar Communications</h1>
        </div>
        <div className="header-right">
        <button className="profile-button" onClick={() => navigate('/profile')}>Profile</button>
        <button className="logout-button" onClick={() => navigate('/login')}>Logout</button>
        </div>
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
                <GroupChatMessage 
                  groupId={selectedChat.groupId} 
                  currentUserId={currentUserId} 
                  fetchMessages={fetchMessages}
                  latestMessage={latestMessage}
                />
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
