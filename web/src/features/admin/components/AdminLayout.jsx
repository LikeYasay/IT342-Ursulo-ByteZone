import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../../auth/authService";
import NotificationBell from "../../notifications/NotificationBell.jsx";

const CYAN = "#39d5ff";
const DARK_BG = "#000000";
const CARD_BG = "#1c1c1c";
const MUTED = "#8a8f98";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "⊞", path: "/admindashboard" },
  { label: "User Management", icon: "👥", path: "/admin/usermanagement" },
  { label: "Reservations", icon: "📅", path: "/admin/reservations" },
  { label: "Announcements", icon: "📢", path: "/admin/announcements" },
  { label: "Extending Time", icon: "⏱️", path: "/admin/extendinghours" },
  { label: "Snacks", icon: "🍔", path: "/admin/snacks" },
  { label: "Orders", icon: "🛒", path: "/admin/orders" },
  { label: "Transaction History", icon: "💳", path: "/admin/transactionhistory" },
  { label: "Pending Payments", icon: "⏳", path: "/admin/pendingpayments" },
];

function SidebarItem({ item, activePath, hoveredItem, setHoveredItem, onClick }) {
  const isActive = activePath === item.path;
  const isHovered = hoveredItem === item.label;

  return (
    <button
      onClick={() => onClick(item.path)}
      onMouseEnter={() => setHoveredItem(item.label)}
      onMouseLeave={() => setHoveredItem(null)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "11px 14px",
        borderRadius: "10px",
        background: isActive
          ? "rgba(57,213,255,0.12)"
          : isHovered
            ? "rgba(255,255,255,0.04)"
            : "transparent",
        border: `1px solid ${isActive ? "rgba(57,213,255,0.3)" : "transparent"}`,
        color: isActive ? CYAN : isHovered ? "#fff" : MUTED,
        fontWeight: isActive ? 700 : 500,
        fontSize: "13px",
        cursor: "pointer",
        fontFamily: "'Montserrat', sans-serif",
        transition: "all 0.18s",
        textAlign: "left",
        marginBottom: "4px",
      }}
    >
      <span style={{ fontSize: "17px", flexShrink: 0 }}>{item.icon}</span>
      <span>{item.label}</span>

      {isActive && (
        <div
          style={{
            marginLeft: "auto",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: CYAN,
            flexShrink: 0,
          }}
        />
      )}
    </button>
  );
}

export default function AdminLayout({ title, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarHover, setSidebarHover] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${DARK_BG}; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: rgba(57,213,255,0.3); border-radius: 3px; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .content-in { animation: fadeIn 0.4s ease both; }
      `}</style>

      <div
        style={{
          fontFamily: "'Montserrat', sans-serif",
          background: DARK_BG,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          color: "#fff",
        }}
      >
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
            height: "64px",
            background: "#0d0d0d",
            borderBottom: "1px solid #1a1a1a",
            position: "sticky",
            top: 0,
            zIndex: 200,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                background: `linear-gradient(135deg, ${CYAN}, #0070a8)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              ⚡
            </div>

            <span
              style={{
                fontSize: "17px",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Admin Dashboard
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <NotificationBell />

            <span style={{ fontSize: "14px", color: "#fff", fontWeight: 500 }}>
              Welcome,{" "}
              <span style={{ color: CYAN, fontWeight: 700 }}>
                {user.fullName || "Admin"}
              </span>
            </span>

            <button
              onClick={handleLogout}
              style={{
                padding: "8px 20px",
                background: MUTED,
                color: "#fff",
                fontWeight: 600,
                fontSize: "13px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Logout
            </button>
          </div>
        </nav>

        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          <aside
            style={{
              width: "240px",
              background: "#0d0d0d",
              borderRight: "1px solid #1a1a1a",
              padding: "20px 14px",
              position: "sticky",
              top: "64px",
              height: "calc(100vh - 64px)",
            }}
          >
            {NAV_ITEMS.map((item) => (
              <SidebarItem
                key={item.path}
                item={item}
                activePath={location.pathname}
                hoveredItem={sidebarHover}
                setHoveredItem={setSidebarHover}
                onClick={navigate}
              />
            ))}
          </aside>

          <main
            className="content-in"
            style={{
              flex: 1,
              padding: "28px 32px 40px",
              overflowX: "auto",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: 900,
                  color: "#fff",
                }}
              >
                {title}
              </h1>
              <p style={{ color: MUTED, fontSize: "14px", marginTop: "6px" }}>
                Manage ByteZone operations and staff/admin features.
              </p>
            </div>

            <div
              style={{
                background: CARD_BG,
                border: `1px solid ${CYAN}`,
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}