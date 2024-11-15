import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../component/NavBar';
import '../Css/RegistrationSuccess.css';

const RegistrationSuccess = () => {
  return (
    <div className="register-page">
      <NavBar />
      <main className="register-content">
        <div className="register-left">
          <h1 className="bricks-logo">Bricks</h1>
        </div>
        <div className="register-right">
          <div className="register-container">
            <h1 className="register-title">Registration Successful</h1>
            <p className="register-subtitle">Thank you for registering with Bricks!</p>
            <p className="success-message">Your account has been created successfully.</p>
            <Link to="/login" className="login-button">Go to Login</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegistrationSuccess;