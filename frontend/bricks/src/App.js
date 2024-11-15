import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import Profile from './components/pages/Profile';
import HowItWorks from './components/pages/HowItWorks';
import AboutUs from './components/pages/AboutUs';
import Property from './components/pages/Property';
import PropertyList from './components/pages/PropertyList';
import PropertyDetail from './components/pages/PropertyDetail';
import RegistrationProcess from './components/pages/RegistrationProcess';
import RegistrationSuccess from './components/pages/RegistrationSuccess'; 
import AdminAddProperty from './components/pages/AdminAddProperty';
import AdminPropertyManagement from './components/pages/AdminPropertyManagement';
import Portfolio from './components/pages/Portfolio';

// Protected route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  //get token, role from localstorage
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  //if no token-> redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  //if token exists but not the right one redirect to homepage
  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Howitworks" element={<HowItWorks />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/Property" element={<Property />} />
        <Route path="/properties/:type" element={<PropertyList />} />
        <Route path="/properties/:type/:location?" element={<PropertyList />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/register" element={<RegistrationProcess />} />
        <Route path="/register-success" element={<RegistrationSuccess />} />
        
        {/* Protected Routes */}
        <Route path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route path="/portfolio" 
          element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route path="/admin/property-management" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPropertyManagement />
            </ProtectedRoute>
          } 
        />
        <Route path="/admin/add-property" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAddProperty />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;