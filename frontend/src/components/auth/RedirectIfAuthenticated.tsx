import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getDashboardPath } from "../../utils/auth";

const RedirectIfAuthenticated = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return <>{children}</>;
};

export default RedirectIfAuthenticated;
