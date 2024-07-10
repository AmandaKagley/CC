import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';

function SignUpPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate email format
    if (!isEmailValid(formData.email)) {
      alert('Please enter a valid email ending with @my.stchas.edu');
      return;
    }

    try {
      // Store the user's data to the database
      const response = await fetch('/api/signup', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error storing user data');
      }

      console.log('User data stored successfully');
      // Redirect to the login page
      navigate('/');
    } catch (error) {
      console.error('Error storing user data:', error);
      // Handle error state or show error message to the user
    }
  };

  const isEmailValid = (email) => {
    return email.endsWith('@my.stchas.edu');
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit}>
        <img src={logo} alt="Logo" />
        <h2>Create an Account</h2>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
        <p>Already have an account? <Link to="/">Log In</Link></p>
      </form>
    </div>
  );
}

export default SignUpPage;
