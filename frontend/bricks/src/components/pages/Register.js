import React, { useState } from 'react';
import NavBar from '../component/NavBar';
import '../Css/Register.css';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Register = ({ onNextStep }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8 || formData.password.length > 16 || !/\d/.test(formData.password)) {
      newErrors.password = "8-16 characters long and contain at least one number";
    }
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNextStep(formData); //send data to registerStepTwo
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
            <p className="register-subtitle">Step 1: Account Information</p>
            <form className="register-form" onSubmit={handleSubmit} noValidate>
              <div className="input-group">
                <User size={20} />
                <input type="text" name="firstName" placeholder="First Name" required value={formData.firstName} onChange={handleChange} />
                {errors.firstName && <div className="error-message-signup">{errors.firstName}</div>}
              </div>
              <div className="input-group">
                <User size={20} />
                <input type="text" name="lastName" placeholder="Last Name" required value={formData.lastName} onChange={handleChange} />
                {errors.lastName && <div className="error-message-signup">{errors.lastName}</div>}
              </div>
              <div className="input-group">
                <Mail size={20} />
                <input type="email" name="email" placeholder="Email" required value={formData.email} onChange={handleChange} />
                {errors.email && <div className="error-message-signup">{errors.email}</div>}
              </div>
              <div className="input-group">
                <Lock size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
                <button type="button" className="toggle-password" onClick={togglePasswordVisibility}>
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
                {errors.password && <div className="error-message-signup">{errors.password}</div>}
              </div>
              <div className="input-group">
                <Lock size={20} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button type="button" className="toggle-password" onClick={toggleConfirmPasswordVisibility}>
                  {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
                {errors.confirmPassword && <div className="error-message-signup">{errors.confirmPassword}</div>}
              </div>
              <p className="password-guidance">Password requires 8-16 characters with at least one number</p>
              <button type="submit" className="register-button">Next</button>
            </form>
            <p className="login-link">
              Already have an account? <a href="/login">Log in</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;