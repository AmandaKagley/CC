import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './ProfilePage.css';
import { getUserAuth } from './validation';
import defaultProfilePicture from '../assets/images/blank-profile-picture.png';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState(defaultProfilePicture);
  const navigate = useNavigate();
  const { userId: viewedUserId } = useParams(); // Get the userId from URL params

  useEffect(() => {
    const fetchUserProfile = async () => {
      const loggedInUserId = getUserAuth();
      setCurrentUserId(loggedInUserId);
      if (!loggedInUserId) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/user/${viewedUserId || loggedInUserId}`);
        setUser(response.data);
        setBio(response.data.Bio || '');
        loadProfilePicture(viewedUserId || loggedInUserId);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, viewedUserId]);

  const loadProfilePicture = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3000/profile-picture/${userId}`, {
        responseType: 'blob'
      });
      const imageUrl = URL.createObjectURL(response.data);
      setProfilePicture(imageUrl);
    } catch (err) {
      console.error('Error loading profile picture:', err);
      setProfilePicture(defaultProfilePicture);
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('profilePicture', file);
    formData.append('userId', currentUserId);

    try {
      const response = await axios.post('http://localhost:3000/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        await loadProfilePicture(currentUserId);
      }
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError('Failed to upload profile picture');
    }
  };

  const handleBioChange = (event) => {
    setBio(event.target.value);
  };

  const handleBioSave = async () => {
    try {
      await axios.put(`http://localhost:3000/user/${currentUserId}/bio`, { bio });
      alert('Bio updated successfully');
      // Update the user state to reflect the new bio
      setUser(prevUser => ({ ...prevUser, Bio: bio }));
    } catch (err) {
      console.error('Error saving bio:', err);
      setError('Failed to save bio');
    }
  };

  const isOwnProfile = !viewedUserId || viewedUserId === currentUserId;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="profile-page">
      <title>{isOwnProfile ? 'Edit Your Profile!' : `${user.Username}'s Profile`}</title>
      <header className="header">
        <h1>{isOwnProfile ? 'Your Profile' : `${user.Username}'s Profile`}</h1>
        <div>
          <button className="chat-page-button" onClick={() => navigate('/chat')}>Chat Page</button>
          {isOwnProfile && <button className="logout-button" onClick={() => navigate('/login')}>Logout</button>}
        </div>
      </header>
      <div className="profile-content">
        <div className="profile-picture-container">
          <img 
            src={profilePicture}
            alt="Profile" 
            className="profile-picture"
          />
          {isOwnProfile && <input type="file" onChange={handleProfilePictureUpload} accept="image/*" />}
        </div>
        <div className="profile-container">
          <h2>{user.Username}</h2>
          <p>Email: {user.Email}</p>
          {isOwnProfile ? (
            <>
              <textarea
                value={bio}
                onChange={handleBioChange}
                placeholder="Write your bio here..."
                rows="4"
                cols="50"
                className="bio-textarea"
              ></textarea>
              <button onClick={handleBioSave} className="save-bio-button">Save Bio</button>
            </>
          ) : (
            <p>{bio || 'No bio available.'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;