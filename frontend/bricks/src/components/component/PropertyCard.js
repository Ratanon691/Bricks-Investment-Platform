import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/PropertyCard.css';

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();

  // Add comma separator to numbers
  const formatNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
  };

  return (
    // Add property to the card component with navigation to detail page
    <div 
      className="property-card" 
      onClick={() => navigate(`/property/${property.id}`)}
    >
      <img 
        src={property.propertyImages && property.propertyImages.length > 0 
          ? `http://localhost:8000/${property.propertyImages[0].imageUrl}`
          : 'https://via.placeholder.com/300x200'} 
        alt={property.propertyName} 
        className="property-image" 
      />
      <div className="property-info">
        <h3 className='property-name'>{property.propertyName}</h3>
        <p>{property.district}, {property.province}</p>
        <p>฿{formatNumber(property.pricePerShare)} per share</p>
        <button className="invest-button">View Details</button>
      </div>
    </div>
  );
};

export default PropertyCard;