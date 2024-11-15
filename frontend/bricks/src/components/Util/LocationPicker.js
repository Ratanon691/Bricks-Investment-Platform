import React, { useState, useEffect, useCallback } from 'react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCBHYlYm0PdIVog1O09m79OdW4nJh_27T8';

const LocationPicker = ({ 
  address, 
  district, 
  province, 
  subDistrict, 
  onLocationSelected,
  initialLat,
  initialLng 
}) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Move map initialization to a useCallback hook
  const initializeMap = useCallback(async () => {
    try {
      // Make sure Google Maps is loaded
      if (typeof window.google === 'undefined') {
        throw new Error('Google Maps API not loaded');
      }

      // Get the initial position
      let initialPosition;
      
      if (initialLat && initialLng) {
        // Use provided coordinates
        initialPosition = {
          lat: parseFloat(initialLat),
          lng: parseFloat(initialLng)
        };
      } else if (address && district && province) {
        // Try to geocode the address
        const fullAddress = `${address}, ${subDistrict}, ${district}, ${province}, Thailand`;
        const geocoder = new window.google.maps.Geocoder();
        
        try {
          const result = await new Promise((resolve, reject) => {
            geocoder.geocode({ address: fullAddress }, (results, status) => {
              if (status === 'OK' && results && results.length > 0) {
                resolve(results[0].geometry.location);
              } else {
                reject(new Error('Geocoding failed'));
              }
            });
          });
          
          initialPosition = {
            lat: result.lat(),
            lng: result.lng()
          };
        } catch (geocodeError) {
          console.warn('Geocoding failed, using default position:', geocodeError);
          // Default to Bangkok coordinates
          initialPosition = {
            lat: 13.7563,
            lng: 100.5018
          };
        }
      } else {
        // Use default Bangkok coordinates
        initialPosition = {
          lat: 13.7563,
          lng: 100.5018
        };
      }

      // Create the map
      const mapElement = document.getElementById('location-picker-map');
      if (!mapElement) {
        throw new Error('Map container not found');
      }

      const mapInstance = new window.google.maps.Map(mapElement, {
        center: initialPosition,
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'greedy',
        mapTypeId: 'roadmap',
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU
        }
      });

      // Create the marker
      const markerInstance = new window.google.maps.Marker({
        position: initialPosition,
        map: mapInstance,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        title: 'Drag to set location'
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: 'Click or drag to set location'
      });

      // Show info window on marker click
      markerInstance.addListener('click', () => {
        infoWindow.open(mapInstance, markerInstance);
      });

      // Update location when marker is dragged
      markerInstance.addListener('dragend', () => {
        const position = markerInstance.getPosition();
        const lat = position.lat();
        const lng = position.lng();
        
        onLocationSelected(lat, lng);
        infoWindow.setContent(
          `Location set to:<br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`
        );
        infoWindow.open(mapInstance, markerInstance);
      });

      // Update location when map is clicked
      mapInstance.addListener('click', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        markerInstance.setPosition(event.latLng);
        onLocationSelected(lat, lng);
        infoWindow.setContent(
          `Location set to:<br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`
        );
        infoWindow.open(mapInstance, markerInstance);
      });

      // Save references
      setMap(mapInstance);
      setMarker(markerInstance);
      
      // Trigger initial coordinates
      onLocationSelected(initialPosition.lat, initialPosition.lng);
      
      // Hide loading state
      setLoading(false);

    } catch (err) {
      console.error('Map initialization error:', err);
      setError(`Failed to initialize map: ${err.message}`);
      setLoading(false);
    }
  }, [address, district, province, subDistrict, initialLat, initialLng, onLocationSelected]);

  useEffect(() => {
    // Clean up function for previous map/marker
    const cleanup = () => {
      if (marker) {
        marker.setMap(null);
      }
      if (map) {
        setMap(null);
      }
    };

    // Function to check if Google Maps API is loaded
    const isGoogleMapsLoaded = () => {
      return typeof window !== 'undefined' && 
             typeof window.google !== 'undefined' && 
             typeof window.google.maps !== 'undefined';
    };

    // Load Google Maps if not already loaded
    if (!isGoogleMapsLoaded()) {
      cleanup();
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
        setError('Failed to load Google Maps');
        setLoading(false);
      };
      document.head.appendChild(script);
    } else {
      // If already loaded, just initialize the map
      cleanup();
      initializeMap();
    }

    return cleanup;
  }, [map, marker, initializeMap]);

  if (loading) {
    return (
      <div className="location-picker-container">
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="location-picker-container">
        <div className="map-error">
          <p>⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="location-picker-container">
      <div 
        id="location-picker-map" 
        className="w-full h-96 rounded-lg shadow-md"
      />
      <p className="text-sm text-gray-600 mt-2">
        Click on the map or drag the marker to set the property location
      </p>
    </div>
  );
};

export default LocationPicker;