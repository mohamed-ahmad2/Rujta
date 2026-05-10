import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent
       rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/auth" replace />;

  if (roles && roles.length > 0 && !roles.includes(user.role))
    return <Navigate to="/" replace />;

  return children ?? <Outlet />;
};

export default ProtectedRoute;