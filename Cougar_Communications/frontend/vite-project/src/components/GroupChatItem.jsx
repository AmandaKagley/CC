import React from 'react';
import PropTypes from 'prop-types';

const GroupChatItem = React.memo(({ groupName, lastMessage, lastMessageTime, lastMessageSenderId, isSelected, onClick }) => {
  return (
    <div className={`friend-item ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <img 
        className="profile-image" 
        src={`http://localhost:3000/profile-picture/${lastMessageSenderId}`}
        alt="Profile"
        onError={(e) => { 
          e.target.onerror = null; // Prevent infinite loop
          e.target.src = '../assets/images/blank-profile-picture.png';
        }}
      />
      <div className="friend-info">
        <h6>{groupName}</h6>
        <p>{lastMessage}</p>
      </div>
      <span className="time">{lastMessageTime}</span>
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