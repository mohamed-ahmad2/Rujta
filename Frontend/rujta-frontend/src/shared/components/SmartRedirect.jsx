// src/shared/components/SmartRedirect.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

const SmartRedirect = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (user) {
      const role = user.role || "User";

      if (role === "SuperAdmin") {
        navigate("/superadmin", { replace: true });
      } else if (role === "PharmacyAdmin" || role === "Pharmacist") {
        navigate("/dashboard", { replace: true });
      } else if (role === "User") {
        navigate("/user/", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return children;
  }

  return null;
};

export default SmartRedirect;
