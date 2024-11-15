import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import '../Css/LocationMap.css';

const LocationMap = ({ 
  latitude, 
  longitude, 
  address, 
  subDistrict, 
  district, 
  province, 
  zipCode,
  showAddress = true,
  showDirectionsLink = true,
  height = 300,
  className = ''
}) => {
  const formattedAddress = `${address}, ${subDistrict}, ${district}, ${province} ${zipCode}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  
  // Use environment variable
  const MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  return (
    <div className={`location-map-container ${className}`}>
      <h3>Property Location</h3>
      {showAddress && (
        <div className="location-details">
          <MapPin size={20} />
          <div className="location-text">
            <div>{formattedAddress}</div>
          </div>
        </div>
      )}
      <div className="map-wrapper">
        <iframe
          title="Property Location"
          width="100%"
          height={height}
          frameBorder="0"
          style={{ border: 0, borderRadius: '8px' }}
          src={`https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${formattedAddress}&zoom=15`}
          allowFullScreen
        />
        {showDirectionsLink && (
          <div className="map-actions">
            <a 
              href={`https://www.google.com/maps/dir//${encodeURIComponent(formattedAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="map-action-button"
            >
              <Navigation size={16} />
              Get Directions
            </a>
            <a 
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="map-action-button"
            >
              <ExternalLink size={16} />
              View Larger Map
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationMap;