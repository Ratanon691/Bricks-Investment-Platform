import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminNavBar from '../component/AdminNavbar';
import axios from 'axios';
import '../Css/AdminAddProperty.css';

const AdminAddProperty = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [property, setProperty] = useState({
    name: '',
    type: '',
    pricePerShare: '',
    valuation: '',
    totalShares: '',
    availableShares: '',
    address: '',
    province: '',
    district: '',
    subdistrict: '',
    zipCode: '',
    annualDividend: '',
    propertyNote: '',
    size: '',
    amenities: '',
    nearbyPlaces: '',
    bedrooms: '',
    bathrooms: '',
    latitude: '',
    longitude: ''
  });
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state && location.state.property) {
      const editingProperty = location.state.property;
      setProperty({
        name: editingProperty.propertyName || '',
        type: editingProperty.propertyType || '',
        pricePerShare: formatNumber(editingProperty.pricePerShare) || '',
        valuation: formatNumber(editingProperty.propertyValuation) || '',
        totalShares: formatNumber(editingProperty.totalShares) || '',
        availableShares: formatNumber(editingProperty.availableShares) || '',
        address: editingProperty.address || '',
        province: editingProperty.province || '',
        district: editingProperty.district || '',
        subdistrict: editingProperty.subDistrict || '',
        zipCode: editingProperty.zipCode || '',
        annualDividend: formatNumber(editingProperty.annualDividend) || '',
        propertyNote: editingProperty.propertyNote || '',
        size: formatNumber(editingProperty.size) || '',
        amenities: editingProperty.amenities || '',
        nearbyPlaces: editingProperty.nearbyPlaces || '',
        bedrooms: formatNumber(editingProperty.bedrooms) || '',
        bathrooms: formatNumber(editingProperty.bathrooms) || '',
        latitude: editingProperty.latitude || '',
        longitude: editingProperty.longitude || ''
      });
      setIsEditing(true);

      if (editingProperty.propertyImages && editingProperty.propertyImages.length > 0) {
        const existingImages = editingProperty.propertyImages.map(img => ({
          id: img.id,
          preview: `http://localhost:8000/${img.imageUrl}`
        }));
        setImages(existingImages);
        setImagePreview(existingImages.map(img => img.preview));
      }
    }
  }, [location]);

  const formatNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
  };

  const unformatNumber = (str) => {
    return str.replace(/,/g, "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (['pricePerShare', 'valuation', 'totalShares', 'availableShares', 'annualDividend', 'size', 'bedrooms', 'bathrooms'].includes(name)) {
      newValue = unformatNumber(value);
      if (newValue !== '') {
        newValue = formatNumber(newValue);
      }
    }

    setProperty(prevState => ({
      ...prevState,
      [name]: newValue
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 20) {
      setError('You can only upload up to 20 images in total.');
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prevImages => [...prevImages, ...newImages]);
    setImagePreview(prevPreviews => [...prevPreviews, ...newImages.map(img => img.preview)]);
  };

  const removeImage = (index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    setImagePreview(prevPreviews => {
      const updatedPreviews = prevPreviews.filter((_, i) => i !== index);
      if (prevPreviews[index] && prevPreviews[index].startsWith('blob:')) {
        URL.revokeObjectURL(prevPreviews[index]);
      }
      return updatedPreviews;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length === 0 && !isEditing) {
      setError('Please upload at least one image.');
      return;
    }

    // Validate coordinates
    const lat = parseFloat(property.latitude);
    const lng = parseFloat(property.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid coordinates.');
      return;
    }

    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90 degrees.');
      return;
    }

    if (lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180 degrees.');
      return;
    }

    const formData = new FormData();
    Object.keys(property).forEach(key => {
      let value = property[key];
      if (['pricePerShare', 'valuation', 'totalShares', 'availableShares', 'annualDividend', 'size', 'bedrooms', 'bathrooms'].includes(key)) {
        value = unformatNumber(value);
      }
      formData.append(key, value);
    });

    // Track which existing images to keep
    const retainedImageIds = images
      .filter(image => image.id)
      .map(image => image.id);
    
    formData.append('retainedImageIds', JSON.stringify(retainedImageIds));

    // Add new images
    images.forEach((image) => {
      if (image.file) {
        formData.append('images', image.file);
      }
    });

    try {
      const url = isEditing
        ? `http://localhost:8000/properties/${location.state.property.id}`
        : 'http://localhost:8000/properties';
      const method = isEditing ? 'put' : 'post';
      
      const response = await axios[method](url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(`Property ${isEditing ? 'updated' : 'added'} successfully:`, response.data);
      navigate('/admin/property-management');
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'add'} property:`, error.response ? error.response.data : error.message);
      setError(`Failed to ${isEditing ? 'update' : 'add'} property. Please try again.`);
    }
  };

  const handleCoordinatesChange = (value) => {
    const coordsMatch = value.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    
    if (coordsMatch) {
      const lat = parseFloat(coordsMatch[1]);
      const lng = parseFloat(coordsMatch[2]);
      
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setProperty(prev => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6)
        }));
      }
    } else {
      const [latStr, lngStr] = value.split(',').map(s => s.trim());
      setProperty(prev => ({
        ...prev,
        latitude: latStr || '',
        longitude: lngStr || ''
      }));
    }
  };

  const handleCoordinatesPaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const coordsMatch = pastedText.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    
    if (coordsMatch) {
      const lat = parseFloat(coordsMatch[1]);
      const lng = parseFloat(coordsMatch[2]);
      
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setProperty(prev => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6)
        }));
      } else {
        setError('Invalid coordinates range. Latitude must be between -90 and 90, Longitude between -180 and 180.');
      }
    } else {
      setError('Invalid coordinates format. Please paste in format: latitude, longitude');
    }
  };

  return (
    <div className="admin-add-property-page">
      <AdminNavBar />
      <div className="admin-add-property">
        <h1>{isEditing ? 'Edit Property' : 'Add New Property'}</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <label>
            Property Name:
            <input type="text" name="name" value={property.name} onChange={handleChange} required />
          </label>

          <label>
            Property Type:
            <select name="type" value={property.type} onChange={handleChange} required>
              <option value="">Select Type</option>
              <option value="Condo">Condo</option>
              <option value="House">House</option>
              <option value="Land">Land</option>
              <option value="Others">Others</option>
            </select>
          </label>

          {/* Financial Information */}
          <label>
            Price per Share (THB):
            <input type="text" name="pricePerShare" value={property.pricePerShare} onChange={handleChange} required />
          </label>

          <label>
            Property Valuation (THB):
            <input type="text" name="valuation" value={property.valuation} onChange={handleChange} required />
          </label>

          <label>
            Total Shares:
            <input type="text" name="totalShares" value={property.totalShares} onChange={handleChange} required />
          </label>

          <label>
            Available Shares:
            <input type="text" name="availableShares" value={property.availableShares} onChange={handleChange} required />
          </label>

          {/* Location Information */}
          <label>
            Address:
            <textarea name="address" value={property.address} onChange={handleChange} required />
          </label>

          <label>
            Subdistrict:
            <input type="text" name="subdistrict" value={property.subdistrict} onChange={handleChange} required />
          </label>
          
          <label>
            District:
            <input type="text" name="district" value={property.district} onChange={handleChange} required />
          </label>

          <label>
            Province:
            <input type="text" name="province" value={property.province} onChange={handleChange} required />
          </label>

          <label>
            Zip Code:
            <input type="text" name="zipCode" value={property.zipCode} onChange={handleChange} required />
          </label>

          <label>
            Property Location:
            <div className="coordinates-input-container">
              <input
                type="text"
                placeholder="Paste coordinates (e.g., 13.746761, 100.562767)"
                value={`${property.latitude ? property.latitude : ''}, ${property.longitude ? property.longitude : ''}`.replace(/, $/, '')}
                onChange={(e) => handleCoordinatesChange(e.target.value)}
                onPaste={handleCoordinatesPaste}
                required
              />
              <div className="coordinates-display">
                <div>
                  <div className="coordinate-label">Parsed Coordinates:</div>
                  <div className="parsed-coordinates">
                    {property.latitude && property.longitude ? (
                      <>
                        <span>Lat: {property.latitude}</span>
                        <span>Lng: {property.longitude}</span>
                      </>
                    ) : (
                      <span className="coordinate-hint">
                        Paste coordinates in format: latitude, longitude
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </label>

          {/* Property Details */}
          <label>
            Annual Dividend per share(%):
            <input type="text" name="annualDividend" value={property.annualDividend} onChange={handleChange} required />
          </label>

          <label>
            Property Note:
            <textarea name="propertyNote" value={property.propertyNote} onChange={handleChange} />
          </label>

          <label>
            Size (sqm):
            <input type="text" name="size" value={property.size} onChange={handleChange} required />
          </label>

          <label>
            Amenities:
            <textarea 
              name="amenities" 
              value={property.amenities} 
              onChange={handleChange}
              placeholder="Separate items with commas"
            />
          </label>

          <label>
            Nearby Places:
            <textarea 
              name="nearbyPlaces" 
              value={property.nearbyPlaces} 
              onChange={handleChange}
              placeholder="Separate items with commas"
            />
          </label>

          <label>
            Number of Bedrooms:
            <input type="text" name="bedrooms" value={property.bedrooms} onChange={handleChange} />
          </label>

          <label>
            Number of Bathrooms:
            <input type="text" name="bathrooms" value={property.bathrooms} onChange={handleChange} />
          </label>

          {/* Image Upload */}
          <label className="image-upload">
            Upload up to 20 Images (only jpg, jpeg, png):
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleImageUpload} 
              required={!isEditing && images.length === 0}
            />
          </label>

          {imagePreview.length > 0 && (
            <div className="image-preview-container">
              {imagePreview.map((img, index) => (
                <div key={index} className="image-preview-item">
                  <img src={img} alt={`Preview ${index}`} />
                  <button type="button" onClick={() => removeImage(index)} className="remove-image">X</button>
                </div>
              ))}
            </div>
          )}

        <button type="submit">{isEditing ? 'Update Property' : 'Add Property'}</button>
                </form>
              </div>
            </div>
          );
        };

export default AdminAddProperty;