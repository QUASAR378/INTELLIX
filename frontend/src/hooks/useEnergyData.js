import { useState, useEffect } from 'react';
import { countiesAPI } from '../services/api';

export const useEnergyData = () => {
  const [counties, setCounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCounties = async () => {
      try {
        setLoading(true);
        const response = await countiesAPI.getAll();
        const data = response.data || [];
        setCounties(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to load county data');
        console.error('Error fetching counties:', err);
        setCounties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCounties();
  }, []);

  return { counties, loading, error };
};

export const useMapData = () => {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/kenya-counties.geojson');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGeoData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching map data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, []);

  return { geoData, loading, error };
};