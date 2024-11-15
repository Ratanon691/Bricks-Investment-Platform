import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../component/NavBar';
import '../Css/Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="home-page">
      <NavBar />
      <main className="home-content">
        <h1 className="home-title">Build your assets, one brick at a time</h1>
        <button className="get-started-btn" onClick={handleGetStarted}>Get started</button>
      </main>
    </div>
  );
};

export default Home;