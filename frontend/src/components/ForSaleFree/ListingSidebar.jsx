import React from 'react';
import { ListFilter } from 'lucide-react';
import './ListingSidebar.css'

const ListingSidebar = ({ 
  viewMode, 
  setViewMode, 
  filters, 
  onFilterChange 
}) => {
  return (
    <div className="listing-sidebar">
      {/* View Mode Buttons */}
      <div className="view-mode-buttons">
        <button 
          className={`sidebar-btn ${viewMode === 'all' ? 'active' : ''}`}
          onClick={() => setViewMode('all')}
        >
          All Listings
        </button>
        <button 
          className={`sidebar-btn ${viewMode === 'user' ? 'active' : ''}`}
          onClick={() => setViewMode('user')}
        >
          Your Listings
        </button>
      </div>

      {/* Filters */}
      <div className="filter-section">
        <h3><ListFilter size={18} /> Filters</h3>
        
        <div className="filter-group">
          <label>Category</label>
          <select 
            value={filters.category} 
            onChange={(e) => onFilterChange('category', e.target.value)}
          >
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="free">Free</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By</label>
          <select 
            value={filters.sortBy} 
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
          >
            <option value="date">Date Added</option>
            <option value="price">Price</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort Order</label>
          <select 
            value={filters.sortOrder} 
            onChange={(e) => onFilterChange('sortOrder', e.target.value)}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ListingSidebar;