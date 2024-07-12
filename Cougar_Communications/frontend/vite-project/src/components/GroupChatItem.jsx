// GroupChatItem.jsx
import React from 'react';

const GroupChatItem = ({ groupName, lastMessage, lastMessageTime, senderProfilePicture, isSelected, onClick }) => {
  return (
    <div className={`friend-item ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <img className="profile-image" src={senderProfilePicture} alt={groupName} />
      <div className="friend-info">
        <h6>{groupName}</h6>
        <p>{lastMessage}</p>
      </div>
      <span className="time">{lastMessageTime}</span>
    </div>
  );
};

export default GroupChatItem;