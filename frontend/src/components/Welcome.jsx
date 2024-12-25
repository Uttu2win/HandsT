import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css'; // Import the global CSS file

const Welcome = () => {
  const navigate = useNavigate();

  // Redirect after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/about');
    }, 6000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="welcome-page">
      <img src="projectlogo.jpg" alt="HandsTogether Logo" className="welcome-logo" />
      <h1 className="welcome-heading">Welcome to HandsTogether</h1>
      <h2 className="welcome-tagline">Building stronger communities, one connection at a time.</h2>
    </div>
  );
};

export default Welcome;
