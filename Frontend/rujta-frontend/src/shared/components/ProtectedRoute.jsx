// src/shared/components/ProtectedRoute.jsx
import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser } from "../../features/auth/api/authApi";

const ProtectedRoute = ({ children, roles }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(data => setUser(data))
      .catch(()  => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/auth" replace />;

  if (roles && roles.length > 0 && !roles.includes(user.role))
    return <Navigate to="/" replace />;

  return children ?? <Outlet />;
};

export default ProtectedRoute;