import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import {
    MapPin,
    Percent,
    Share2,
    CircleDollarSign,
    Building2
} from 'lucide-react';

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css';
import '../Css/PortfolioPropertyMap.css';

const defaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

const PortfolioPropertyMap = ({ properties }) => {
    const [map, setMap] = useState(null);
    const navigate = useNavigate();

    console.log('Raw properties data:', properties);

    // Filter valid properties with coordinates
    const validProperties = properties.filter(property => {
        const lat = parseFloat(property.latitude);
        const lng = parseFloat(property.longitude);
        const isValid = !isNaN(lat) && !isNaN(lng) && 
                       lat >= -90 && lat <= 90 && 
                       lng >= -180 && lng <= 180;
        
        console.log(`Validating coordinates for ${property.propertyName}:`, {
            lat, lng, isValid
        });
        
        return isValid;
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const calculatePortfolioStats = () => {
        return properties.reduce((stats, property) => {
            const propertyValue = property.pricePerShare * property.Shares.amount;
            return {
                totalValue: stats.totalValue + propertyValue,
                totalShares: stats.totalShares + property.Shares.amount,
                propertyTypes: {
                    ...stats.propertyTypes,
                    [property.propertyType]: (stats.propertyTypes[property.propertyType] || 0) + 1
                }
            };
        }, { totalValue: 0, totalShares: 0, propertyTypes: {} });
    };

    // Set initial center to Bangkok
    const defaultCenter = [13.7563, 100.5018];

    // Fit bounds when properties change
    useEffect(() => {
        if (map && validProperties.length > 0) {
            const bounds = L.latLngBounds(
                validProperties.map(p => [
                    parseFloat(p.latitude),
                    parseFloat(p.longitude)
                ])
            );
            map.fitBounds(bounds);
        }
    }, [map, validProperties]);

    const portfolioStats = calculatePortfolioStats();

    return (
        <div className="portfolio-map-container">
            <div className="portfolio-map-header">
                <h2 className="portfolio-map-title">My Property Investments</h2>
                <div className="portfolio-map-stats-grid">
                    <div className="portfolio-map-stat-card">
                        <p className="portfolio-map-stat-label">Total Value</p>
                        <p className="portfolio-map-stat-value">
                            {formatCurrency(portfolioStats.totalValue)}
                        </p>
                    </div>
                    <div className="portfolio-map-stat-card">
                        <p className="portfolio-map-stat-label">Total Shares</p>
                        <p className="portfolio-map-stat-value">
                            {portfolioStats.totalShares}
                        </p>
                    </div>
                    <div className="portfolio-map-stat-card">
                        <p className="portfolio-map-stat-label">Properties</p>
                        <p className="portfolio-map-stat-value">
                            {validProperties.length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="portfolio-map-wrapper">
                <MapContainer
                    center={defaultCenter}
                    zoom={11}
                    style={{ height: '70vh', width: '100%', borderRadius: '12px' }}
                    whenCreated={setMap}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MarkerClusterGroup>
                        {validProperties.map(property => {
                            const lat = parseFloat(property.latitude);
                            const lng = parseFloat(property.longitude);
                            
                            console.log(`Creating marker for ${property.propertyName}:`, {
                                lat, lng
                            });

                            return (
                                <Marker
                                    key={property.id}
                                    position={[lat, lng]}
                                >
                                    <Popup>
                                        <div className="portfolio-map-info-window">
                                            <div className="portfolio-map-property-header">
                                                <Building2 size={18} />
                                                <span className="portfolio-map-property-type">
                                                    {property.propertyType}
                                                </span>
                                            </div>
                                            <h3 className="portfolio-map-property-name">
                                                {property.propertyName}
                                            </h3>
                                            
                                            <div className="portfolio-map-property-details">
                                                <div className="portfolio-map-detail-item">
                                                    <MapPin size={14} />
                                                    <span>
                                                        {property.district}, {property.province}
                                                    </span>
                                                </div>
                                                <div className="portfolio-map-detail-item">
                                                    <Share2 size={14} />
                                                    <span>
                                                        {property.Shares.amount} / {property.totalShares} shares
                                                    </span>
                                                </div>
                                                <div className="portfolio-map-detail-item">
                                                    <CircleDollarSign size={14} />
                                                    <span>
                                                        {formatCurrency(
                                                            property.pricePerShare * property.Shares.amount
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="portfolio-map-detail-item">
                                                    <Percent size={14} />
                                                    <span>{property.annualDividend}% annual dividend</span>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={() => navigate(`/property/${property.id}`)}
                                                className="portfolio-map-view-details-btn"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MarkerClusterGroup>
                </MapContainer>
            </div>
        </div>
    );
};

export default PortfolioPropertyMap;