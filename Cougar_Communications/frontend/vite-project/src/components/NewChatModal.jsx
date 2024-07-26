import React, { useState } from 'react';
import { getUserAuth } from '../pages/validation';
import axios from 'axios';
import './NewChatModal.css';

function NewChatModal({ onClose, onChatCreated }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const getUserAuth = () => {
    const userId = sessionStorage.getItem('userId');
    console.log('Retrieved userId from localStorage:', userId);
    return userId;
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/search?query=${searchTerm}`);
      console.log('Search results:', response.data); // Debugging log
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUsers(prevSelectedUsers => {
      // Ensure the user is not already selected
      if (!prevSelectedUsers.find(u => u.UserID === user.UserID)) {
        return [...prevSelectedUsers, user];
      }
      return prevSelectedUsers;
    });
  };
  
  const handleStartChat = async () => {
    const currentUserId = getUserAuth();
    console.log('Current user ID:', currentUserId);
    
    if (!currentUserId) {
      console.error('User not authenticated');
      alert('Authentication error: Unable to retrieve user ID. Please try logging out and logging in again.');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:3000/start-chat', {
        userIds: [currentUserId, ...selectedUsers.map(u => u.UserID)]
      });
      console.log('Start chat response:', response.data);
      onChatCreated(response.data);
      onClose();
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  return (
    <div className="new-chat-modal">
      <h2>Start New Chat</h2>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by email or username"
      />
      <button onClick={handleSearch}>Search</button>
      <div className="search-results">
        {searchResults.map(user => (
          <div
            key={user.UserID} // Ensure key is unique
            onClick={() => handleUserSelect(user)}
            className="search-result-item"
          >
            {user.Username} ({user.Email})
          </div>
        ))}
      </div>
      <div className="selected-users">
        {selectedUsers.map(user => (
          <div
            key={user.UserID} // Ensure key is unique
            className="selected-user-item"
          >
            {user.Username}
          </div>
        ))}
      </div>
      <button onClick={handleStartChat}>Start Chat</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}

export default NewChatModal;
