import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Css/Portfolio.css';
import NavBar from '../component/NavBar';
import PortfolioPropertyMap from '../component/PortfolioPropertyMap';
import GoogleMapsWrapper from '../component/GoogleMapsWrapper';
import { Building2 } from 'lucide-react';

const Portfolio = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPortfolioData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                
                // First, get user's properties
                const userPropertiesResponse = await axios.get('http://localhost:8000/shares/user-properties', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Get full property details for each property
                const propertiesWithDetails = await Promise.all(
                    userPropertiesResponse.data.map(async (property) => {
                        try {
                            const detailResponse = await axios.get(`http://localhost:8000/properties/${property.id}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            
                            // Combine the shares data with full property details
                            return {
                                ...detailResponse.data,
                                Shares: property.Shares
                            };
                        } catch (error) {
                            console.error(`Error fetching details for property ${property.id}:`, error);
                            return property; // Return original property if detail fetch fails
                        }
                    })
                );

                const sortedProperties = propertiesWithDetails.sort((a, b) => 
                    b.Shares.amount - a.Shares.amount
                );

                console.log('Properties with coordinates:', sortedProperties.map(p => ({
                    name: p.propertyName,
                    lat: p.latitude,
                    lng: p.longitude,
                    shares: p.Shares.amount
                })));

                setProperties(sortedProperties);
                setError(null);
            } catch (error) {
                console.error('Error fetching portfolio data:', error);
                const errorMessage = error.response?.data?.message || 'Failed to fetch portfolio data. Please try again.';
                setError(errorMessage);

                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolioData();
    }, [navigate]);

    const formatCurrency = (amount) => {
        const formatted = new Intl.NumberFormat('th-TH', { 
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
        return `฿${formatted}`;
    };

    const calculateTotalValue = () => {
        return properties.reduce((total, property) => {
            const propertyValue = property.pricePerShare * property.Shares.amount;
            return total + propertyValue;
        }, 0);
    };

    if (loading) {
        return (
            <div className="portfolio-page">
                <NavBar />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your portfolio...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="portfolio-page">
                <NavBar />
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={() => window.location.reload()} className="retry-button">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="portfolio-page">
            <NavBar />
            <main className="portfolio-content">
                <div className="portfolio-header">
                    <Building2 size={48} color="white" />
                    <h1>My Property Portfolio</h1>
                    <p>Total Portfolio Value: {formatCurrency(calculateTotalValue())}</p>
                </div>

                {properties.length === 0 ? (
                    <div className="no-properties">
                        <h2>No Properties Found</h2>
                        <p>You currently don't own any properties. Start investing to build your portfolio!</p>
                        <button 
                            onClick={() => navigate('/property')} 
                            className="browse-properties-btn"
                        >
                            Browse Properties
                        </button>
                    </div>
                ) : (
                    <>
                        <GoogleMapsWrapper>
                            <PortfolioPropertyMap properties={properties} />
                        </GoogleMapsWrapper>
                        <div className="debug-info" style={{ display: 'none' }}>
                            {properties.map(p => (
                                <div key={p.id}>
                                    {p.propertyName}: {p.latitude}, {p.longitude}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default Portfolio;