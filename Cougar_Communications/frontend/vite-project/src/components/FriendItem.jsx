// FriendItem.jsx
import React from 'react';
import PropTypes from 'prop-types';

const FriendItem = React.memo(({ userId, username, email }) => {
  return (
    <div className="friend-item">
      <img 
        className="profile-image" 
        src={`http://localhost:3000/profile-picture/${userId}`}
        alt={`${username}'s profile`}
        onError={(e) => { 
          e.target.onerror = null; // Prevent infinite loop
          e.target.src = '../assets/images/blank-profile-picture.png';
        }}
      />
      <div className="friend-info">
        <h6>{username}</h6>
        <p>{email}</p>
      </div>
    </div>
  );
});

FriendItem.propTypes = {
  userId: PropTypes.number.isRequired,
  username: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired
};

export default FriendItem;