import { useNavigate } from "react-router-dom";

const CYAN = "#39d5ff";
const BORDER = "#1a1a1a";
const MUTED = "#8a8f98";

export default function PublicNavbar() {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 60px",
        height: "70px",
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${BORDER}`,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "22px",
          fontWeight: 800,
          letterSpacing: "2px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            background: `linear-gradient(135deg, ${CYAN}, #0070a8)`,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          ⚡
        </div>
        <span style={{ color: "#fff" }}>Byte</span>
        <span style={{ color: CYAN }}>Zone</span>
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {["About", "Games"].map((label) => (
          <button
            key={label}
            style={{
              padding: "8px 18px",
              color: MUTED,
              fontSize: "15px",
              fontWeight: 500,
              cursor: "pointer",
              borderRadius: "8px",
              background: "transparent",
              border: "none",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "8px 22px",
            background: "transparent",
            color: "#fff",
            fontWeight: 700,
            fontSize: "15px",
            borderRadius: "8px",
            border: `1px solid ${BORDER}`,
            cursor: "pointer",
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          Login
        </button>

        <button
          onClick={() => navigate("/register")}
          style={{
            padding: "8px 22px",
            background: CYAN,
            color: "#000",
            fontWeight: 700,
            fontSize: "15px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          Join Now
        </button>
      </div>
    </nav>
  );
}