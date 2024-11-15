import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Css/AuthenticatedNavBar.css';

const AuthenticatedNavBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="logo">Bricks</div>
      <div className="nav-links">
        <Link to="/profile" className="nav-item">Profile</Link>
        <Link to="/property" className="nav-item">Property List</Link>
      </div>
      <div className="auth-buttons">
        <button className="logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default AuthenticatedNavBar;