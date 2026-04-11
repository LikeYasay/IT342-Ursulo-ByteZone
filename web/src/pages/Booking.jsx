import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createReservation, getMyReservations, getStations } from "../services/bookingService";
import { logoutUser } from "../services/authService";

const CYAN = "#39d5ff";
const DARK_BG = "#000000";
const CARD_BG = "#1c1c1c";
const BORDER = "#39d5ff";
const MUTED = "#8a8f98";
const INPUT_BG = "#1c1c1c";
const INPUT_BORDER = "#2a2a2a";

const RATE_PER_HOUR = 50;

const TIME_OPTIONS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const DURATION_OPTIONS = [
  { label: "1 Hour", minutes: 60 },
  { label: "2 Hours", minutes: 120 },
  { label: "3 Hours", minutes: 180 },
  { label: "4 Hours", minutes: 240 },
  { label: "5 Hours", minutes: 300 },
];

function StationCell({ station, onClick }) {
  const [hovered, setHovered] = useState(false);

  const bg =
    station.uiStatus === "selected"
      ? CYAN
      : station.uiStatus === "unavailable"
        ? "#334a50"
        : hovered
          ? "rgba(57,213,255,0.15)"
          : "#1c1c1c";

  const cursor = station.uiStatus === "unavailable" ? "not-allowed" : "pointer";
  const textColor = station.uiStatus === "selected" ? "#000" : "#fff";

  const borderColor =
    station.uiStatus === "selected"
      ? CYAN
      : hovered && station.uiStatus === "available"
        ? CYAN
        : INPUT_BORDER;

  return (
    <div
      onClick={() => station.uiStatus !== "unavailable" && onClick(station.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "50px",
        height: "54px",
        background: bg,
        border: `1px solid ${borderColor}`,
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: 700,
        color: textColor,
        cursor,
        transition: "all 0.15s",
        userSelect: "none",
        boxShadow:
          station.uiStatus === "selected"
            ? `0 0 12px rgba(57,213,255,0.5)`
            : "none",
        transform:
          hovered && station.uiStatus === "available" ? "scale(1.06)" : "none",
      }}
    >
      {station.stationNo || `S${station.id}`}
    </div>
  );
}

export default function Booking() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [activeNav, setActiveNav] = useState("Book");
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [myReservations, setMyReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navLinks = ["Home", "Book", "Order"];

  useEffect(() => {
    loadBookingData();
  }, []);

  async function loadBookingData() {
    try {
      setLoading(true);
      setError("");

      const [stationsRes, reservationsRes] = await Promise.all([
        getStations(),
        getMyReservations(),
      ]);

      const mappedStations = (stationsRes.data || []).map((station) => ({
        ...station,
        uiStatus: station.status === "AVAILABLE" ? "available" : "unavailable",
      }));

      setStations(mappedStations);
      setMyReservations(reservationsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load booking data.");
    } finally {
      setLoading(false);
    }
  }

  const handleStationClick = (id) => {
    setStations((prev) =>
      prev.map((s) => {
        if (s.uiStatus === "unavailable") return s;

        if (s.id === id) {
          const next = s.uiStatus === "selected" ? "available" : "selected";
          setSelectedStation(next === "selected" ? id : null);
          return { ...s, uiStatus: next };
        }

        return s.uiStatus === "selected" ? { ...s, uiStatus: "available" } : s;
      }),
    );
  };

  const durationHours = selectedDuration ? parseInt(selectedDuration, 10) : 0;
  const total = durationHours * RATE_PER_HOUR;

  const durationMinutes = useMemo(() => {
    const found = DURATION_OPTIONS.find((d) => String(d.minutes / 60) === selectedDuration);
    return found ? found.minutes : 0;
  }, [selectedDuration]);

  const handleConfirm = async () => {
    if (!selectedStation || !selectedDate || !selectedTime || !selectedDuration) {
      setError("Please complete all booking details.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await createReservation({
        stationId: selectedStation,
        date: selectedDate,
        startTime: selectedTime,
        durationMinutes,
      });

      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 3000);

      await loadBookingData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Booking failed. Please check station availability and booking rules.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setStations((prev) =>
      prev.map((s) => ({
        ...s,
        uiStatus: s.status === "AVAILABLE" ? "available" : "unavailable",
      })),
    );
    setSelectedStation(null);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedDuration("");
    setShowDatePicker(false);
    setShowTimePicker(false);
    setShowDurationPicker(false);
    setError("");
  };

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

  const displayDate = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const latestReservation = myReservations[0];

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
          0%,100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes pop {
          0% { transform: scale(0.95); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }

        .page-in {
          animation: fadeIn 0.5s ease both;
        }

        .dropdown-in {
          animation: slideDown 0.2s ease both;
        }

        .confirm-flash {
          animation: pop 0.4s ease;
        }
      `}</style>

      <div
        style={{
          fontFamily: "'Montserrat', sans-serif",
          background: DARK_BG,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
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
            {navLinks.map((l) => (
              <button
                key={l}
                onClick={() => handleNav(l)}
                style={{
                  padding: "8px 22px",
                  background: activeNav === l ? CYAN : "transparent",
                  color: activeNav === l ? "#000" : "#fff",
                  fontWeight: activeNav === l ? 700 : 500,
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Montserrat', sans-serif",
                  transition: "all 0.2s",
                }}
              >
                {l}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "14px", color: "#fff", fontWeight: 500 }}>
              Welcome,{" "}
              <span style={{ color: CYAN, fontWeight: 700 }}>
                {user.fullName || "Player"}
              </span>
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
              {(user.fullName || "L").charAt(0).toUpperCase()}
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
              onMouseEnter={(e) => (e.currentTarget.style.background = "#666")}
              onMouseLeave={(e) => (e.currentTarget.style.background = MUTED)}
            >
              Logout
            </button>
          </div>
        </nav>

        <main
          className="page-in"
          style={{
            flex: 1,
            padding: "32px 40px 40px",
            maxWidth: "1280px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "28px",
              minHeight: "40px",
              width: "100%",
            }}
          >
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: CARD_BG,
                border: `1px solid #2a2a2a`,
                color: "#fff",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = CYAN)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
            >
              ←
            </button>

            <h1
              style={{
                width: "100%",
                textAlign: "center",
                fontSize: "clamp(24px, 3vw, 36px)",
                fontWeight: 900,
                letterSpacing: "0.5px",
                padding: "0 50px",
                margin: 0,
              }}
            >
              <span style={{ color: "#fff" }}>Book a </span>
              <span style={{ color: CYAN }}>GAMING </span>
              <span style={{ color: "#fff" }}>Session</span>
            </h1>
          </div>

          {confirmed && (
            <div
              className="confirm-flash"
              style={{
                background: "rgba(57,213,255,0.15)",
                border: `1px solid ${CYAN}`,
                borderRadius: "12px",
                padding: "14px 24px",
                marginBottom: "20px",
                color: CYAN,
                fontWeight: 700,
                fontSize: "15px",
                textAlign: "center",
              }}
            >
              ✅ Booking confirmed! Station {selectedStation} reserved for{" "}
              {displayDate} at {selectedTime}.
            </div>
          )}

          {error && (
            <div
              style={{
                background: "rgba(255,0,0,0.10)",
                border: "1px solid rgba(255,0,0,0.25)",
                borderRadius: "12px",
                padding: "14px 24px",
                marginBottom: "20px",
                color: "#ff9b9b",
                fontWeight: 600,
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
            <div
              style={{
                flex: "0 0 auto",
                width: "min(55%, 640px)",
                background: CARD_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: "14px",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  marginBottom: "20px",
                }}
              >
                <span style={{ color: "#fff" }}>Select your </span>
                <span style={{ color: CYAN }}>GAMING </span>
                <span style={{ color: "#fff" }}>station</span>
              </h2>

              {loading ? (
                <div style={{ color: MUTED, textAlign: "center", padding: "30px 0" }}>
                  Loading stations...
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(10, 1fr)",
                    gap: "6px",
                    marginBottom: "24px",
                  }}
                >
                  {stations.map((s) => (
                    <StationCell
                      key={s.id}
                      station={s}
                      onClick={handleStationClick}
                    />
                  ))}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "24px",
                  rowGap: "12px",
                  paddingTop: "14px",
                  borderTop: "1px solid #2a2a2a",
                  width: "100%",
                }}
              >
                {[
                  { color: "#1c1c1c", border: "#2a2a2a", label: "Available" },
                  { color: "#334a50", border: "#334a50", label: "Unavailable" },
                  { color: CYAN, border: CYAN, label: "Selected" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "4px",
                        background: item.color,
                        border: `1px solid ${item.border}`,
                      }}
                    />
                    <span style={{ fontSize: "13px", color: "#fff" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                flex: 1,
                minWidth: "320px",
                background: CARD_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: "14px",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  marginBottom: "20px",
                }}
              >
                <span style={{ color: "#fff" }}>Booking </span>
                <span style={{ color: CYAN }}>Summary</span>
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => {
                      setShowDatePicker((prev) => !prev);
                      setShowTimePicker(false);
                      setShowDurationPicker(false);
                    }}
                    style={pickerButtonStyle}
                  >
                    <span>{displayDate || "Select Date"}</span>
                    <span style={{ color: CYAN }}>▾</span>
                  </button>

                  {showDatePicker && (
                    <div className="dropdown-in" style={dropdownStyle}>
                      <input
                        type="date"
                        value={selectedDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setShowDatePicker(false);
                        }}
                        style={dateInputStyle}
                      />
                    </div>
                  )}
                </div>

                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => {
                      setShowTimePicker((prev) => !prev);
                      setShowDatePicker(false);
                      setShowDurationPicker(false);
                    }}
                    style={pickerButtonStyle}
                  >
                    <span>{selectedTime || "Select Time"}</span>
                    <span style={{ color: CYAN }}>▾</span>
                  </button>

                  {showTimePicker && (
                    <div className="dropdown-in" style={dropdownStyle}>
                      {TIME_OPTIONS.map((time) => (
                        <button
                          key={time}
                          onClick={() => {
                            setSelectedTime(time);
                            setShowTimePicker(false);
                          }}
                          style={dropdownItemStyle}
                        >
                          {formatTimeDisplay(time)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => {
                      setShowDurationPicker((prev) => !prev);
                      setShowDatePicker(false);
                      setShowTimePicker(false);
                    }}
                    style={pickerButtonStyle}
                  >
                    <span>
                      {selectedDuration
                        ? `${selectedDuration} ${Number(selectedDuration) > 1 ? "Hours" : "Hour"}`
                        : "Select Duration"}
                    </span>
                    <span style={{ color: CYAN }}>▾</span>
                  </button>

                  {showDurationPicker && (
                    <div className="dropdown-in" style={dropdownStyle}>
                      {DURATION_OPTIONS.map((duration) => (
                        <button
                          key={duration.label}
                          onClick={() => {
                            setSelectedDuration(String(duration.minutes / 60));
                            setShowDurationPicker(false);
                          }}
                          style={dropdownItemStyle}
                        >
                          {duration.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    background: INPUT_BG,
                    border: "1px solid #2a2a2a",
                    borderRadius: "12px",
                    padding: "18px",
                    marginTop: "4px",
                  }}
                >
                  <div style={summaryRowStyle}>
                    <span style={summaryLabelStyle}>Station</span>
                    <span style={summaryValueStyle}>
                      {selectedStation
                        ? stations.find((s) => s.id === selectedStation)?.stationNo ||
                          `S${selectedStation}`
                        : "--"}
                    </span>
                  </div>

                  <div style={summaryRowStyle}>
                    <span style={summaryLabelStyle}>Date</span>
                    <span style={summaryValueStyle}>{displayDate || "--"}</span>
                  </div>

                  <div style={summaryRowStyle}>
                    <span style={summaryLabelStyle}>Time</span>
                    <span style={summaryValueStyle}>
                      {selectedTime ? formatTimeDisplay(selectedTime) : "--"}
                    </span>
                  </div>

                  <div style={summaryRowStyle}>
                    <span style={summaryLabelStyle}>Duration</span>
                    <span style={summaryValueStyle}>
                      {selectedDuration ? `${selectedDuration} Hour(s)` : "--"}
                    </span>
                  </div>

                  <div
                    style={{
                      ...summaryRowStyle,
                      marginTop: "10px",
                      paddingTop: "14px",
                      borderTop: "1px solid #2a2a2a",
                    }}
                  >
                    <span style={{ ...summaryLabelStyle, fontWeight: 800 }}>Estimated Total</span>
                    <span
                      style={{
                        color: CYAN,
                        fontWeight: 900,
                        fontSize: "22px",
                      }}
                    >
                      ₱{total}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={submitting || loading}
                  style={{
                    padding: "15px",
                    background: submitting ? "#6fdfff" : CYAN,
                    color: "#000",
                    fontWeight: 800,
                    fontSize: "15px",
                    border: "none",
                    borderRadius: "14px",
                    cursor: submitting ? "wait" : "pointer",
                    fontFamily: "'Montserrat', sans-serif",
                    transition: "all 0.2s",
                    boxShadow: `0 0 24px rgba(57,213,255,0.3)`,
                  }}
                >
                  {submitting ? "Confirming..." : "Confirm Booking"}
                </button>

                <button
                  onClick={handleCancel}
                  style={{
                    padding: "14px",
                    background: "transparent",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "14px",
                    border: `1px solid ${CYAN}`,
                    borderRadius: "14px",
                    cursor: "pointer",
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Cancel
                </button>
              </div>

              <div
                style={{
                  marginTop: "22px",
                  paddingTop: "18px",
                  borderTop: "1px solid #2a2a2a",
                }}
              >
                <h3
                  style={{
                    color: "#fff",
                    fontSize: "15px",
                    fontWeight: 800,
                    marginBottom: "12px",
                  }}
                >
                  Latest Reservation
                </h3>

                {latestReservation ? (
                  <div
                    style={{
                      background: "#111",
                      border: "1px solid #2a2a2a",
                      borderRadius: "12px",
                      padding: "14px",
                    }}
                  >
                    <div style={{ color: "#fff", fontWeight: 700, marginBottom: "6px" }}>
                      {latestReservation.station?.stationNo ||
                        `Station ${latestReservation.station?.id ?? ""}`}
                    </div>
                    <div style={{ color: MUTED, fontSize: "13px", lineHeight: 1.6 }}>
                      {latestReservation.date} • {latestReservation.startTime} •{" "}
                      {latestReservation.durationMinutes} mins
                    </div>
                    <div style={{ color: CYAN, fontWeight: 800, marginTop: "8px" }}>
                      {latestReservation.status}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: MUTED, fontSize: "13px" }}>
                    No reservations yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

const pickerButtonStyle = {
  width: "100%",
  height: "50px",
  background: INPUT_BG,
  border: `1px solid ${INPUT_BORDER}`,
  borderRadius: "10px",
  color: "#fff",
  fontSize: "14px",
  fontFamily: "'Montserrat', sans-serif",
  padding: "0 16px",
  outline: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
};

const dropdownStyle = {
  position: "absolute",
  top: "56px",
  left: 0,
  right: 0,
  background: "#121212",
  border: "1px solid #2a2a2a",
  borderRadius: "10px",
  overflow: "hidden",
  zIndex: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
};

const dropdownItemStyle = {
  width: "100%",
  padding: "12px 14px",
  background: "transparent",
  border: "none",
  color: "#fff",
  textAlign: "left",
  cursor: "pointer",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: "14px",
};

const dateInputStyle = {
  width: "100%",
  background: "transparent",
  border: "none",
  color: "#fff",
  padding: "14px",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: "14px",
  outline: "none",
};

const summaryRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "10px",
};

const summaryLabelStyle = {
  color: MUTED,
  fontSize: "13px",
};

const summaryValueStyle = {
  color: "#fff",
  fontWeight: 700,
  fontSize: "14px",
};

function formatTimeDisplay(time24) {
  const [hourStr, minute] = time24.split(":");
  const hour = Number(hourStr);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${suffix}`;
}