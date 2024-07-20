// ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/images/logo.png';
import GroupChatItem from '../components/GroupChatItem';
import GroupChatMessage from '../components/GroupChatMessage';
import { getUserAuth, removeUserAuth } from './validation';

import './ChatPage.css';

function ChatPage() {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [groupChats, setGroupChats] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [latestMessage, setLatestMessage] = useState(null);
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

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleTimeString([], options);
  };

  const handleNewMessage = (newMessage) => {
    setGroupChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.groupId === newMessage.GroupID) {
          return {
            ...chat,
            lastMessage: newMessage.Message,
            lastMessageTime: newMessage.Timestamp,
            lastMessageSenderId: newMessage.SenderID
          };
        }
        return chat;
      });
    });

    setLatestMessage(newMessage);
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
          const { newMessage } = response.data;
          setLatestMessage(newMessage);
          handleNewMessage(newMessage);
          setInputMessage('');
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const fetchGroupChats = async () => {
    try {
      const userId = getUserAuth();
      const response = await axios.get(`http://localhost:3000/user-group-chats/${userId}`);
      const chats = response.data;
      
      // Find the AI chat
      const aiChatIndex = chats.findIndex(chat => chat.groupName.startsWith('AI Assistant Chat for '));
      
      if (aiChatIndex !== -1) {
        // Remove the AI chat from its current position
        const aiChat = chats.splice(aiChatIndex, 1)[0];
        // Add it to the beginning of the array
        chats.unshift(aiChat);
      }
      
      setGroupChats(chats);
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
          <button className="logout-button" onClick={() => navigate('/profile')}>Profile</button>
          <button className="logout-button" onClick={() => navigate('/login')}>Logout</button>
        </div>
      </header>

      <div className="main-content">
        <div className="friends-bar">
          <div className="friends-list">
            {groupChats.map((chat) => (
              <GroupChatItem
                key={chat.groupId}
                groupName={chat.groupName}
                lastMessage={chat.lastMessage}
                lastMessageTime={formatTimestamp(chat.lastMessageTime)}
                lastMessageSenderId={chat.lastMessageSenderId}
                isSelected={selectedChat && selectedChat.groupId === chat.groupId}
                onClick={() => handleChatSelect(chat)}
              />
            ))}
          </div>
        </div>

        <div className="chat-area">
          {selectedChat ? (
            <>
              <div className="chat-header">
                <h4>{selectedChat.groupName}</h4>
              </div>
              <GroupChatMessage
                groupId={selectedChat.groupId}
                currentUserId={currentUserId}
                fetchMessages={true}
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
          ) : (
            <div className="no-chat-selected">
              <p>Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;