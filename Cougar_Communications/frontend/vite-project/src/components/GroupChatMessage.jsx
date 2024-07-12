// src/components/GroupChatMessage.jsx

import React, { useEffect, useState } from "react";
import axios from 'axios';
import './GroupChatMessage.css';

const GroupChatMessage = ({ groupId, currentUserId }) => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (groupId) {
            fetchMessages();
        }
    }, [groupId]);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/messages/${groupId}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    // Debug function to log message details
    const logMessageDetails = (message) => {
        console.log(`Message SenderID: ${message.SenderID}, CurrentUserID: ${currentUserId}`);
        console.log(`Is sender current user? ${message.SenderID === currentUserId}`);
    };

    return (
        <div className="chat-messages">
            {messages.map((message, index) => {
                logMessageDetails(message);
                const isCurrentUser = String(message.SenderID) === String(currentUserId);
                return (
                    <div 
                        key={index} 
                        className={`chat-message ${isCurrentUser ? 'right' : 'left'}`}
                    >
                        <img 
                            className="profile-image" 
                            src={message.SenderProfilePicture || 'path/to/default-avatar.png'} 
                            alt=""
                        />
                        <div className="message-content">
                            <div className="message-sender">{message.SenderUsername}</div>
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