import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileMenu.css';

const ProfileMenu = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  const getProfilePicUrl = (userId) => {
    return userId ? `http://localhost:8000/api/users/profile/picture/${userId}` : null;
  };

  return (
    <div className="profile-menu" ref={menuRef}>
      <div className="profile-trigger" onClick={() => setIsOpen(!isOpen)}>
        <img 
          src={getProfilePicUrl(user?.id) || '/images/default-profile.png'} 
          alt="Profile" 
          className="profile-pic"
          onError={(e) => {
            e.target.src = '/images/default-profile.png';
          }}
        />
      </div>
      
      {isOpen && (
        <div className="profile-dropdown">
          <div className="profile-header">
            <img 
              src={getProfilePicUrl(user?.id) || '/images/default-profile.png'} 
              alt="Profile" 
              className="profile-pic-large"
              onError={(e) => {
                e.target.src = '/images/default-profile.png';
              }}
            />
            <div className="profile-info">
              <h3>{user?.name}</h3>
              <p>{user?.email}</p>
            </div>
          </div>
          <div className="profile-actions">
            <button onClick={handleProfileClick}>Manage Profile</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;