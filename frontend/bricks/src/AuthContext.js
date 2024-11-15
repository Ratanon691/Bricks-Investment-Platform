import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
//set initial role to user
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ role: 'guest' });

//if token, user data exist-> restore role(when refresh page)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      const userData = JSON.parse(storedUser);
      setUser({ ...userData, token });
    }
  }, []);

  const login = async (credentials) => {
    try { //send req to backend -> see detail in user controller loginUser func
      const response = await axios.post('http://localhost:8000/users/login', credentials);
      const { token, user: userData } = response.data;
      //update authstate and keep in local storage
      setUser({ ...userData, token });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData.role; // Return role for navigation
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser({ role: 'guest' });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:8000/users/register', userData);
      const { token, user: newUser } = response.data;
      
      setUser({ ...newUser, token });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const isAdmin = () => user.role === 'admin';
  const isAuthenticated = () => !!user.token; //check if token exists -> return boolean

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register,
      isAdmin,
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);