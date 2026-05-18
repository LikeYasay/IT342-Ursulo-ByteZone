import { useNavigate } from "react-router-dom";
import { logoutUser } from "../auth/authService";

const CYAN = "#39d5ff";
const DARK_BG = "#000000";
const CARD_BG = "#1c1c1c";
const MUTED = "#8a8f98";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: DARK_BG,
        color: "#fff",
        fontFamily: "'Montserrat', sans-serif",
        padding: "40px",
      }}
    >
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${CYAN}`,
          borderRadius: "16px",
          padding: "28px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ color: CYAN, marginBottom: "10px" }}>
          Admin / Staff Dashboard
        </h1>

        <p style={{ color: MUTED, marginBottom: "20px" }}>
          Welcome, {user.fullName || "Staff"}.
        </p>

        <p style={{ marginBottom: "8px" }}>
          Role: <strong>{user.role || "N/A"}</strong>
        </p>

        <p style={{ color: MUTED, marginBottom: "28px" }}>
          This is the admin/staff route foundation. We will replace this with the full admin UI after routing is stable.
        </p>

        <button
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            background: CYAN,
            color: "#000",
            border: "none",
            borderRadius: "8px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}