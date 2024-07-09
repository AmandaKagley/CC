import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';

function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Implement your login logic here
    // For now, let's just redirect to the chat page
    navigate('/chat');
  };

  return (
    <div>
      <header>
        <div className="header">
          <Link to="/" className="logo">
            <img src={logo} alt="Saint Charles Community College Logo" />
          </Link>
          <div className="header-right">
            <h1>Welcome to Cougar Communications</h1>
          </div>
        </div>
      </header>

      <div className="wrapper">
        <form onSubmit={handleSubmit}> 
          <h1>Login</h1>
          <div className="input-box">
            <input
              type="text"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <i className="bx bxs-user"></i>
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <i className="bx bxs-lock-alt"></i>
          </div>

          <div className="remember-forgot">
            <label>
              <input type="checkbox" /> Remember Me
            </label>
            <Link to="/forgot-password">Forgot Password?</Link> 
          </div>

          <button type="submit" className="btn">Login</button>

          <div className="register-link">
            <p>Don't have an account? <Link to="/signup">Register</Link></p>
          </div>
        </form>
      </div>

      <footer>
        <div className="footer">
          <Link to="/contact">Contact</Link>
          <Link to="/about">About</Link>
        </div>
      </footer>
    </div>
  );
}

export default LoginPage;