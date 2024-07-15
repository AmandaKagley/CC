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
  const [profilePicture, setProfilePicture] = useState(null);
  const [bio, setBio] = useState('');
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
        setBio(response.data.bio || '');
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await axios.post(`http://localhost:3000/user/upload-profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        setProfilePicture(response.data.profilePicture);
      }
    } catch (err) {
      console.error('Error uploading profile picture:', err);
    }
  };

  const handleBioChange = (event) => {
    setBio(event.target.value);
  };

  const handleBioSave = async () => {
    try {
      await axios.put(`http://localhost:3000/user/${currentUserId}/bio`, { bio });
    } catch (err) {
      console.error('Error saving bio:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="profile-page">
      <header className="header">
        <h1>User Profile</h1>
        <div>
          <button className="logout-button" onClick={() => navigate('/login')}>Logout</button>
          <button className="chat-page-button" onClick={() => navigate('/chat')}>Chat Page</button>
        </div>
      </header>
      <div className="profile-content">
        <div className="profile-picture-container">
          <img src={profilePicture || user.ProfilePicture || 'default-profile-pic.png'} alt="Profile" className="profile-picture" />
          <input type="file" onChange={handleProfilePictureUpload} />
        </div>
        <div className="profile-container">
          <h2>{user.Username}</h2>
          <p>Email: {user.Email}</p>
          <textarea
            value={bio}
            onChange={handleBioChange}
            placeholder="Write your bio here..."
            rows="4"
            cols="50"
            className="bio-textarea"
          ></textarea>
          <button onClick={handleBioSave} className="save-bio-button">Save Bio</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
