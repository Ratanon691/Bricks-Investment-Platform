import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../Css/NavBar.css';

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isAuthPage = location.pathname === '/register' || location.pathname === '/login';

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="logo">Bricks</div>
      {isAuthenticated ? (
        // Authenticated user navigation
        <>
          <div className="nav-links">
            <Link to="/profile" className="nav-item">Profile</Link>
            <Link to="/property" className="nav-item">Property List</Link>
          </div>
          <div className="auth-buttons">
            <button className="btn logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </>
      ) : (
        // Non-authenticated user navigation
        <>
          <div className="nav-links">
            <Link to="/" className="nav-item">Home</Link>
            <Link to="/Property" className="nav-item">Property</Link>
            <Link to="/HowItWorks" className="nav-item">How it works</Link>
            <Link to="/AboutUs" className="nav-item">About us</Link>
          </div>
          {!isAuthPage && (
            <div className="auth-buttons">
              <button className="btn register-btn" onClick={handleRegisterClick}>Register</button>
              <button className="btn login-btn" onClick={handleLoginClick}>Login</button>
            </div>
          )}
        </>
      )}
    </nav>
  );
};

export default NavBar;