import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../auth/authService";
import { getMyActiveSession } from "../sessions/sessionService";

const CYAN = "#39d5ff";
const DARK_BG = "#000000";
const CARD_BG = "#1c1c1c";
const INNER_CARD = "#333";
const MUTED = "#8a8f98";

export default function UserProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const [userRes, sessionRes] = await Promise.all([
        getCurrentUser(),
        getMyActiveSession(),
      ]);

      setUser(userRes.data);
      setActiveSession(sessionRes.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const displayName = user?.fullName || "Player";
  const displayInitial = displayName.charAt(0).toUpperCase();

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${DARK_BG}; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: DARK_BG,
          color: "#fff",
          fontFamily: "'Montserrat', sans-serif",
          padding: "32px",
        }}
      >
        <div
          style={{
            maxWidth: "980px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "center",
              marginBottom: "22px",
            }}
          >
            <div>
              <h1 style={{ color: "#fff", fontSize: "32px", fontWeight: 900 }}>
                My <span style={{ color: CYAN }}>Profile</span>
              </h1>
              <p style={{ color: MUTED, marginTop: "6px", fontSize: "14px" }}>
                View your account information and current session summary.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => navigate("/dashboard")} style={buttonStyle}>
                Dashboard
              </button>

              <button onClick={handleLogout} style={secondaryButtonStyle}>
                Logout
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                color: "#ff9b9b",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "12px",
                padding: "14px",
                marginBottom: "18px",
                fontWeight: 700,
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <p style={{ color: MUTED }}>Loading profile...</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "320px 1fr",
                gap: "20px",
                alignItems: "start",
              }}
            >
              <div
                style={{
                  background: CARD_BG,
                  border: `1px solid ${CYAN}`,
                  borderRadius: "20px",
                  padding: "28px 24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "96px",
                    height: "96px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${CYAN}, #0070a8)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "38px",
                    fontWeight: 900,
                    color: "#000",
                    margin: "0 auto 16px",
                    border: `3px solid ${CYAN}`,
                    boxShadow: "0 0 24px rgba(57,213,255,0.35)",
                  }}
                >
                  {displayInitial}
                </div>

                <h2 style={{ fontSize: "22px", fontWeight: 900 }}>
                  {displayName}
                </h2>

                <p style={{ color: CYAN, fontWeight: 700, marginTop: "6px" }}>
                  {user?.role || "USER"}
                </p>

                <div
                  style={{
                    marginTop: "22px",
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  <button
                    onClick={() => navigate("/transactions")}
                    style={buttonStyle}
                  >
                    View Transactions
                  </button>

                  <button onClick={() => navigate("/booking")} style={outlineButtonStyle}>
                    Book Station
                  </button>

                  <button onClick={() => navigate("/order")} style={outlineButtonStyle}>
                    Order Snacks
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gap: "18px" }}>
                <div style={panelStyle}>
                  <h3 style={panelTitleStyle}>Account Information</h3>

                  <InfoRow label="Full Name" value={user?.fullName || "N/A"} />
                  <InfoRow label="Email" value={user?.email || "N/A"} />
                  <InfoRow label="Role" value={user?.role || "USER"} />
                  <InfoRow label="Member Since" value={memberSince} />
                  <InfoRow
                    label="Tournament Wins"
                    value={user?.tournamentWins ?? 0}
                  />
                </div>

                <div style={panelStyle}>
                  <h3 style={panelTitleStyle}>Current Session</h3>

                  {activeSession ? (
                    <>
                      <InfoRow
                        label="Status"
                        value={activeSession.status || "ACTIVE"}
                      />
                      <InfoRow
                        label="Station"
                        value={
                          activeSession.station?.stationNo ||
                          `Station ${activeSession.station?.id || "N/A"}`
                        }
                      />
                      <InfoRow
                        label="Start Time"
                        value={
                          activeSession.startTime
                            ? new Date(activeSession.startTime).toLocaleString()
                            : "N/A"
                        }
                      />
                      <InfoRow
                        label="End Time"
                        value={
                          activeSession.endTime
                            ? new Date(activeSession.endTime).toLocaleString()
                            : "N/A"
                        }
                      />
                    </>
                  ) : (
                    <p style={{ color: MUTED, fontSize: "14px" }}>
                      You do not have an active session right now.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "18px",
        padding: "12px 0",
        borderBottom: "1px solid #2a2a2a",
        fontSize: "14px",
      }}
    >
      <span style={{ color: MUTED, fontWeight: 600 }}>{label}</span>
      <span style={{ color: "#fff", fontWeight: 800, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

const panelStyle = {
  background: CARD_BG,
  border: `1px solid ${CYAN}`,
  borderRadius: "20px",
  padding: "22px 24px",
};

const panelTitleStyle = {
  color: CYAN,
  fontSize: "18px",
  fontWeight: 900,
  marginBottom: "12px",
};

const buttonStyle = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "none",
  background: CYAN,
  color: "#000",
  fontWeight: 900,
  cursor: "pointer",
  fontFamily: "'Montserrat', sans-serif",
};

const secondaryButtonStyle = {
  ...buttonStyle,
  background: MUTED,
  color: "#fff",
};

const outlineButtonStyle = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: `1px solid ${CYAN}`,
  background: INNER_CARD,
  color: CYAN,
  fontWeight: 900,
  cursor: "pointer",
  fontFamily: "'Montserrat', sans-serif",
};