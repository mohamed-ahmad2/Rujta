import { useEffect, useState } from "react";
import { login, registerUser, logout, getCurrentUser } from "../api/authApi";
import jwt_decode from "jwt-decode";
import { apiClient } from "../../../shared/api/apiClient";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenExp, setTokenExp] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUser({
            email: userData.Email,
            role: userData.Role,
          });
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleLogin = async (email, password) => {
    const response = await login({ email, password });

    if (response.accessToken) {
      const decoded = jwt_decode(response.accessToken);
      const role =
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] || "User";
      setUser({
        email: decoded.email,
        role,
      });
      setTokenExp(decoded.exp * 1000);
    }

    return response;
  };

  const handleRegister = async (dto) => {
    const response = await registerUser(dto);
    const accessToken = response.tokens?.accessToken;

    if (accessToken) {
      const decoded = jwt_decode(accessToken);
      const role =
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] || "User";
      setUser({
        email: decoded.email,
        role,
      });
      setTokenExp(decoded.exp * 1000);
    }

    return response;
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setTokenExp(null);
  };

  const refreshToken = async () => {
    try {
      const response = await apiClient.post("/auth/refresh-token", null, {
        withCredentials: true,
      });
      if (response.data.accessToken) {
        const decoded = jwt_decode(response.data.accessToken);
        setTokenExp(decoded.exp * 1000);
      }
    } catch (err) {
      console.error("Proactive refresh failed", err);
    }
  };

  useEffect(() => {
    if (!tokenExp || !user) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (tokenExp - now < 5 * 60 * 1000) refreshToken();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [tokenExp, user]);

  return {
    user,
    loading,
    handleLogin,
    handleRegister,
    handleLogout,
  };
};
