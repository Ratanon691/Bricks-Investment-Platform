import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../component/NavBar';
import '../Css/Login.css';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../AuthContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userRole = await login({ email, password }); //call login func from AuthContext, see func detail in auth Context
      
      // Navigate based on role
      if (userRole === 'admin') {
        navigate('/admin/property-management');
      } else {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Login error:', error.response || error);
      setError(error.response?.data?.message || 'An error occurred during login');
    }
  };

  return (
    <div className="login-page">
      <NavBar />
      <main className="login-content">
        <div className="login-left">
          <h1 className="bricks-logo">Bricks</h1>
        </div>
        <div className="login-right">
          <div className="login-container">
            <h1 className="login-title">Login</h1>
            <p className="login-subtitle">Welcome back to Bricks</p>
            {error && <p className="error-message">{error}</p>}
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <Mail size={20} />
                <input 
                  type="email" 
                  placeholder="Email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="input-group">
                <Lock size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              <button type="submit" className="login-button">Login</button>
            </form>
            {/* <p className="forgot-password">
              <a href="/forgot-password">Forgot your password?</a>
            </p> */}
            <p className="register-link">
              Don't have an account? <a href="/register">Sign up</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;