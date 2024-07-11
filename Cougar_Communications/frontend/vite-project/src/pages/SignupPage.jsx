import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../index.css';
import { validateSignup } from './validation'; // Ensure this points to your validation file
import logo from '../assets/images/logo.png';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateSignup(username, email, password, confirmPassword);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:3000/signup', { username, email, password });
      alert('Signup Successful');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setErrors({});
      navigate('/login'); // Redirect after successful signup
    } catch (error) {
      console.error('Signup Failed:', error.response ? error.response.data : error.message);
      alert('Signup Failed: ' + (error.response ? error.response.data.message : error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (setter, field) => (e) => {
    setter(e.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, [field]: '' }));
  };

  return (
    <div className="wrapper">
      <button className="logo-button" onClick={() => navigate('/')}>
        <img src={logo} alt="Logo" className="logo" />
      </button>
      <h1 className="header">Create Your Account</h1>
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
