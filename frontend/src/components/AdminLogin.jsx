import React, { useState } from 'react';
import { loginUser } from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css'

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser({ ...formData, isAdmin: true });
      
      // Store admin token specifically
      localStorage.setItem('userToken', response.data.token); 
      
      alert('Admin login successful');
      navigate('/admin-dashboard'); // Redirect to admin dashboard
    } catch (error) {
      alert(error.response?.data?.message || 'Error logging in as admin');
    }
  };

  return (
   <div class="admin-login-container">
  <h2 class="admin-login-heading">Admin Login</h2>
  <form class="admin-login-form" onSubmit={handleSubmit}>
    <input
      type="email"
      name="email"
      placeholder="Email"
      onChange={handleChange}
      required
      class="admin-login-input"
    />
    <input
      type="password"
      name="password"
      placeholder="Password"
      onChange={handleChange}
      required
      class="admin-login-input"
    />
    <button type="submit" class="admin-login-button">Login</button>
  </form>
</div>

  );
};

export default AdminLogin;