import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../../features/auth/authService";
import { getRedirectPathByRole } from "../../features/auth/authRedirect";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

export default function RoleProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const [checking, setChecking] = useState(Boolean(token));
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [authFailed, setAuthFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function refreshCurrentUser() {
      if (!token) {
        setChecking(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        const freshUser = response.data;

        if (!isMounted) return;

        localStorage.setItem("user", JSON.stringify(freshUser));
        setCurrentUser(freshUser);
      } catch {
        if (!isMounted) return;

        logoutUser();
        setAuthFailed(true);
      } finally {
        if (isMounted) {
          setChecking(false);
        }
      }
    }

    refreshCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [token, location.pathname]);

  if (!token || authFailed) {
    return <Navigate to="/login" replace />;
  }

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          color: "#39d5ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 800,
        }}
      >
        Loading ByteZone...
      </div>
    );
  }

  const role = currentUser?.role;

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getRedirectPathByRole(role)} replace />;
  }

  return children;
}