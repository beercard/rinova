import { useState, useEffect, useCallback } from 'react';

// Singleton promise to ensure script is loaded only once
let googleMapsPromise = null;

const loadGoogleMapsScript = (apiKey) => {
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      resolve(window.google.maps);
    };
    
    script.onerror = (err) => {
      reject(err);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      const error = new Error("Google Maps API Key is missing in environment variables.");
      console.error(error.message);
      setLoadError(error);
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then(() => setIsLoaded(true))
      .catch((err) => {
        console.error("Failed to load Google Maps script:", err);
        setLoadError(err);
      });
  }, [apiKey]);

  const geocodeAddress = useCallback(async (address) => {
    if (!window.google || !window.google.maps) {
      throw new Error("Google Maps API not loaded yet");
    }

    const geocoder = new window.google.maps.Geocoder();
    
    try {
      const response = await geocoder.geocode({ address });
      
      if (!response.results || response.results.length === 0) {
        throw new Error("No results found for this address");
      }

      const result = response.results[0];
      const { lat, lng } = result.geometry.location;

      return {
        latitude: lat(),
        longitude: lng(),
        formattedAddress: result.formatted_address,
        placeId: result.place_id
      };
    } catch (error) {
      console.error("Geocoding error:", error);
      throw error;
    }
  }, []);

  return { isLoaded, loadError, geocodeAddress };
};