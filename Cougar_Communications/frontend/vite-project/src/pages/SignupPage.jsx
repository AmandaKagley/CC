import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../index.css';
import { validateSignup } from './validation';
import logo from '../assets/images/logo.png';
import defaultProfilePicture from '../assets/images/blank-profile-picture.png'; //Defult Profile Picture, called during user Signup

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(defaultProfilePicture);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Collect all errors
    let allErrors = { ...validateSignup(username, email, password, confirmPassword) };

    try {
      const signupResponse = await axios.post('http://localhost:3000/signup', {
        username,
        email,
        password
      });

      if (signupResponse.status === 201) {
        const userId = signupResponse.data.userId;

        // Now upload the default profile picture
        const formData = new FormData();
        formData.append('userId', userId);

        // Convert the default profile picture to a Blob
        const response = await fetch(defaultProfilePicture);
        const blob = await response.blob();
        formData.append('profilePicture', blob, 'default-profile-picture.png');

        try {
          await axios.post('http://localhost:3000/upload-profile-picture', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          console.log('Default profile picture uploaded successfully');
        } catch (uploadError) {
          console.error('Error uploading default profile picture:', uploadError);
        }

        alert('Signup Successful! You can now login.');
        navigate('/login');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const { message, field } = error.response.data;
        allErrors[field] = message;
      } else {
        console.error('Signup error:', error);
        allErrors.general = 'Signup Failed';
      }
    } finally {
      setLoading(false);
      setErrors(allErrors);
    }

    // If there are any errors, don't proceed
    if (Object.keys(allErrors).length > 0) {
      return;
    }
  };
  const handleChange = (setter, field) => (e) => {
    setter(e.target.value);
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[field];
      return newErrors;
    });
  };

  return (
    <div className="wrapper">
      <title>Signup To CC</title>
      <button className="logo-button" onClick={() => navigate('/')}>
        <img src={logo} alt="Logo" className="logo" />
      </button>
      <h1 className=".headerlogin">Create Your Account</h1>
      <div className="signup-container">
        <form onSubmit={handleSignup}>
          <div className="input-box">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={handleChange(setUsername, 'username')}
              required
            />
            {errors.username && <p className="error">{errors.username}</p>}
          </div>
          <div className="input-box">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleChange(setEmail, 'email')}
              required
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handleChange(setPassword, 'password')}
              required
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={handleChange(setConfirmPassword, 'confirmPassword')}
              required
            />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
          <p className="sign-in-link">
            Already a member? <Link to="/login">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
