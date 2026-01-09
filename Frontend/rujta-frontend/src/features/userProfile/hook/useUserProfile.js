// src/features/user/hook/useUserProfile.js
import { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "../api/userProfileApi";
export const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserProfile();
      setProfile(response.data);
    } catch (err) {
      setError(err.response?.data || err.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };
  const updateProfile = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateUserProfile(data);
      await fetchProfile();
      return response.data;
    } catch (err) {
      setError(err.response?.data || err.message || "Failed to update profile");
      return null;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProfile();
  }, []);
  return { profile, loading, error, fetchProfile, updateProfile };
};