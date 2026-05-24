import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../auth/authService";
import { getMyReservations } from "../booking/bookingService";
import { getMyOrders } from "../orders/orderService";
import { getMyPayments } from "../payments/paymentService";
import NotificationBell from "../notifications/NotificationBell.jsx";
import { getAnnouncements } from "../announcements/announcementService";
import { getMyActiveSession } from "../sessions/sessionService";
import { getGamingHighlights } from "../publicApi/publicApiService";

const CYAN = "#39d5ff";
const DARK_BG = "#000000";
const CARD_BG = "#1c1c1c";
const BORDER = "#39d5ff";
const INNER_CARD = "#333";
const MUTED = "#8a8f98";

function getUserImageUrl(user) {
  return user?.profileImageUrl || user?.profile_image_url || "";
}

function formatDisplayDate(value, fallback = "N/A") {
  if (!value) return fallback;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return fallback;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMemberSince(value) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function normalizeGameName(name = "") {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const GAMES = [
  {
    name: "Valorant",
    image:
      "https://www.riotgames.com/darkroom/1440/8d5c497da1c2eeec8cffa99b01abc64b:5329ca773963a5b739e98e715957ab39/ps-f2p-val-console-launch-16x9.jpg",
    priorityKey: "valorant",
  },
  {
    name: "Counter-Strike: Global Offensive (CS:GO)",
    image:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/capsule_616x353.jpg?t=1749053861",
    priorityKey: "counterstrike",
  },
  {
    name: "League of Legends",
    image:
      "https://static.wikia.nocookie.net/leagueoflegends/images/7/7b/League_of_Legends_Cover.jpg/revision/latest/scale-to-width-down/1200?cb=20191018222445",
    priorityKey: "leagueoflegends",
  },
  {
    name: "Apex Legends",
    image:
      "https://www.nintendo.com/eu/media/images/assets/nintendo_switch_2_games/apexlegends_1/16x9_ApexLegends_image1600w.jpg",
    priorityKey: "apexlegends",
  },
  {
    name: "Fortnite",
    image:
      "https://dropinblog.net/34253310/files/featured/imagem-2024-09-26-103919931.png",
    priorityKey: "fortnite",
  },
  {
    name: "Dota 2",
    image:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/570/capsule_616x353.jpg?t=1769535998",
    priorityKey: "dota2",
  },
];

const STATIC_UPDATES = [
  {
    title: "Valorant Tournament",
    time: "Today, 8:00 PM",
    detail: "Prize Pool: $500",
  },
  {
    title: "League Night",
    time: "Tomorrow, 7:00 PM",
    detail: "Free Entry",
  },
  {
    title: "CS:GO Championship",
    time: "This Weekend",
    detail: "Prize Pool: $1000",
  },
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

  const [announcements, setAnnouncements] = useState([]);
  const [activeNav, setActiveNav] = useState("Home");
  const [gameIdx, setGameIdx] = useState(0);

  const [user, setUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");
  const [activeSession, setActiveSession] = useState(null);
  const [remainingTime, setRemainingTime] = useState("00:00:00");
  const [apiGames, setApiGames] = useState([]);

  const visibleGames = 4;

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(
        activeSession?.endTime
          ? formatCountdown(activeSession.endTime)
          : "00:00:00",
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession]);

  async function loadDashboard() {
    try {
      setError("");

      const [
        userRes,
        reservationRes,
        orderRes,
        paymentRes,
        announcementsRes,
        activeSessionRes,
      ] = await Promise.all([
        getCurrentUser(),
        getMyReservations(),
        getMyOrders(),
        getMyPayments(),
        getAnnouncements(),
        getMyActiveSession(),
      ]);

      setUser(userRes.data);
      localStorage.setItem("user", JSON.stringify(userRes.data));

      setReservations(reservationRes.data || []);
      setOrders(orderRes.data || []);
      setPayments(paymentRes.data || []);
      setAnnouncements(announcementsRes.data || []);
      setActiveSession(activeSessionRes.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard.");
    }

    try {
      const publicApiRes = await getGamingHighlights();

      const fetchedGames = (publicApiRes.data || [])
        .filter((game) => game?.name && game?.background)
        .map((game) => ({
          name: game.name,
          image: game.background,
          rating: game.rating,
          released: game.released,
          priorityKey: normalizeGameName(game.name),
        }));

      setApiGames(fetchedGames);
    } catch {
      setApiGames([]);
    }
  }

  const handleNav = (label) => {
    setActiveNav(label);

    if (label === "Home") navigate("/dashboard");
    if (label === "Book") navigate("/booking");
    if (label === "Order") navigate("/order");
    if (label === "Transactions") navigate("/transactions");
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const findApiGame = (keywords) =>
    apiGames.find((game) => {
      const normalizedName = normalizeGameName(game.name);
      return keywords.some((keyword) => normalizedName.includes(keyword));
    });

  const valorantApiGame = findApiGame(["valorant"]);

  const counterStrikeApiGame = findApiGame([
    "counterstrike",
    "counterstrikeglobaloffensive",
    "counterstrike2",
    "csgo",
  ]);

  const priorityGames = [
    valorantApiGame || GAMES[0],
    counterStrikeApiGame || GAMES[1],
  ];

  const alreadyUsedNames = new Set(
    priorityGames.map((game) => normalizeGameName(game.name)),
  );

  const remainingApiGames = apiGames.filter(
    (game) => !alreadyUsedNames.has(normalizeGameName(game.name)),
  );

  const remainingStaticGames = GAMES.slice(2).filter(
    (game) => !alreadyUsedNames.has(normalizeGameName(game.name)),
  );

  const topPickGames =
    apiGames.length > 0
      ? [...priorityGames, ...remainingApiGames, ...remainingStaticGames].slice(
          0,
          8,
        )
      : GAMES;

  const canPrev = gameIdx > 0;
  const canNext = gameIdx + visibleGames < topPickGames.length;

  const activeReservationStatuses = [
    "PENDING",
    "APPROVED",
    "CHECKED_IN",
    "COMPLETED",
  ];

  const latestReservation =
    reservations.find((reservation) =>
      ["PENDING", "APPROVED"].includes(reservation.status),
    ) ||
    reservations.find((reservation) =>
      activeReservationStatuses.includes(reservation.status),
    ) ||
    reservations[0] ||
    null;

  const latestOrder = orders[0];
  const latestPayment = payments[0];

  const unpaidPayments = payments.filter(
    (payment) =>
      payment.status === "INITIATED" ||
      payment.status === "PROCESSING" ||
      payment.status === "PENDING",
  );

  const latestUnpaidPayment = unpaidPayments[0];
  const pendingPayments = unpaidPayments.length;

  const displayName = user?.fullName || "Player";
  const firstName = displayName.trim().split(/\s+/)[0] || "Player";
  const displayInitial = displayName.charAt(0).toUpperCase();
  const profileImageUrl = getUserImageUrl(user);

  const totalHours = user?.totalHoursPlayed ?? 0;
  const tournamentWins = user?.tournamentWins ?? 0;
  const lastPlayed = "N/A";
  const favoriteGame = "N/A";

  const memberSince = formatMemberSince(user?.createdAt);

  const latestActivityDate =
    activeSession?.startTime ||
    activeSession?.createdAt ||
    latestOrder?.createdAt ||
    latestPayment?.createdAt ||
    latestReservation?.createdAt ||
    user?.createdAt;

  const lastVisit = formatDisplayDate(latestActivityDate);

  const currentStation = activeSession?.station?.stationNo || "N/A";

  const reservedStation = latestReservation?.station?.stationNo || "N/A";

  const reservationDate =
    latestReservation?.date || latestReservation?.reservationDate
      ? new Date(
          latestReservation.date || latestReservation.reservationDate,
        ).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "N/A";

  const reservationTimeRange = latestReservation?.startTime
    ? `${latestReservation.startTime}${
        latestReservation.endTime ? ` – ${latestReservation.endTime}` : ""
      }`
    : "N/A";

  const sessionStatus = activeSession?.status || "Inactive";
  const reservationStatus = latestReservation?.status || "No Reservation";

  const reservationDuration = latestReservation?.durationMinutes
    ? `${latestReservation.durationMinutes} min`
    : "N/A";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${DARK_BG}; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: rgba(57,213,255,0.3); border-radius: 3px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .dash-section { animation: fadeIn 0.5s ease both; }
        .dash-section:nth-child(1) { animation-delay: 0.05s; }
        .dash-section:nth-child(2) { animation-delay: 0.10s; }
        .dash-section:nth-child(3) { animation-delay: 0.15s; }
        .dash-section:nth-child(4) { animation-delay: 0.20s; }
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
            {["Home", "Book", "Order", "Transactions"].map((link) => (
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
              Welcome,{" "}
              <span style={{ color: CYAN, fontWeight: 700 }}>
                {displayName}
              </span>
            </span>

            <NotificationBell />

            <button
              onClick={() => navigate("/profile")}
              title="View Profile"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: profileImageUrl
                  ? "#111"
                  : `linear-gradient(135deg, ${CYAN}, #0070a8)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: 800,
                color: "#000",
                border: `2px solid ${CYAN}`,
                cursor: "pointer",
                fontFamily: "'Montserrat', sans-serif",
                overflow: "hidden",
                padding: 0,
              }}
            >
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                displayInitial
              )}
            </button>

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
              <SectionCard title={`${firstName}'s`} accentWord="Status">
                <div style={{ display: "flex", gap: "12px" }}>
                  <StatCard label="Total Hours Played" value={totalHours} />
                  <StatCard label="Tournament Won" value={tournamentWins} />
                  <StatCard label="Last Played" value={lastPlayed} />
                  <StatCard label="Favorite Game" value={favoriteGame} />
                </div>
              </SectionCard>
            </div>

            <div className="dash-section">
              <SectionCard title="Current" accentWord="Session">
                <div style={{ display: "flex", gap: "12px" }}>
                  <StatCard label="Remaining Time" value={remainingTime} />
                  <StatCard label="Session Status" value={sessionStatus} />
                  <StatCard label="Station" value={currentStation} />
                </div>
              </SectionCard>
            </div>

            <div className="dash-section">
              <SectionCard title="Reservation" accentWord="Status">
                <div style={{ display: "flex", gap: "12px" }}>
                  <div
                    style={{
                      flex: 1,
                      background: INNER_CARD,
                      borderRadius: "12px",
                      padding: "14px 10px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#aaa",
                        marginBottom: "8px",
                        fontWeight: 500,
                      }}
                    >
                      Date and Time
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: CYAN,
                        lineHeight: 1.6,
                      }}
                    >
                      {reservationDate}
                      <br />
                      {reservationTimeRange}
                    </div>
                  </div>

                  <StatCard label="Reserved Station" value={reservedStation} />
                  <StatCard label="Duration" value={reservationDuration} />

                  <div
                    style={{
                      flex: 1,
                      background: INNER_CARD,
                      borderRadius: "12px",
                      padding: "14px 10px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#aaa",
                        marginBottom: "10px",
                        fontWeight: 500,
                      }}
                    >
                      Reservation Status
                    </div>

                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 18px",
                        background:
                          reservationStatus === "No Reservation" ||
                          reservationStatus === "PENDING"
                            ? "#555"
                            : "rgba(57,213,255,0.2)",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
                      {reservationStatus}
                    </span>
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="dash-section">
              <div style={{ marginBottom: "16px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: 800 }}>
                  <span style={{ color: "#fff" }}>Top Picks for </span>
                  <span style={{ color: CYAN }}>Gamers</span>
                </h2>
              </div>

              <div style={{ position: "relative" }}>
                <div
                  style={{ display: "flex", gap: "14px", overflow: "hidden" }}
                >
                  {topPickGames
                    .slice(gameIdx, gameIdx + visibleGames)
                    .map((game) => (
                      <div
                        key={game.name}
                        style={{
                          flex: "0 0 calc(25% - 11px)",
                          background: CARD_BG,
                          border: "1px solid #2a2a2a",
                          borderRadius: "16px",
                          overflow: "hidden",
                          transition:
                            "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform =
                            "translateY(-4px) scale(1.01)";
                          e.currentTarget.style.borderColor = CYAN;
                          e.currentTarget.style.boxShadow =
                            "0 16px 40px rgba(57,213,255,0.10)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "none";
                          e.currentTarget.style.borderColor = "#2a2a2a";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            height: "180px",
                            position: "relative",
                            background: "#0d0d18",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={game.image}
                            alt={game.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />

                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background:
                                "linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.05) 100%)",
                            }}
                          />

                          <div
                            style={{
                              position: "absolute",
                              left: "14px",
                              right: "14px",
                              bottom: "12px",
                              textAlign: "center",
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#fff",
                              lineHeight: 1.4,
                              textShadow: "0 2px 8px rgba(0,0,0,0.65)",
                            }}
                          >
                            {game.name}

                            {game.rating && (
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: CYAN,
                                  marginTop: "4px",
                                }}
                              >
                                Rating: {game.rating}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {canPrev && (
                  <button
                    onClick={() => setGameIdx((i) => Math.max(0, i - 1))}
                    style={{
                      position: "absolute",
                      left: "-18px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: CYAN,
                      border: "none",
                      color: "#000",
                      fontSize: "18px",
                      fontWeight: 900,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 0 16px rgba(57,213,255,0.4)",
                    }}
                  >
                    ‹
                  </button>
                )}

                {canNext && (
                  <button
                    onClick={() => setGameIdx((i) => i + 1)}
                    style={{
                      position: "absolute",
                      right: "-18px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: CYAN,
                      border: "none",
                      color: "#000",
                      fontSize: "18px",
                      fontWeight: 900,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 0 16px rgba(57,213,255,0.4)",
                    }}
                  >
                    ›
                  </button>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              width: "300px",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div
              className="dash-section"
              style={{
                background: CARD_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: "20px",
                padding: "28px 24px",
                textAlign: "center",
              }}
            >
              <button
                onClick={() => navigate("/profile")}
                title="View Profile"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: profileImageUrl
                    ? "#111"
                    : `linear-gradient(135deg, ${CYAN}, #0070a8)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: 900,
                  color: "#000",
                  margin: "0 auto 14px",
                  border: `3px solid ${CYAN}`,
                  boxShadow: `0 0 24px rgba(57,213,255,0.35)`,
                  overflow: "hidden",
                  padding: 0,
                  cursor: "pointer",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  displayInitial
                )}
              </button>

              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#fff",
                  marginBottom: "4px",
                }}
              >
                {displayName}
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: CYAN,
                  fontWeight: 600,
                  marginBottom: "18px",
                }}
              >
                Member
              </div>

              <div
                style={{
                  borderTop: "1px solid #2a2a2a",
                  paddingTop: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {[
                  ["Member Since", memberSince],
                  ["Last Visit", lastVisit],
                ].map(([key, val]) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                    }}
                  >
                    <span style={{ color: "#aaa" }}>{key}:</span>
                    <span style={{ color: CYAN, fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-section">
              <SectionCard title="Quick" accentWord="Actions">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <QuickActionBtn
                    label="Book Station"
                    icon="🖥️"
                    onClick={() => navigate("/booking")}
                  />
                  <QuickActionBtn
                    label="Order Snacks"
                    icon="🍟"
                    onClick={() => navigate("/order")}
                  />
                  <QuickActionBtn
                    label="Transaction History"
                    icon="💳"
                    onClick={() => navigate("/transactions")}
                  />
                </div>
              </SectionCard>
            </div>

            <div className="dash-section">
              <SectionCard title="ByteZone" accentWord="Updates">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div style={{ marginBottom: "8px" }}>
                    <h3
                      style={{
                        color: CYAN,
                        fontSize: "15px",
                        marginBottom: "10px",
                        fontWeight: 800,
                      }}
                    >
                      Announcements
                    </h3>

                    {announcements.length === 0
                      ? STATIC_UPDATES.map((update) => (
                          <div
                            key={update.title}
                            style={{
                              background: INNER_CARD,
                              borderRadius: "10px",
                              padding: "12px 14px",
                              border: "1px solid rgba(57,213,255,0.18)",
                              marginBottom: "10px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 800,
                                color: CYAN,
                                marginBottom: "4px",
                              }}
                            >
                              {update.title}
                            </div>

                            <div
                              style={{
                                fontSize: "12px",
                                color: "#bbb",
                                lineHeight: 1.5,
                              }}
                            >
                              {update.detail}
                            </div>

                            <div
                              style={{
                                fontSize: "11px",
                                color: "#666",
                                marginTop: "8px",
                              }}
                            >
                              {update.time}
                            </div>
                          </div>
                        ))
                      : announcements.slice(0, 3).map((announcement) => (
                          <div
                            key={announcement.id}
                            style={{
                              background: INNER_CARD,
                              borderRadius: "10px",
                              padding: "12px 14px",
                              border: "1px solid rgba(57,213,255,0.18)",
                              marginBottom: "10px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 800,
                                color: CYAN,
                                marginBottom: "4px",
                              }}
                            >
                              {announcement.title}
                            </div>

                            <div
                              style={{
                                fontSize: "12px",
                                color: "#bbb",
                                lineHeight: 1.5,
                              }}
                            >
                              {announcement.description}
                            </div>

                            <div
                              style={{
                                fontSize: "11px",
                                color: "#666",
                                marginTop: "8px",
                              }}
                            >
                              {announcement.createdAt
                                ? new Date(
                                    announcement.createdAt,
                                  ).toLocaleString()
                                : ""}
                            </div>
                          </div>
                        ))}
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="dash-section">
              <SectionCard title="Pending" accentWord="Payments">
                <div
                  style={{ display: "flex", gap: "12px", marginBottom: "12px" }}
                >
                  <StatCard label="Count" value={pendingPayments} small />
                  <StatCard
                    label="Latest"
                    value={
                      latestUnpaidPayment
                        ? `₱${Number(latestUnpaidPayment.amount).toFixed(0)}`
                        : "₱0"
                    }
                    small
                  />
                </div>

                {latestUnpaidPayment ? (
                  <button
                    onClick={() =>
                      navigate(`/payments/sandbox/${latestUnpaidPayment.id}`)
                    }
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "none",
                      background: CYAN,
                      color: "#000",
                      fontWeight: 900,
                      cursor: "pointer",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    Pay Now
                  </button>
                ) : (
                  <p
                    style={{
                      color: MUTED,
                      fontSize: "13px",
                      textAlign: "center",
                    }}
                  >
                    No pending payments.
                  </p>
                )}
              </SectionCard>
            </div>
          </div>
        </main>

        <footer
          style={{
            borderTop: "1px solid #1a1a1a",
            padding: "20px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "14px", color: MUTED }}>
            © ByteZone. All rights reserved.
          </span>

          <div style={{ display: "flex", gap: "24px" }}>
            {["Home", "Book", "Order", "Transactions"].map((link) => (
              <span
                key={link}
                onClick={() => handleNav(link)}
                style={{
                  fontSize: "14px",
                  color: MUTED,
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = CYAN;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = MUTED;
                }}
              >
                {link}
              </span>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}
