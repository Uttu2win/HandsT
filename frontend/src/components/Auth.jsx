import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';  // Include any CSS if needed

const Auth = () => {
  const navigate = useNavigate();  // Hook for navigation

  const handleRegisterClick = () => {
    navigate('/register');  // Redirect to Register page
  };

  const handleLoginClick = () => {
    navigate('/login');  // Redirect to Login page
  };

  return (
    <div className="auth-container">
      <h2>Are you already a user?</h2>
      <p>Do you want to login or register?</p>

      <div className="auth-actions">
        <button onClick={handleLoginClick} className="auth-btn">Log In</button>
        <button onClick={handleRegisterClick} className="auth-btn">Register</button>
      </div>
    </div>
  );
};

export default Auth;
