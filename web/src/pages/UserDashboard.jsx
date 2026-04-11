import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../services/authService";
import { getMyReservations } from "../services/bookingService";
import { getMyOrders } from "../services/orderService";
import { getMyPayments } from "../services/paymentService";

const CYAN = "#39d5ff";
const DARK_BG = "#000000";
const CARD_BG = "#1c1c1c";
const BORDER = "#39d5ff";
const INNER_CARD = "#333";
const MUTED = "#8a8f98";

const GAMES = [
  { name: "Valorant", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop" },
  { name: "League of Legends", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop" },
  { name: "Counter-Strike: Global Offensive (CS:GO)", image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop" },
  { name: "Apex Legends", image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=1200&auto=format&fit=crop" },
  { name: "Fortnite", image: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=1200&auto=format&fit=crop" },
  { name: "Dota 2", image: "https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=1200&auto=format&fit=crop" },
];

function StatCard({ label, value, small }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        background: INNER_CARD,
        borderRadius: "12px",
        padding: small ? "12px 10px" : "14px 12px",
        textAlign: "center",
        border: `1px solid ${hovered ? CYAN : "transparent"}`,
        transition: "border-color 0.2s, transform 0.2s",
        transform: hovered ? "translateY(-2px)" : "none",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "#aaa",
          marginBottom: "6px",
          fontWeight: 500,
          letterSpacing: "0.3px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: small ? "20px" : "28px",
          fontWeight: 800,
          color: CYAN,
          fontFamily: "'Montserrat', sans-serif",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SectionCard({ title, accentWord, children, style }) {
  return (
    <div
      style={{
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: "20px",
        padding: "22px 24px",
        ...style,
      }}
    >
      <h2
        style={{
          fontSize: "20px",
          fontWeight: 800,
          marginBottom: "18px",
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        <span style={{ color: "#fff" }}>{title} </span>
        <span style={{ color: CYAN }}>{accentWord}</span>
      </h2>
      {children}
    </div>
  );
}

function QuickActionBtn({ label, icon, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        padding: "14px 20px",
        background: hovered ? "rgba(57,213,255,0.12)" : INNER_CARD,
        border: `1px solid ${hovered ? CYAN : "#444"}`,
        borderRadius: "10px",
        color: "#fff",
        fontSize: "14px",
        fontWeight: 600,
        fontFamily: "'Montserrat', sans-serif",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        transform: hovered ? "translateY(-1px)" : "none",
      }}
    >
      {icon} {label}
    </button>
  );
}

function formatCountdown(targetTime) {
  if (!targetTime) return "00:00:00";

  const diff = new Date(targetTime).getTime() - Date.now();
  const secs = Math.max(0, Math.floor(diff / 1000));
  const h = String(Math.floor(secs / 3600)).padStart(2, "0");
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function UserDashboard() {
  const navigate = useNavigate();

  const [activeNav, setActiveNav] = useState("Home");
  const [gameIdx, setGameIdx] = useState(0);
  const [hoveredUpdate, setHoveredUpdate] = useState(null);

  const [user, setUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");
  const [remainingTime, setRemainingTime] = useState("00:00:00");
  const [reservationTime, setReservationTime] = useState("00:00:00");

  const visibleGames = 4;
  const canPrev = gameIdx > 0;
  const canNext = gameIdx + visibleGames < GAMES.length;

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const latestReservation = reservations[0];
      setReservationTime(
        latestReservation
          ? formatCountdown(
              new Date(`${latestReservation.date}T${latestReservation.startTime}`).toISOString(),
            )
          : "00:00:00",
      );
      setRemainingTime("00:15:00");
    }, 1000);

    return () => clearInterval(timer);
  }, [reservations]);

  async function loadDashboard() {
    try {
      setError("");
      const [userRes, reservationRes, orderRes, paymentRes] = await Promise.all([
        getCurrentUser(),
        getMyReservations(),
        getMyOrders(),
        getMyPayments(),
      ]);

      setUser(userRes.data);
      setReservations(reservationRes.data || []);
      setOrders(orderRes.data || []);
      setPayments(paymentRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard.");
    }
  }

  const handleNav = (label) => {
    setActiveNav(label);
    if (label === "Home") navigate("/dashboard");
    if (label === "Book") navigate("/booking");
    if (label === "Order") navigate("/order");
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const pendingPayments = payments.filter((p) => p.status === "PENDING").length;
  const latestReservation = reservations[0];
  const latestOrder = orders[0];
  const latestPayment = payments[0];

  const updates = useMemo(() => {
    const list = [];

    if (latestReservation) {
      list.push({
        title: "Latest Reservation",
        time: latestReservation.date,
        detail: `${latestReservation.station?.stationNo || latestReservation.station?.id} • ${latestReservation.status}`,
      });
    }

    if (latestOrder) {
      list.push({
        title: "Latest Order",
        time: `Order #${latestOrder.id}`,
        detail: `${latestOrder.status} • ₱${Number(latestOrder.total).toFixed(2)}`,
      });
    }

    if (latestPayment) {
      list.push({
        title: "Latest Payment",
        time: latestPayment.type,
        detail: `${latestPayment.status} • ₱${Number(latestPayment.amount).toFixed(2)}`,
      });
    }

    if (list.length === 0) {
      list.push({
        title: "No updates yet",
        time: "—",
        detail: "Your activity will appear here.",
      });
    }

    return list;
  }, [latestOrder, latestPayment, latestReservation]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: ${DARK_BG};
        }

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #000;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(57,213,255,0.3);
          border-radius: 3px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes pulse {
          0%,100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }

        .dash-section {
          animation: fadeIn 0.5s ease both;
        }

        .dash-section:nth-child(1) { animation-delay: 0.05s; }
        .dash-section:nth-child(2) { animation-delay: 0.1s; }
        .dash-section:nth-child(3) { animation-delay: 0.15s; }
        .dash-section:nth-child(4) { animation-delay: 0.2s; }
        .dash-section:nth-child(5) { animation-delay: 0.25s; }
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
            padding: "0 40px",
            height: "68px",
            background: "rgba(0,0,0,0.95)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid #1a1a1a",
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
              fontSize: "20px",
              fontWeight: 900,
              letterSpacing: "2px",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                background: `linear-gradient(135deg, ${CYAN}, #0070a8)`,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              ⚡
            </div>
            <span style={{ color: "#fff" }}>Byte</span>
            <span style={{ color: CYAN }}>Zone</span>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {["Home", "Book", "Order"].map((link) => (
              <button
                key={link}
                onClick={() => handleNav(link)}
                style={{
                  padding: "8px 22px",
                  background: activeNav === link ? CYAN : "transparent",
                  color: activeNav === link ? "#000" : "#fff",
                  fontWeight: activeNav === link ? 700 : 500,
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Montserrat', sans-serif",
                  transition: "all 0.2s",
                }}
              >
                {link}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "14px", color: "#fff", fontWeight: 500 }}>
              Welcome, <span style={{ color: CYAN, fontWeight: 700 }}>{user?.fullName || "Player"}</span>
            </span>

            <div style={{ position: "relative", cursor: "pointer" }}>
              <span style={{ fontSize: "20px" }}>🔔</span>
              <div
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: CYAN,
                  animation: "pulse 2s infinite",
                }}
              />
            </div>

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
              {(user?.fullName || "L").charAt(0).toUpperCase()}
            </div>

            <button
              onClick={handleLogout}
              style={{
                padding: "8px 20px",
                background: MUTED,
                color: "#fff",
                fontWeight: 600,
                fontSize: "14px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Montserrat', sans-serif",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#666";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = MUTED;
              }}
            >
              Logout
            </button>
          </div>
        </nav>

        <main
          style={{
            flex: 1,
            padding: "30px 40px 40px",
            display: "flex",
            gap: "24px",
            alignItems: "flex-start",
            maxWidth: "1280px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              minWidth: 0,
            }}
          >
            {error && (
              <div
                style={{
                  background: "rgba(255,0,0,0.10)",
                  border: "1px solid rgba(255,0,0,0.25)",
                  borderRadius: "12px",
                  padding: "14px 24px",
                  color: "#ff9b9b",
                  fontWeight: 600,
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <div className="dash-section">
              <SectionCard title="Like's" accentWord="Status">
                <div style={{ display: "flex", gap: "12px" }}>
                  <StatCard label="Total Reservations" value={reservations.length} />
                  <StatCard label="Tournament Won" value={user?.tournamentWins ?? 0} />
                  <StatCard label="Last Played" value={latestOrder ? "Recent" : "N/A"} />
                  <StatCard label="Favorite Game" value="N/A" />
                </div>
              </SectionCard>
            </div>

            <div className="dash-section">
              <SectionCard title="Current" accentWord="Session">
                <div style={{ display: "flex", gap: "12px" }}>
                  <StatCard label="Remaining Time" value={remainingTime} />
                  <StatCard label="Current Game" value="Valorant" />
                  <StatCard
                    label="Station"
                    value={
                      latestReservation?.station?.stationNo ||
                      latestOrder?.station?.stationNo ||
                      "S4"
                    }
                  />
                </div>
              </SectionCard>
            </div>

            <div className="dash-section">
              <SectionCard title="Extend" accentWord="Playtime">
                <button
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: CYAN,
                    color: "#000",
                    fontWeight: 800,
                    fontSize: "15px",
                    letterSpacing: "0.5px",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontFamily: "'Montserrat', sans-serif",
                    transition: "all 0.2s",
                    boxShadow: `0 0 24px rgba(57,213,255,0.3)`,
                  }}
                  onClick={() => navigate("/order")}
                >
                  Extend Playtime
                </button>
              </SectionCard>
            </div>

            <div className="dash-section">
              <SectionCard title="Available" accentWord="Games">
                <div style={{ position: "relative" }}>
                  {canPrev && (
                    <button
                      onClick={() => setGameIdx((g) => g - 1)}
                      style={carouselButton("left")}
                    >
                      ‹
                    </button>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                    {GAMES.slice(gameIdx, gameIdx + visibleGames).map((game) => (
                      <div
                        key={game.name}
                        style={{
                          background: INNER_CARD,
                          borderRadius: "14px",
                          overflow: "hidden",
                          border: "1px solid #444",
                        }}
                      >
                        <img
                          src={game.image}
                          alt={game.name}
                          style={{ width: "100%", height: "120px", objectFit: "cover" }}
                        />
                        <div style={{ padding: "12px" }}>
                          <div style={{ fontSize: "13px", fontWeight: 700 }}>{game.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {canNext && (
                    <button
                      onClick={() => setGameIdx((g) => g + 1)}
                      style={carouselButton("right")}
                    >
                      ›
                    </button>
                  )}
                </div>
              </SectionCard>
            </div>
          </div>

          <div
            style={{
              width: "340px",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div className="dash-section">
              <SectionCard title="Quick" accentWord="Actions">
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <QuickActionBtn label="Book a Station" icon="🖥️" onClick={() => navigate("/booking")} />
                  <QuickActionBtn label="Order Snacks" icon="🍔" onClick={() => navigate("/order")} />
                  <QuickActionBtn label="Pending Payments" icon="💳" onClick={() => navigate("/order")} />
                </div>
              </SectionCard>
            </div>

            <div className="dash-section">
              <SectionCard title="Reservation" accentWord="Timer">
                <div style={{ display: "flex", gap: "12px" }}>
                  <StatCard label="Starts In" value={reservationTime} small />
                  <StatCard
                    label="Status"
                    value={latestReservation?.status || "N/A"}
                    small
                  />
                </div>
              </SectionCard>
            </div>

            <div className="dash-section">
              <SectionCard title="Recent" accentWord="Updates">
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {updates.map((update, index) => (
                    <div
                      key={`${update.title}-${index}`}
                      onMouseEnter={() => setHoveredUpdate(index)}
                      onMouseLeave={() => setHoveredUpdate(null)}
                      style={{
                        background: hoveredUpdate === index ? "rgba(57,213,255,0.08)" : INNER_CARD,
                        border: `1px solid ${hoveredUpdate === index ? CYAN : "#444"}`,
                        borderRadius: "12px",
                        padding: "14px",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: "6px" }}>{update.title}</div>
                      <div style={{ color: CYAN, fontSize: "12px", marginBottom: "6px" }}>
                        {update.time}
                      </div>
                      <div style={{ color: MUTED, fontSize: "13px", lineHeight: 1.5 }}>
                        {update.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <div className="dash-section">
              <SectionCard title="Account" accentWord="Info">
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                  <div><span style={{ color: MUTED }}>Email:</span> {user?.email || "—"}</div>
                  <div><span style={{ color: MUTED }}>Pending Payments:</span> {pendingPayments}</div>
                  <div><span style={{ color: MUTED }}>Latest Order:</span> {latestOrder ? `#${latestOrder.id}` : "—"}</div>
                </div>
              </SectionCard>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function carouselButton(side) {
  return {
    position: "absolute",
    [side]: "-14px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: CYAN,
    border: "none",
    color: "#000",
    fontSize: "18px",
    fontWeight: 900,
    cursor: "pointer",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 14px rgba(57,213,255,0.4)",
  };
}