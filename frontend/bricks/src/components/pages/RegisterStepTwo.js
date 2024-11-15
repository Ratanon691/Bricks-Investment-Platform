import React, { useState } from 'react';
import NavBar from '../component/NavBar';
import '../Css/Register.css';
import { User, MapPin } from 'lucide-react';

const RegisterStepTwo = ({ onRegister, previousData }) => {
  const [formData, setFormData] = useState({
    idNumber: '',
    address: '',
    province: '',
    district: '',
    subDistrict: '',
    zipCode: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!/^\d{13}$/.test(formData.idNumber)) newErrors.idNumber = "ID number must be a 13-digit integer";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.province.trim()) newErrors.province = "Province is required";
    if (!formData.district.trim()) newErrors.district = "District is required";
    if (!formData.subDistrict.trim()) newErrors.subDistrict = "Sub-district is required";
    if (!/^\d{5}$/.test(formData.zipCode)) newErrors.zipCode = "ZIP code must be a 5-digit number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onRegister({ ...previousData, ...formData });
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ submit: 'Registration failed. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="register-page">
      <NavBar />
      <main className="register-content">
        <div className="register-left">
          <h1 className="bricks-logo">Bricks</h1>
        </div>
        <div className="register-right">
          <div className="register-container">
            <h1 className="register-title">Register</h1>
            <p className="register-subtitle">Step 2: Additional Information</p>
            <form className="register-form" onSubmit={handleSubmit} noValidate>
              <div className="input-group">
                <User size={20} />
                <input 
                  type="text" 
                  name="idNumber" 
                  placeholder="ID Number (13 digits)" 
                  required 
                  value={formData.idNumber} 
                  onChange={handleChange} 
                />
                {errors.idNumber && <div className="error-message-signup">{errors.idNumber}</div>}
              </div>
              <div className="input-group">
                <MapPin size={20} />
                <input 
                  type="text" 
                  name="address" 
                  placeholder="Address" 
                  required 
                  value={formData.address} 
                  onChange={handleChange} 
                />
                {errors.address && <div className="error-message-signup">{errors.address}</div>}
              </div>
              <div className="input-group">
                <MapPin size={20} />
                <input 
                  type="text" 
                  name="province" 
                  placeholder="Province" 
                  required 
                  value={formData.province} 
                  onChange={handleChange} 
                />
                {errors.province && <div className="error-message-signup">{errors.province}</div>}
              </div>
              <div className="input-group">
                <MapPin size={20} />
                <input 
                  type="text" 
                  name="district" 
                  placeholder="District" 
                  required 
                  value={formData.district} 
                  onChange={handleChange} 
                />
                {errors.district && <div className="error-message-signup">{errors.district}</div>}
              </div>
              <div className="input-group">
                <MapPin size={20} />
                <input 
                  type="text" 
                  name="subDistrict" 
                  placeholder="Sub District" 
                  required 
                  value={formData.subDistrict} 
                  onChange={handleChange} 
                />
                {errors.subDistrict && <div className="error-message-signup">{errors.subDistrict}</div>}
              </div>
              <div className="input-group">
                <MapPin size={20} />
                <input 
                  type="text" 
                  name="zipCode" 
                  placeholder="ZIP Code" 
                  required 
                  value={formData.zipCode} 
                  onChange={handleChange} 
                />
                {errors.zipCode && <div className="error-message-signup">{errors.zipCode}</div>}
              </div>
              <button type="submit" className="register-button" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
              {errors.submit && <div className="error-message-signup">{errors.submit}</div>}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterStepTwo;