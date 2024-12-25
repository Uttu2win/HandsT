import React, { useState, useEffect } from 'react';
import { fetchNeighborhoods, createNeighborhood, deleteNeighborhood } from '../services/api';



const AdminNeighborhoodManagement = () => {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [newNeighborhood, setNewNeighborhood] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const loadNeighborhoods = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await fetch('http://localhost:8000/api/neighborhoods', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setNeighborhoods(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message);
        }
      } catch (err) {
        setError('Error fetching neighborhoods');
        console.error(err);
      }
    };

    loadNeighborhoods();
  }, []);

  const handleCreateNeighborhood = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:8000/api/neighborhoods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newNeighborhood),
      });

      if (response.ok) {
        const createdNeighborhood = await response.json();
        setNeighborhoods([...neighborhoods, createdNeighborhood]);
        // Reset form
        setNewNeighborhood({ name: '', description: '' });
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (err) {
      setError('Error creating neighborhood');
      console.error(err);
    }
  };

  const handleDeleteNeighborhood = async (neighborhoodId) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:8000/api/neighborhoods/${neighborhoodId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNeighborhoods(neighborhoods.filter(n => n._id !== neighborhoodId));
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (err) {
      setError('Error deleting neighborhood');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Neighborhood Management</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {/* Create Neighborhood Form */}
      
      <form onSubmit={handleCreateNeighborhood}>
        <input
          type="text"
          placeholder="Neighborhood Name"
          value={newNeighborhood.name}
          onChange={(e) => setNewNeighborhood({...newNeighborhood, name: e.target.value})}
          required
        />
        <textarea
          placeholder="Description (Optional)"
          value={newNeighborhood.description}
          onChange={(e) => setNewNeighborhood({...newNeighborhood, description: e.target.value})}
        />
        <button type="submit" >Create Neighborhood</button>
      </form>

      {/* Neighborhoods List */}
      <h3>Existing Neighborhoods</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Members Count</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {neighborhoods.map((neighborhood) => (
            <tr key={neighborhood._id}>
              <td>{neighborhood.name}</td>
              <td>{neighborhood.description || 'No description'}</td>
              <td>{neighborhood.members.length}</td>
              <td>
                <button onClick={() => handleDeleteNeighborhood(neighborhood._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminNeighborhoodManagement;