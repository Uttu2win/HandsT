import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import ListingCard from './ListingCard.jsx';
import ListingSidebar from './ListingSidebar.jsx';
import CreateListingModal from './CreateListingModal.jsx';
import { fetchListings, createListing } from '../../services/api.js';
import "./ForSaleFree.css";
const ForSaleFree = () => {
  const [listings, setListings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('all');
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadListings();
  }, [viewMode, filters]);

  const loadListings = async () => {
    try {
      const response = await fetchListings({
        ...filters,
        onlyUserListings: viewMode === 'user'
      });
      setListings(response.data);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  };

  const handleCreateListing = async (listingData) => {
    try {
      await createListing(listingData);
      setIsModalOpen(false);
      loadListings();
    } catch (error) {
      console.error('Error creating listing:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="forsalefree-container">
      {/* Header */}
      <div className="forsalefree-header">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search For Sale & Free"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <button 
          className="create-listing-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={20} />
          Create a listing
        </button>
      </div>

      <div className="forsalefree-content">
        {/* Sidebar */}
        <ListingSidebar
          viewMode={viewMode}
          setViewMode={setViewMode}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Main Content */}
        <div className="listings-grid">
          {filteredListings.length === 0 ? (
            <div className="no-listings">
              <p>No listings found</p>
            </div>
          ) : (
            filteredListings.map(listing => (
              <ListingCard key={listing._id} listing={listing} />
            ))
          )}
        </div>
      </div>

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateListing}
      />
    </div>
  );
};

export default ForSaleFree;