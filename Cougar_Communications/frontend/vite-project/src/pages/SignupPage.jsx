import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';

function SignUpPage() {
    const [formData, setFormData] = useState({
        username: '',
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

    const handleSubmit = (event) => {
        event.preventDefault();
        // Add your signup logic here (e.g., form validation, API call)
        console.log('Form submitted:', formData);
        // For now, let's just redirect to the login page
        navigate('/');
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
                    <h1>Sign Up</h1>
                    <div className="input-box">
                        <input 
                            type="text" 
                            placeholder="Username" 
                            name="username" 
                            value={formData.username} 
                            onChange={handleChange} 
                            required 
                        />
                        <i className='bx bxs-user'></i>
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
                        <i className='bx bxs-lock-alt'></i>
                    </div>
                    <div className="input-box">
                        <input 
                            type="password" 
                            placeholder="Confirm Password" 
                            name="confirmPassword"
                            value={formData.confirmPassword} 
                            onChange={handleChange} 
                            required 
                        />
                        <i className='bx bxs-lock-alt'></i>
                    </div>

                    <button type="submit" className="btn">Sign Up</button>

                    <div className="register-link">
                        <p>Already have an account? <Link to="/">Login</Link></p>
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

export default SignUpPage;