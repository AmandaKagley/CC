import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../index.css';
import { validateSignup } from './validation';
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
    setLoading(true);

    // Collect all errors
    let allErrors = {...validateSignup(username, email, password, confirmPassword)};

    try {
      const response = await axios.post('http://localhost:3000/signup', {
        username,
        email,
        password
      });

      if (response.status === 201) {
        alert('Signup Successful');
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
      const newErrors = {...prevErrors};
      delete newErrors[field];
      return newErrors;
    });
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