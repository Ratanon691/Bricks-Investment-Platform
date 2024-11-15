import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../component/NavBar';
import PropertyCard from '../component/PropertyCard'; // Import the new component
import '../Css/PropertyList.css';
import { Home, Building2, Trees, Store, Layers } from 'lucide-react';

const PropertyList = () => {
  const [properties, setProperties] = useState([]); //create array to contain properties
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { type } = useParams(); //get property type from url
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { search } = useLocation(); //get query from url

  const fetchProperties = useCallback(async () => { //only create new function when dependencies [type,searchTerm] changed
    setLoading(true);
    setError(null);
    try {
      let url = 'http://localhost:8000/properties';
      const params = new URLSearchParams(); //obj append to url

      if (type && type !== 'All') {
        params.append('propertyType', type);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (params.toString()) { //add type or query to url
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to fetch properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [type, searchTerm]);

  useEffect(() => {
    const queryParams = new URLSearchParams(search);
    const searchQuery = queryParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [search]);

  useEffect(() => { //read more useCallback()/useEffect() - component life cycle
    fetchProperties();
  }, [fetchProperties, type]);

  const handlePropertyTypeClick = (newType) => {
    navigate(`/properties/${newType}${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/properties/${type || 'All'}?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const getTitle = () => {
    if (searchTerm) {
      return `Search Results for "${searchTerm}"`;
    }
    if (!type || type === 'All') {
      return 'All Properties';
    }
    return `${type} Properties`;
  };

  return (
    <div className="property-list-page">
      <NavBar />
      <main className="content">
        <h1 className="title">{getTitle()}</h1>
        
        <form className="search-container" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Search by name, province, district, or sub-district" 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-button">Search</button>
        </form>
        
        <div className="property-types">
          <div className="property-type" onClick={() => handlePropertyTypeClick('All')}>
            <Layers size={48} />
            <span>All</span>
          </div>
          <div className="property-type" onClick={() => handlePropertyTypeClick('Condo')}>
            <Building2 size={48} />
            <span>Condo</span>
          </div>
          <div className="property-type" onClick={() => handlePropertyTypeClick('House')}>
            <Home size={48} />
            <span>House</span>
          </div>
          <div className="property-type" onClick={() => handlePropertyTypeClick('Land')}>
            <Trees size={48} />
            <span>Land</span>
          </div>
          <div className="property-type" onClick={() => handlePropertyTypeClick('Others')}>
            <Store size={48} />
            <span>Others</span>
          </div>
        </div>
        
        {loading ? (
          <p className="loading-message">Loading properties...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="property-grid">
            {properties.length === 0 ? (
              <p className="no-properties-message">No properties available.</p>
            ) : (
              // Map through properties array and create PropertyCard components
              properties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PropertyList;