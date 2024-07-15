import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfilePage.css';
import { getUserAuth } from './validation';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = getUserAuth();
      setCurrentUserId(userId);
      if (!userId) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/user/${userId}`);
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="profile-page">
      <header className="header">
        <h1>User Profile</h1>
        <div className="header-right">
        <button className="chat-button" onClick={() => navigate('/chat')}>Chat</button>
        <button className="logout-button" onClick={() => navigate('/login')}>Logout</button>
        </div>
      </header>
      <div className="profile-content">
        <img src={user.ProfilePicture || 'default-profile-pic.png'} alt="Profile" className="profile-picture" />
        <h2>{user.Username}</h2>
        <p>Email: {user.Email}</p>
        <p>User ID: {currentUserId}</p>
        {/* Add more user details as needed */}
      </div>
    </div>
  );
};

export default ProfilePage;