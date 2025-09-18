import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");

  // If no token, go to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Else allow access
  return <Outlet />;
}
