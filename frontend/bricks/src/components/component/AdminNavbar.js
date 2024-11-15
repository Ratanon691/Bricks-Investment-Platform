import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import '../Css/AdminNavbar.css';

const AdminNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Use auth context logout
    logout();
    navigate('/login');
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar__logo">Bricks Admin</div>
      <div className="admin-navbar__links">
        <Link 
          to="/admin/add-property" 
          className={`admin-navbar__link ${location.pathname === '/admin/add-property' ? 'admin-navbar__link--active' : ''}`}
        >
          Add Property
        </Link>
        <Link 
          to="/admin/property-management" 
          className={`admin-navbar__link ${location.pathname === '/admin/property-management' ? 'admin-navbar__link--active' : ''}`}
        >
          Property Management
        </Link>
      </div>
      <div className="admin-navbar__auth">
        <button 
          className="admin-navbar__btn admin-navbar__btn--logout" 
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavBar;