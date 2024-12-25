 import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import NeighborhoodManagement from './NeighborhoodManagement';
import ConfirmationModal from './ConfirmationModal';
import './AdminDashboard.css'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/login/admin');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
   
    setError('');
  };

  return (
    <div className="admin-dashboard">
      <header>
        <h1>Admin Dashboard</h1>
        <div className="dashboard-actions">
          <button 
            onClick={() => handleTabChange('users')}
            className={activeTab === 'users' ? 'active' : ''}
          >
            Users
          </button>
          <button 
            onClick={() => handleTabChange('neighborhoods')}
            className={activeTab === 'neighborhoods' ? 'active' : ''}
          >
            Neighborhoods
          </button>
          <button 
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      )}

      <main>
        {activeTab === 'users' && (
          <UserManagement 
            setError={setError}
          />
        )}

        {activeTab === 'neighborhoods' && (
          <NeighborhoodManagement 
            setError={setError}
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;