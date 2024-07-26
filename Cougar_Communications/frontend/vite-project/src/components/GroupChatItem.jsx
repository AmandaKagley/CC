import React from 'react';
import PropTypes from 'prop-types';
import logo from '../assets/images/logo.png';
import blankGroupPicture from '../assets/images/BlankGroupPicture.png';

const GroupChatItem = React.memo(({ groupName, lastMessage, lastMessageTime, lastMessageSenderId, isSelected, onClick }) => {
  const isAIChat = groupName.startsWith('AI Assistant Chat for ');
  const isLastMessageFromAI = lastMessageSenderId === 0;
  const hasMessages = !!lastMessage;

  const getProfileImage = () => {
    if (isAIChat) return logo;
    if (!hasMessages) return blankGroupPicture;
    if (isLastMessageFromAI) return logo;
    return `http://localhost:3000/profile-picture/${lastMessageSenderId}`;
  };

  const truncateMessage = (message, maxLength = 30) => {
    if (!message) return "";
    if (message.length <= maxLength) return message;
    return message.substr(0, maxLength) + '...';
  };

  return (
    <div className={`friend-item ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <img 
        className="profile-image" 
        src={getProfileImage()}
        alt="Profile"
        onError={(e) => { 
          e.target.onerror = null; // Prevent infinite loop
          e.target.src = blankGroupPicture;
        }}
      />
      <div className="friend-info">
        <h6>{isAIChat ? 'AI Assistant' : groupName}</h6>
        <p>{hasMessages ? truncateMessage(lastMessage) : "No messages yet"}</p>
      </div>
      <span className="time">{hasMessages ? lastMessageTime : "New"}</span>
    </div>
  );
});

GroupChatItem.propTypes = {
  groupName: PropTypes.string.isRequired,
  lastMessage: PropTypes.string,
  lastMessageTime: PropTypes.string,
  lastMessageSenderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isSelected: PropTypes.bool,
  onClick: PropTypes.func.isRequired
};

export default GroupChatItem;