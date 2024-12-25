import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from './ConfirmationModal';
import './UserManagement.css'

const UserManagement = ({ setError }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const [filters, setFilters] = useState({
    name: '',
    email: '',
    neighborhoodId: '',
    role: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });

  const [pagination, setPagination] = useState({
    totalUsers: 0,
    totalPages: 0,
    currentPage: 1
  });

  const navigate = useNavigate();

  // Fetch Neighborhoods for Dropdown
  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await fetch('http://localhost:8000/api/neighborhoods', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setNeighborhoods(data);
      } catch (err) {
        console.error('Error fetching neighborhoods', err);
        setError('Failed to fetch neighborhoods');
      }
    };
    fetchNeighborhoods();
  }, [setError]);

  // Fetch Users with Filters
  const fetchUsers = async () => {
    const token = localStorage.getItem('userToken');

    if (!token) {
      navigate('/login/admin');
      return;
    }

    try {
      // Convert filters to query string
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`http://localhost:8000/api/users?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination({
          totalUsers: data.totalUsers,
          totalPages: data.totalPages,
          currentPage: data.currentPage
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when filters change
  useEffect(() => {
    fetchUsers();
  }, [filters]);

  // Filter Change Handler
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Pagination Handler
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Delete User Handler
  const handleDeleteUser = async () => {
    if (!confirmDelete) return;
    
    const token = localStorage.getItem('userToken');
    setLoading(true);
    setDeleteError('');

    try {
      const response = await fetch(`http://localhost:8000/api/users/${confirmDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Refresh users after deletion
        fetchUsers();
        setConfirmDelete(null);
      } else {
        const errorData = await response.json();
        setDeleteError(errorData.message || 'Error deleting user');
      }
    } catch (err) {
      console.error(err);
      setDeleteError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initiate User Deletion
  const initiateUserDeletion = (userId) => {
    setConfirmDelete(userId);
    setDeleteError('');
  };

  // Cancel Deletion
  const cancelDeletion = () => {
    setConfirmDelete(null);
    setDeleteError('');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="user-management">
      <h2>Users Management</h2>
      
      {deleteError && <p style={{ color: 'red' }}>{deleteError}</p>}

      {/* Filter Controls */}
      <div className="filter-controls">
        <input
          type="text"
          name="name"
          placeholder="Filter by Name"
          value={filters.name}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="email"
          placeholder="Filter by Email"
          value={filters.email}
          onChange={handleFilterChange}
        />
        <select 
          name="neighborhoodId"
          value={filters.neighborhoodId}
          onChange={handleFilterChange}
        >
          <option value="">All Neighborhoods</option>
          {neighborhoods.map(neighborhood => (
            <option 
              key={neighborhood._id} 
              value={neighborhood._id}
            >
              {neighborhood.name}
            </option>
          ))}
        </select>
        <select
          name="role"
          value={filters.role}
          onChange={handleFilterChange}
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={handleFilterChange}
        >
          <option value="createdAt">Created Date</option>
          <option value="name">Name</option>
          <option value="email">Email</option>
        </select>
        <select
          name="sortOrder"
          value={filters.sortOrder}
          onChange={handleFilterChange}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {/* Users Table */}
      <table className="users-table">
        <thead>
          <tr>
            <th>Profile</th>
            <th>Name</th>
            <th>Email</th>
            <th>Neighborhood</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="6">No users found</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user._id}>
                <td>
                  <img 
                    src={user.profilePicUrl || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'} 
                    alt={user.name} 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.neighborhoodId?.name || 'No Neighborhood'}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    onClick={() => initiateUserDeletion(user._id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination-controls">
        <button 
          disabled={filters.page === 1}
          onClick={() => handlePageChange(filters.page - 1)}
        >
          Previous
        </button>
        <span>
          Page {filters.page} of {pagination.totalPages}
        </span>
        <button 
          disabled={filters.page === pagination.totalPages}
          onClick={() => handlePageChange(filters.page + 1)}
        >
          Next
        </button>
      </div>

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={!!confirmDelete}
        onClose={cancelDeletion}
        onConfirm={handleDeleteUser}
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
};

export default UserManagement;