import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  login,
  registerUser,
  registerStaff,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  socialLogin,
  changePassword,
} from "../api/authApi";

import apiClient from "../../../shared/api/apiClient";
import { setAccessToken, removeAccessToken } from "../../../authProvider/authTokenProvider";
import { jwtDecode } from "jwt-decode";

/* ================= Context ================= */

export const AuthContext = createContext(null);

/* ================= Helpers ================= */

const applyToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

/* ================= Provider ================= */

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenExp, setTokenExp] = useState(null);

  /* ================= Init ================= */
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          applyToken(token);
          const decoded = decodeToken(token);

          if (decoded?.exp) {
            setTokenExp(decoded.exp * 1000);
          }
        }

        const userData = await getCurrentUser();

        if (userData) {
          setUser({
            email: userData.email,
            role: userData.role,
            isFirstLogin: userData.isFirstLogin ?? false,
          });
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /* ================= Login ================= */
  const handleLogin = async (email, password) => {
    const res = await login({ email, password });

    const token = res.accessToken;
    const decoded = decodeToken(token);

    const newUser = {
      email: res.email,
      role: res.role,
      isFirstLogin: res.isFirstLogin ?? false,
    };

    setUser(newUser);

    if (token) {
      localStorage.setItem("token", token);
      setAccessToken(token);
      applyToken(token);

      if (decoded?.exp) setTokenExp(decoded.exp * 1000);
    }

    return newUser;
  };

  /* ================= Register ================= */
  const handleRegister = async (dto) => {
    await registerUser(dto);

    const res = await login({
      email: dto.email,
      password: dto.createPassword,
    });

    const token = res.accessToken;
    const decoded = decodeToken(token);

    const newUser = {
      email: res.email,
      role: res.role ?? "User",
      isFirstLogin: res.isFirstLogin ?? false,
    };

    setUser(newUser);

    if (token) {
      localStorage.setItem("token", token);
      setAccessToken(token);
      applyToken(token);

      if (decoded?.exp) setTokenExp(decoded.exp * 1000);
    }

    return newUser;
  };

  /* ================= Staff ================= */
  const handleRegisterStaff = async (dto) => {
    return await registerStaff(dto);
  };

  /* ================= Logout ================= */
  const handleLogout = useCallback(async () => {
    try {
      setUser(null);
      setTokenExp(null);

      await logout();

      localStorage.removeItem("token");
      await removeAccessToken();
      applyToken(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, []);

  /* ================= Social ================= */
  const handleGoogleLogin = useCallback(async (IdToken) => {
    const res = await socialLogin({ IdToken });

    const token = res.accessToken;
    const decoded = decodeToken(token);

    const newUser = {
      email: res.email,
      role: res.role,
      isFirstLogin: res.isFirstLogin ?? false,
    };

    setUser(newUser);

    if (token) {
      localStorage.setItem("token", token);
      setAccessToken(token);
      applyToken(token);

      if (decoded?.exp) setTokenExp(decoded.exp * 1000);
    }

    return res;
  }, []);

  /* ================= Refresh ================= */
  const refreshToken = useCallback(async () => {
    try {
      const res = await apiClient.post("/auth/refresh-token", null, {
        withCredentials: true,
      });

      const token = res.data?.accessToken;

      if (token) {
        localStorage.setItem("token", token);
        setAccessToken(token);
        applyToken(token);

        const decoded = decodeToken(token);
        if (decoded?.exp) setTokenExp(decoded.exp * 1000);
      }
    } catch (err) {
      console.error("Refresh failed:", err);
      handleLogout();
    }
  }, [handleLogout]);

  /* ================= Auto refresh ================= */
  useEffect(() => {
    if (!tokenExp || !user) return;

    const interval = setInterval(() => {
      if (tokenExp - Date.now() < 3 * 60 * 1000) {
        refreshToken();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [tokenExp, user, refreshToken]);

  /* ================= Password ================= */
  const handleForgotPassword = (email) => forgotPassword(email);

  const handleResetPassword = (dto) => resetPassword(dto);

  const handleChangePassword = async (dto) => {
    const res = await changePassword(dto);

    setUser((prev) => ({
      ...prev,
      isFirstLogin: false,
    }));

    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        handleLogin,
        handleRegister,
        handleLogout,
        handleGoogleLogin,
        handleRegisterStaff,
        handleForgotPassword,
        handleResetPassword,
        handleChangePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};