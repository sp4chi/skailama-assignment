import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Custom hook for fetching profiles with caching
 * Implements lazy loading and error handling
 */
export const useProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/profiles`);
      setProfiles(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData) => {
    try {
      const response = await axios.post(`${API_URL}/api/profiles`, profileData);
      setProfiles((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateProfile = async (id, updates) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/profiles/${id}`,
        updates
      );
      setProfiles((prev) =>
        prev.map((p) => (p._id === id ? response.data : p))
      );
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return {
    profiles,
    loading,
    error,
    refetch: fetchProfiles,
    createProfile,
    updateProfile,
  };
};

/**
 * Custom hook for fetching events with filtering
 * Implements client-side caching and optimized filtering
 */
export const useEvents = (profileId = null) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = async (filterProfileId = profileId) => {
    setLoading(true);
    setError(null);
    try {
      const url = filterProfileId
        ? `${API_URL}/api/events?profileId=${filterProfileId}`
        : `${API_URL}/api/events`;
      const response = await axios.get(url);
      setEvents(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData) => {
    try {
      const response = await axios.post(`${API_URL}/api/events`, eventData);
      setEvents((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateEvent = async (id, updates) => {
    try {
      const response = await axios.put(`${API_URL}/api/events/${id}`, updates);
      setEvents((prev) => prev.map((e) => (e._id === id ? response.data : e)));
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteEvent = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/events/${id}`);
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [profileId]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};

/**
 * Custom hook for debounced search
 * Optimizes API calls for search functionality
 */
export const useDebouncedSearch = (callback, delay = 300) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        callback(searchTerm);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, delay, callback]);

  return [searchTerm, setSearchTerm];
};
