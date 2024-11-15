import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../component/NavBar';
import '../Css/PropertyDetail.css';
import { Home, Building2, DollarSign, MapPin, Calendar, Users, Square, Star, ChevronLeft, ChevronRight, X } from 'lucide-react';
import BuySellPopup from './BuySellPopup';
import LocationMap from '../component/LocationMap';

const PropertyDetail = () => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);//set fullscreen img
  const [isPopupOpen, setIsPopupOpen] = useState(false);//popup controll
  const [popupAction, setPopupAction] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userShares, setUserShares] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();

  const formatNumber = (number) => {
    if (number === null || number === undefined) return '0';
    
    // Check if the number has decimal places
    if (Number.isInteger(number)) {
      // For whole numbers, format with commas but no decimal places
      return number.toLocaleString('en-US');
    } else {
      // For decimal numbers, format with commas and fixed 2 decimal places
      return number.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  };
  const fetchUserShares = useCallback(async (userId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching shares for propertyId:', id);
      const response = await axios.get(`http://localhost:8000/shares/property/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Shares response:', response.data);
      setUserShares(response.data.shares || 0);
    } catch (error) {
      console.error('Error fetching user shares:', error);
      setUserShares(0);
    }
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    const fetchPropertyDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching property details for ID: ${id}`);
        const response = await axios.get(`http://localhost:8000/properties/${id}`);
        console.log('API Response:', response.data);
        setProperty(response.data);
      } catch (error) {
        console.error('Error fetching property details:', error);
        setError('Failed to fetch property details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetail();
  }, [id]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:8000/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserId(response.data.user.id);
          fetchUserShares(response.data.user.id);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [fetchUserShares]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!property) return <div>Property not found</div>;

  const openFullscreen = (index) => {
    setFullscreenImage(index);
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  const nextImage = () => {
    setFullscreenImage((prev) => (prev + 1) % property.propertyImages.length);
  };

  const prevImage = () => {
    setFullscreenImage((prev) => (prev - 1 + property.propertyImages.length) % property.propertyImages.length);
  };

  const handleBuySell = (action) => {
    if (isAuthenticated) {
      setPopupAction(action);
      setIsPopupOpen(true);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="property-detail-page">
      <NavBar />
      <main className="content">
        <div className="property-header">
          <h1 className="title">{property.propertyName}</h1>
          <div className="location">
            <MapPin size={20} />
            <span>{property.district}, {property.province}</span>
          </div>
        </div>
        
        <div className="property-images">
          <div className="main-image-container">
            <img 
              src={property.propertyImages && property.propertyImages.length > 0 
                ? `http://localhost:8000/${property.propertyImages[0].imageUrl}`
                : 'https://via.placeholder.com/600x400'} 
              alt={property.propertyName} 
              className="main-image" 
              onClick={() => openFullscreen(0)} 
            />
          </div>
          <div className="thumbnail-images">
            {property.propertyImages && property.propertyImages.slice(1).map((image, index) => (
              <img 
                key={index} 
                src={`http://localhost:8000/${image.imageUrl}`} 
                alt={`${property.propertyName} thumbnail ${index + 1}`} 
                className="thumbnail" 
                onClick={() => openFullscreen(index + 1)} 
              />
            ))}
          </div>
        </div>

        <div className="property-info-grid">
          <div className="property-description">
            <h2>About this property</h2>
            <p>{property.propertyNote}</p>
            
            <div className="key-features">
              <div className="feature">
                <Building2 size={24} />
                <span>{property.propertyType}</span>
              </div>
              <div className="feature">
                <Square size={24} />
                <span>{property.size} sqm</span>
              </div>
              {property.bedrooms && (
                <div className="feature">
                  <Home size={24} />
                  <span>{property.bedrooms} Bedrooms</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="feature">
                  <Home size={24} />
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
              )}
            </div>
            
            <h3>Amenities</h3>
            <ul className="amenities-list">
              {property.amenities && property.amenities.split(',').map((amenity, index) => (
                <li key={index}><Star size={16} /> {amenity.trim()}</li>
              ))}
            </ul>

            <h3>Nearby Places</h3>
            <ul className="nearby-places-list">
              {property.nearbyPlaces && property.nearbyPlaces.split(',').map((place, index) => (
                <li key={index}><MapPin size={16} /> {place.trim()}</li>
              ))}
            </ul>
          </div>

          <div className="property-stats">
            <h2>Investment Overview</h2>
            <div className="stat-item">
              <DollarSign size={24} />
              <div>
                <h4>Price per share</h4>
                <span>฿{formatNumber(property.pricePerShare)}</span>
              </div>
            </div>
            <div className="stat-item">
              <Users size={24} />
              <div>
                <h4>Available shares</h4>
                <span>{formatNumber(property.availableShares)}/{formatNumber(property.totalShares)}</span>
              </div>
            </div>
            <div className="stat-item">
              <DollarSign size={24} />
              <div>
                <h4>Property valuation</h4>
                <span>฿{formatNumber(property.propertyValuation)}</span>
              </div>
            </div>
            <div className="stat-item">
              <Calendar size={24} />
              <div>
                <h4>Annual Dividend</h4>
                <span>{property.annualDividend}%</span>
              </div>
            </div>
            <LocationMap 
            latitude={property.latitude}
            longitude={property.longitude}
            address={property.address}
            subDistrict={property.subDistrict}
            district={property.district}
            province={property.province}
            zipCode={property.zipCode}
            showDirectionsLink={true}
            height={350}
            className="property-detail-map"
          />           
            <div className="investment-section">
              <h3>Trade shares in {property.propertyName}</h3>
              <div className="button-container">
                <button className="buy-button" onClick={() => handleBuySell('Buy')}>
                  {isAuthenticated ? 'Buy' : 'Login to Buy'}
                </button>
                <button className="sell-button" onClick={() => handleBuySell('Sell')}>
                  {isAuthenticated ? 'Sell' : 'Login to Sell'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {fullscreenImage !== null && (
        <div className="fullscreen-overlay" onClick={closeFullscreen}>
          <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={`http://localhost:8000/${property.propertyImages[fullscreenImage].imageUrl}`} 
              alt={`${property.propertyName} fullscreen`} 
              className="fullscreen-image" 
            />
            <button className="fullscreen-close" onClick={closeFullscreen}><X size={24} /></button>
            <button className="fullscreen-nav prev" onClick={prevImage}><ChevronLeft size={24} /></button>
            <button className="fullscreen-nav next" onClick={nextImage}><ChevronRight size={24} /></button>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <BuySellPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          action={popupAction}
          property={property}
          userShares={userShares}
          userId={userId}
          onTransactionComplete={() => {
            fetchUserShares(userId);
          }}
        />
      )}
    </div>
  );
};

export default PropertyDetail;