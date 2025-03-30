import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, InfoWindow } from '@react-google-maps/api';
import axios from 'axios';
import './Map.css';

// Define libraries outside the component to prevent unnecessary reloads
const libraries = ['places', 'marker'];

const Map = () => {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
  const [error, setError] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Bangalore's center coordinates
  const center = {
    lat: 12.9716,
    lng: 77.5946
  };

  const mapContainerStyle = {
    width: '100%',
    height: '600px'
  };

  const placeTypes = {
    restaurants: 'restaurant',
    hotels: 'lodging',
    attractions: 'tourist_attraction',
    shopping: 'shopping_mall',
    parks: 'park',
    hospitals: 'hospital'
  };

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view neighborhoods');
          setIsLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:8000/api/neighborhoods', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setNeighborhoods(response.data);
      } catch (err) {
        console.error('Error fetching neighborhoods:', err);
        setError('Failed to fetch neighborhoods. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNeighborhoods();
  }, []);

  // Clean up markers when component unmounts or markers change
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => marker.map = null);
    };
  }, [neighborhoods, places, searchResults]);

  const createMarkerContent = (title, color) => {
    const div = document.createElement('div');
    div.className = 'advanced-marker';
    div.innerHTML = `
      <div class="marker-content">
        <div class="marker-dot" style="background-color: ${color}"></div>
        <div class="marker-label">${title}</div>
      </div>
    `;
    return div;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    const service = new google.maps.places.PlacesService(mapRef.current);
    const request = {
      location: center,
      radius: '50000',
      query: searchInput
    };

    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        setSearchResults(results);
        setPlaces([]); // Clear previous places
        setActiveFilter(null); // Clear active filter
      } else {
        setError('Failed to search for places. Please try again.');
      }
    });
  };

  const searchNearbyPlaces = (type) => {
    if (!selectedNeighborhood) {
      setError('Please select a neighborhood to search for nearby places');
      return;
    }

    const service = new google.maps.places.PlacesService(mapRef.current);
    const request = {
      location: {
        lat: selectedNeighborhood.coordinates.latitude,
        lng: selectedNeighborhood.coordinates.longitude
      },
      radius: '5000',
      type: [type]
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        setPlaces(results);
        setSearchResults([]); // Clear search results
        setActiveFilter(type);
      } else {
        setError('Failed to fetch nearby places. Please try again.');
      }
    });
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <div className="map-error">Google Maps API key is missing. Please check your environment variables.</div>;
  }

  if (isLoading) {
    return <div className="map-loading">Loading map...</div>;
  }

  if (error) {
    return <div className="map-error">{error}</div>;
  }

  return (
    <LoadScript 
      googleMapsApiKey={apiKey}
      libraries={libraries}
    >
      <div className="map-view-container">
        <div className="map-controls">
          <div className="search-box">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search for places..."
                className="search-input"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </form>
          </div>
          <div className="filter-buttons">
            {Object.entries(placeTypes).map(([key, value]) => (
              <button
                key={key}
                className={`filter-button ${activeFilter === value ? 'active' : ''}`}
                onClick={() => searchNearbyPlaces(value)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="map-container" ref={mapRef}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={selectedNeighborhood ? {
              lat: selectedNeighborhood.coordinates.latitude,
              lng: selectedNeighborhood.coordinates.longitude
            } : center}
            zoom={selectedNeighborhood ? 15 : 12}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
            onLoad={(map) => {
              // Clear existing markers
              markersRef.current.forEach(marker => marker.map = null);
              markersRef.current = [];

              // Add neighborhood markers
              neighborhoods.forEach(neighborhood => {
                const markerView = new google.maps.marker.AdvancedMarkerElement({
                  position: {
                    lat: neighborhood.coordinates.latitude,
                    lng: neighborhood.coordinates.longitude
                  },
                  map: map,
                  title: neighborhood.name,
                  content: createMarkerContent(neighborhood.name, '#4285f4'),
                });

                markerView.addListener('click', () => {
                  setSelectedNeighborhood(neighborhood);
                });

                markersRef.current.push(markerView);
              });

              // Add search result markers
              searchResults.forEach(place => {
                const markerView = new google.maps.marker.AdvancedMarkerElement({
                  position: place.geometry.location,
                  map: map,
                  title: place.name,
                  content: createMarkerContent(place.name, '#34a853'),
                });

                markerView.addListener('click', () => {
                  setSelectedPlace(place);
                });

                markersRef.current.push(markerView);
              });

              // Add nearby place markers
              places.forEach(place => {
                const markerView = new google.maps.marker.AdvancedMarkerElement({
                  position: place.geometry.location,
                  map: map,
                  title: place.name,
                  content: createMarkerContent(place.name, '#ea4335'),
                });

                markerView.addListener('click', () => {
                  setSelectedPlace(place);
                });

                markersRef.current.push(markerView);
              });
            }}
          >
            {/* Info windows */}
            {selectedNeighborhood && (
              <InfoWindow
                position={{
                  lat: selectedNeighborhood.coordinates.latitude,
                  lng: selectedNeighborhood.coordinates.longitude
                }}
                onCloseClick={() => setSelectedNeighborhood(null)}
              >
                <div className="info-window">
                  <h3>{selectedNeighborhood.name}</h3>
                  <p>{selectedNeighborhood.description}</p>
                </div>
              </InfoWindow>
            )}

            {selectedPlace && (
              <InfoWindow
                position={selectedPlace.geometry.location}
                onCloseClick={() => setSelectedPlace(null)}
              >
                <div className="info-window">
                  <h3>{selectedPlace.name}</h3>
                  <p>{selectedPlace.vicinity}</p>
                  {selectedPlace.rating && (
                    <p>Rating: {selectedPlace.rating} ⭐</p>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </div>
    </LoadScript>
  );
};

export default Map; 