import React, { useState, useEffect } from 'react';
import { fetchNeighborhoods, registerUser } from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    neighborhoodId: '',
  });
  const [neighborhoods, setNeighborhoods] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getNeighborhoods = async () => {
      try {
        const response = await fetchNeighborhoods(); // Fetch data
        setNeighborhoods(response.data); // Update state
      } catch (error) {
        console.error('Error fetching neighborhoods:', error.response?.data?.message || error.message);
      }
    };

    getNeighborhoods();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      alert('Registration successful');
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <div className="form-image">
        <img src="loginregisterimage.jpeg" alt="Decorative Image" />
      </div>
      <div className="register-form-wrapper">
        <form className="register-form" onSubmit={handleSubmit}>
          <h2>Register</h2>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <select
            name="neighborhoodId"
            value={formData.neighborhoodId}
            onChange={handleChange}
            required
          >
            <option value="">Select Neighborhood</option>
            {neighborhoods.map((neighborhood) => (
              <option key={neighborhood._id} value={neighborhood._id}>
                {neighborhood.name}
              </option>
            ))}
          </select>
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;