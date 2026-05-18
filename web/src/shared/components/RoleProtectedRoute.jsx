import { Navigate } from "react-router-dom";

export default function RoleProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "ADMIN" || user.role === "STAFF") {
      return <Navigate to="/admindashboard" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return children;
}