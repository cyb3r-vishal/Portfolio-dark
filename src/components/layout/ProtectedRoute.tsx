import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

// Simple single-admin guard. For multi-admin/role-based, extend this.
export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return null; // could show a spinner here
  if (!user) return <Navigate to="/admin/login" replace />;

  return <Outlet />;
}