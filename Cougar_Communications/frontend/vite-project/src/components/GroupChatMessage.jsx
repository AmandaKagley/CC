import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GroupChatMessage.css';
import logo from '../assets/images/logo.png';

const GroupChatMessage = ({ groupId, currentUserId, fetchMessages, latestMessage }) => {
    const [messages, setMessages] = useState([]);
    const navigate = useNavigate();
    
    useEffect(() => {
        if (groupId) {
            fetchMessagesFromServer();
        }
    }, [groupId, fetchMessages]);

    useEffect(() => {
        if (latestMessage && latestMessage.GroupID === groupId) {
            // Check if the message already exists to avoid duplicates
            if (!messages.some(msg => msg.MessageID === latestMessage.MessageID)) {
                setMessages(prevMessages => [...prevMessages, latestMessage]);
            }
        }
    }, [latestMessage, groupId, messages]);

    const fetchMessagesFromServer = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/messages/${groupId}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleMessageClick = (senderId) => {
        if (senderId !== 0) { // Don't navigate for AI messages
            navigate(`/profile/${senderId}`);
        }
    };

    return (
        <div className="chat-messages">
            {messages.map((message, index) => {
                const isCurrentUser = String(message.SenderID) === String(currentUserId);
                const isAI = message.SenderID === 0;
                return (
                    <div 
                        key={message.MessageID || index} 
                        className={`chat-message ${isCurrentUser ? 'right' : 'left'} ${isAI ? 'ai-message' : ''}`}
                        onClick={() => handleMessageClick(message.SenderID)} 
                        style={{ cursor: isAI ? 'default' : 'pointer' }} 
                    >
                        <img 
                        className="profile-image" 
                        src={isAI ? logo : `http://localhost:3000/profile-picture/${message.SenderID}`}
                        alt="Profile"
                        onError={(e) => { e.target.src = '../assets/images/blank-profile-picture.png' }}
                        />
                        <div className="message-content">
                            <div className="message-sender">{isAI ? 'AI Assistant' : message.SenderUsername}</div>
                            <div className="message-text">{message.Message}</div>
                            <div className="time">{new Date(message.Timestamp).toLocaleTimeString()}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default GroupChatMessage;