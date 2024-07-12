import React, { useEffect, useState } from "react";
import axios from 'axios';
import './GroupChatMessage.css';

const GroupChatMessage = ({ groupId, currentUserId, fetchMessages, latestMessage }) => {
    const [messages, setMessages] = useState([]);

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

    return (
        <div className="chat-messages">
            {messages.map((message, index) => {
                const isCurrentUser = String(message.SenderID) === String(currentUserId);
                return (
                    <div 
                        key={message.MessageID || index} 
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