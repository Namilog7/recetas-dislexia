import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/auth";

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="page-loading">Cargando...</p>;
  }

  if (!token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
