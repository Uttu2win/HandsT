import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfileManagement.css';
const DEFAULT_PROFILE_PIC = "https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png";

const ProfileManagement = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setFormData(prev => ({
        ...prev,
        name: response.data.name,
        email: response.data.email
      }));
      setPreviewUrl(response.data.profilePicUrl);
    } catch (error) {
      setMessage('Error fetching profile');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      if (formData.currentPassword) {
        formDataToSend.append('currentPassword', formData.currentPassword);
        formDataToSend.append('newPassword', formData.newPassword);
      }
      if (selectedFile) {
        formDataToSend.append('profilePic', selectedFile);
      }

      const response = await axios.put(
        'http://localhost:8000/api/users/profile',
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setMessage('Profile updated successfully');
      
      if (response.data.profilePicUrl) {
        setPreviewUrl(response.data.profilePicUrl);
      }
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating profile');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-management">
      <h2>Profile Management</h2>
      {message && <div className="message">{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="profile-pic-section">
          {/* <img 
            src={previewUrl || '/default-profile.png'} 
            alt="Profile" 
            className="profile-pic-preview"
          /> */}
           <img
    src={previewUrl || DEFAULT_PROFILE_PIC}
    alt="Profile"
    className="profile-pic-preview"
  onError={(e) => {
    e.target.src = DEFAULT_PROFILE_PIC;
  }}
/>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="profile-pic-input"
          />
          <label htmlFor="profile-pic-input">Change Profile Picture</label> 
        </div>

        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="password-section">
          <h3>Change Password</h3>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="button-group">
        <button type="submit" className="save-button">
          Save Changes
        </button>
        <button 
          type="button" 
          className="return-button"
          onClick={() => navigate('/dashboard')}
        >
          Return to Dashboard
        </button>
      </div>
      </form>
    </div>
  );
};

export default ProfileManagement;