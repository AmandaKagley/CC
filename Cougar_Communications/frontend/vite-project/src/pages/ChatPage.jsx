// ChatPage.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/images/logo.png';
import GroupChatItem from '../components/GroupChatItem';
import GroupChatMessage from '../components/GroupChatMessage';
import { getUserAuth } from './validation';

import './ChatPage.css';

function ChatPage() {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [groupChats, setGroupChats] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [latestMessage, setLatestMessage] = useState(null);
  const [socket, setSocket] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
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

      setLatestMessage(newMessage);

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
          const { newMessage } = response.data;
          setLatestMessage(newMessage);
          setGroupChats(prevChats => prevChats.map(chat =>
            chat.groupId === newMessage.GroupID
              ? { ...chat, lastMessage: newMessage.Message, lastMessageTime: newMessage.Timestamp }
              : chat
          ));
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
      setGroupChats(response.data);
    } catch (error) {
      console.error('Error fetching group chats:', error);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  const startChatWithFriend = async () => {
    if (selectedFriend && currentUserId) {
      try {
        // Create a new chat with the selected friend
        const response = await axios.post('http://localhost:3000/start-chat', {
          userId: currentUserId,
          friendId: selectedFriend.id
        });

        if (response.status === 201) {
          const newChat = response.data;
          setGroupChats(prevChats => [...prevChats, newChat]);
          setSelectedChat(newChat);
        }
      } catch (error) {
        console.error('Error starting chat:', error);
      }
    }
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
          <button className="start-chat-button" onClick={startChatWithFriend}>Start Chat</button>
          <div className="friends-list">
            {groupChats.map((chat) => (
              <GroupChatItem
                key={chat.groupId}
                groupName={chat.groupName}
                lastMessage={chat.lastMessage}
                lastMessageTime={formatTimestamp(chat.lastMessageTime)}
                senderProfilePicture={chat.senderProfilePicture}
                isSelected={selectedChat && selectedChat.groupId === chat.groupId}
                onClick={() => handleChatSelect(chat)}
              />
            ))}
          </div>
        </div>

        <div className="chat-area">
          {selectedChat && (
            <>
              <div className="chat-header">
                <img className="profile-image" src={selectedChat.senderProfilePicture || selectedChat.img} alt="" />
                <h4>{selectedChat.groupName || selectedChat.name}</h4>
              </div>
              <GroupChatMessage
                groupId={selectedChat.groupId}
                currentUserId={currentUserId}
                fetchMessages={true}
                latestMessage={latestMessage}
                formatTimestamp={formatTimestamp} // Pass the format function
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
