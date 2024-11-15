import React from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { Loader } from 'lucide-react';

const GoogleMapsWrapper = ({ children }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyCBHYlYm0PdIVog1O09m79OdW4nJh_27T8',
  });

  if (loadError) {
    return (
      <div className="map-error">
        <p>Error loading maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="map-loading">
        <Loader className="spin" size={32} />
        <p>Loading map...</p>
      </div>
    );
  }

  return children;
};

export default GoogleMapsWrapper;