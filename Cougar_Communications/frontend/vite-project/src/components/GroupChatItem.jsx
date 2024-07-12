// GroupChatItem.jsx
import React from 'react';
import PropTypes from 'prop-types';

const GroupChatItem = ({ groupName, lastMessage, lastMessageTime, senderProfilePicture, isSelected, onClick }) => {
  return (
    <div className={`friend-item ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <img className="profile-image" src={senderProfilePicture} alt={`${groupName} sender`} />
      <div className="friend-info">
        <h6>{groupName}</h6>
        <p>{lastMessage}</p>
      </div>
      <span className="time">{lastMessageTime}</span>
    </div>
  );
};

GroupChatItem.propTypes = {
  groupName: PropTypes.string.isRequired,
  lastMessage: PropTypes.string.isRequired,
  lastMessageTime: PropTypes.string.isRequired,
  senderProfilePicture: PropTypes.string.isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
};

export default GroupChatItem;