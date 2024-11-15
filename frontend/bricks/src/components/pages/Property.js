import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../component/NavBar';
import '../Css/Property.css';
import { Home, Building2, Trees, Store, Layers } from 'lucide-react';

const Property = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  const handlePropertyTypeClick = (type) => {
    // Include search term in navigation if it exists
    navigate(`/properties/${type}${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to PropertyList with the search term
      navigate(`/properties/All?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="property-page">
      <NavBar />
      <main className="content">
        <h1 className="title">Find Your Perfect Property Slice</h1>
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
      </main>
    </div>
  );
};

export default Property;