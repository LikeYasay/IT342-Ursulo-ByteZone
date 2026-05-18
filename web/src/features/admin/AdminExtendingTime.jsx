import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./components/AdminLayout.jsx";
import {
  endSession,
  extendSession,
  getActiveSessions,
} from "../sessions/sessionService";

const CYAN = "#39d5ff";
const MUTED = "#8a8f98";

export default function AdminExtendingTime() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const [extensionMinutes, setExtensionMinutes] = useState(60);
  const [amount, setAmount] = useState(50);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getActiveSessions();
      setSessions(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load active sessions.");
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return sessions;

    return sessions.filter((session) => {
      const userName = session.user?.fullName || "";
      const userEmail = session.user?.email || "";
      const stationNo = session.station?.stationNo || "";

      return (
        String(session.id).includes(query) ||
        userName.toLowerCase().includes(query) ||
        userEmail.toLowerCase().includes(query) ||
        String(stationNo).toLowerCase().includes(query) ||
        String(session.status || "").toLowerCase().includes(query)
      );
    });
  }, [sessions, search]);

  const handleExtend = async (sessionId) => {

    try {
      setSavingId(sessionId);
      setError("");

      await extendSession(sessionId, {
        minutes: Number(extensionMinutes),
        amount: Number(amount),
      });

      await loadSessions();
      alert("Playtime extended successfully. A sandbox payment was created.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to extend playtime.");
    } finally {
      setSavingId(null);
    }
  };

    const handleEndSession = async (sessionId) => {
    const confirmed = window.confirm("Are you sure you want to end this session?");

    if (!confirmed) return;

    try {
        setSavingId(sessionId);
        setError("");

        await endSession(sessionId);
        await loadSessions();
        alert("Session ended successfully.");
    } catch (err) {
        setError(err.response?.data?.message || "Failed to end session.");
    } finally {
        setSavingId(null);
    }
    };

  return (
    <AdminLayout title="Extending Time">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 160px 160px auto",
          gap: "12px",
          marginBottom: "18px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search active sessions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />

        <input
          type="number"
          min="1"
          value={extensionMinutes}
          onChange={(e) => setExtensionMinutes(e.target.value)}
          placeholder="Minutes"
          style={inputStyle}
        />

        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          style={inputStyle}
        />

        <button onClick={loadSessions} style={primaryButtonStyle}>
          Refresh
        </button>
      </div>

      <p style={{ color: MUTED, marginBottom: "16px", fontSize: "13px" }}>
        Extending playtime will update the session end time and create a sandbox
        payment record.
      </p>

      {error && (
        <div style={{ color: "#ff9b9b", marginBottom: "16px", fontWeight: 700 }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: MUTED }}>Loading active sessions...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#111" }}>
                {["ID", "User", "Station", "Start Time", "End Time", "Status", "Action"].map(
                  (header) => (
                    <th key={header} style={thStyle}>
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: "24px", textAlign: "center", color: MUTED }}>
                    No active sessions found.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.id} style={{ borderBottom: "1px solid #222" }}>
                    <td style={tdStyle}>#{session.id}</td>

                    <td style={tdStyle}>
                      <div style={{ color: "#fff", fontWeight: 700 }}>
                        {session.user?.fullName || "N/A"}
                      </div>
                      <div style={{ color: MUTED, fontSize: "12px" }}>
                        {session.user?.email || ""}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      {session.station?.stationNo ||
                        `Station ${session.station?.id || "N/A"}`}
                    </td>

                    <td style={tdStyle}>
                      {session.startTime
                        ? new Date(session.startTime).toLocaleString()
                        : "N/A"}
                    </td>

                    <td style={tdStyle}>
                      {session.endTime
                        ? new Date(session.endTime).toLocaleString()
                        : "N/A"}
                    </td>

                    <td style={tdStyle}>
                      <span style={pillStyle}>{session.status}</span>
                    </td>

                    <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                        disabled={savingId === session.id}
                        onClick={() => handleExtend(session.id)}
                        style={primaryButtonStyle}
                        >
                        {savingId === session.id ? "Extending..." : "Extend"}
                        </button>

                        <button
                        disabled={savingId === session.id}
                        onClick={() => handleEndSession(session.id)}
                        style={{
                            ...primaryButtonStyle,
                            background: "#ef4444",
                            color: "#fff",
                        }}
                        >
                        End
                        </button>
                    </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #333",
  background: "#111",
  color: "#fff",
  outline: "none",
  fontFamily: "'Montserrat', sans-serif",
};

const primaryButtonStyle = {
  padding: "10px 18px",
  borderRadius: "10px",
  border: "none",
  background: CYAN,
  color: "#000",
  fontWeight: 800,
  cursor: "pointer",
  fontFamily: "'Montserrat', sans-serif",
};

const pillStyle = {
  padding: "4px 10px",
  borderRadius: "999px",
  background: "rgba(57,213,255,0.12)",
  color: CYAN,
  fontWeight: 800,
  fontSize: "12px",
};

const thStyle = {
  padding: "12px",
  textAlign: "left",
  color: MUTED,
  borderBottom: "1px solid #333",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "12px",
  color: "#ddd",
  verticalAlign: "top",
  whiteSpace: "nowrap",
};