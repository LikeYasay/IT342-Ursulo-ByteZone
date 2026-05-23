import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../auth/authService";

const CYAN = "#39d5ff";
const BORDER = "#1a1a1a";
const MUTED = "#8a8f98";

export default function UserNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const navLinks = [
    { label: "Home", path: "/dashboard" },
    { label: "Book", path: "/booking" },
    { label: "Order", path: "/order" },
    { label: "Transactions", path: "/transactions" },
  ];

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        height: "68px",
        background: "rgba(0,0,0,0.95)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${BORDER}`,
        position: "sticky",
        top: 0,
        zIndex: 200,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "20px",
          fontWeight: 900,
          letterSpacing: "2px",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            flexShrink: 0,
          }}
        >
          <img
            src="/ByteZoneLogo.png"
            alt="ByteZone Logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>
        <span style={{ color: "#fff" }}>Byte</span>
        <span style={{ color: CYAN }}>Zone</span>
      </div>

      <div style={{ display: "flex", gap: "6px" }}>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;

          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                padding: "8px 22px",
                background: isActive ? "rgba(57,213,255,0.14)" : "transparent",
                color: isActive ? CYAN : MUTED,
                fontWeight: 600,
                fontSize: "14px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              {link.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <span style={{ fontSize: "14px", color: "#fff", fontWeight: 500 }}>
          Welcome,{" "}
          <span style={{ color: CYAN, fontWeight: 700 }}>
            {user.fullName || "Player"}
          </span>
        </span>

        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${CYAN}, #0070a8)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            fontWeight: 800,
            color: "#000",
            border: `2px solid ${CYAN}`,
          }}
        >
          {(user.fullName || "P").charAt(0).toUpperCase()}
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 18px",
            background: "transparent",
            color: "#fff",
            fontWeight: 700,
            fontSize: "14px",
            borderRadius: "8px",
            border: `1px solid ${BORDER}`,
            cursor: "pointer",
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
