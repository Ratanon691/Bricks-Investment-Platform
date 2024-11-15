import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminNavBar from '../component/AdminNavbar';
import '../Css/AdminPropertyManagement.css';

const AdminPropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []); //[] -> run when component mount

  const fetchProperties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8000/properties');
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(`Failed to fetch properties. ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  //search and filter property
  const filteredProperties = properties
    .filter(property => filter === 'All' || property.propertyType === filter)
    .filter(property => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (property.propertyName || '').toLowerCase().includes(searchLower) ||
        (property.province || '').toLowerCase().includes(searchLower) ||
        (property.district || '').toLowerCase().includes(searchLower) ||
        (property.subDiatrict || '').toLowerCase().includes(searchLower)
      );
    });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteProperty = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/properties/${id}`);
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      setError('Failed to delete property. Please try again.');
    }
  };

  const handleEditProperty = (property) => {
    navigate('/admin/add-property', { 
      state: { property: JSON.parse(JSON.stringify(property)) }
    });
  };

  if (isLoading) {
    return <div>Loading properties...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="admin-property-management-page">
      <AdminNavBar />
      <div className="admin-property-management-content">
        <h1 className='property-management'>Property Management</h1>
        <div className="search-and-filter">
          <input
            type="text"
            placeholder="Search by name or location"
            value={searchTerm}
            onChange={handleSearch}
            className="search-bar"
          />
          <div className="filter-buttons">
            {['All', 'Condo', 'House', 'Land', 'Others'].map(type => (
              <button
                key={type}
                className={`filter-button ${filter === type ? 'active' : ''}`}
                onClick={() => setFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div className="property-grid">
          {filteredProperties.map(property => (
            <div key={property.id} className="property-card">
              <img 
                src={property.propertyImages && property.propertyImages.length > 0 
                  ? `http://localhost:8000/${property.propertyImages[0].imageUrl}` 
                  : 'https://via.placeholder.com/150'} 
                alt={property.propertyName || 'Property'} 
              />
              <h2>{property.propertyName || 'Unnamed Property'}</h2>
              <p>Type: {property.propertyType || 'N/A'}</p>
              <p>Location: {property.district || 'N/A'}, {property.province || 'N/A'}</p>
              <p>Price per Share: ฿{(parseFloat(property.pricePerShare) || 0).toLocaleString()}</p>
              <p>Total Shares: {property.totalShares || 'N/A'}</p>
              <p>Available Shares: {property.availableShares || 'N/A'}</p>
              <div className="card-buttons">
                <button className="edit-button" onClick={() => handleEditProperty(property)}>Edit</button>
                <button className="delete-button" onClick={() => handleDeleteProperty(property.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyManagement;