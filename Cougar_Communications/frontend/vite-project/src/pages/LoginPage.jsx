import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../index.css'; // Ensure this file contains the required styles
import { validateLogin } from './validation';
import logo from '../assets/images/logo.png';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // State for Remember Me
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = validateLogin(username, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/login', {
        username,
        password,
        rememberMe, // Send rememberMe state
      });

      if (response.status === 200) {
        alert('Login Successful');
        navigate('/ChatPage');
      } else {
        alert('Login Failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <header className="header">
        <button className="logo-button" onClick={() => navigate('/')}>
          <img src={logo} alt="Logo" className="logo" />
        </button>
        <h1>Welcome to Cougar Communications</h1>
      </header>
      <div className="login-container">
        <form onSubmit={handleLogin}>
          <div className="input-box">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            {errors.username && <p className="error">{errors.username}</p>}
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>
          <div className="remember-me-box">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Remember Me</label>
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Logging In...' : 'Login'}
          </button>
          <p className="signup-link">
            Not Registered? <a href="/signup">Sign up!</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
