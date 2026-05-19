import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./components/AdminLayout.jsx";
import { getStations, updateStationStatus } from "../booking/bookingService";

const CYAN = "#39d5ff";
const MUTED = "#8a8f98";

const STATION_STATUS_OPTIONS = ["AVAILABLE", "RESERVED", "IN_USE"];

export default function AdminStations() {
  const [stations, setStations] = useState([]);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getStations();
      setStations(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load stations.");
    } finally {
      setLoading(false);
    }
  };

  const filteredStations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return stations;

    return stations.filter(
      (station) =>
        String(station.id).includes(query) ||
        String(station.stationNo || "").toLowerCase().includes(query) ||
        String(station.status || "").toLowerCase().includes(query)
    );
  }, [stations, search]);

  const handleStatusChange = async (stationId, status) => {
    try {
      setSavingId(stationId);
      setError("");

      await updateStationStatus(stationId, status);
      await loadStations();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update station status.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminLayout title="Stations">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <input
          type="text"
          placeholder="Search stations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />

        <button onClick={loadStations} style={primaryButtonStyle}>
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ color: "#ff9b9b", marginBottom: "16px", fontWeight: 700 }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: MUTED }}>Loading stations...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#111" }}>
                {["ID", "Station", "Status", "Action"].map((header) => (
                  <th key={header} style={thStyle}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredStations.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: "24px", textAlign: "center", color: MUTED }}>
                    No stations found.
                  </td>
                </tr>
              ) : (
                filteredStations.map((station) => (
                  <tr key={station.id} style={{ borderBottom: "1px solid #222" }}>
                    <td style={tdStyle}>#{station.id}</td>

                    <td style={tdStyle}>
                      <strong style={{ color: "#fff" }}>
                        {station.stationNo || `Station ${station.id}`}
                      </strong>
                    </td>

                    <td style={tdStyle}>
                      <span style={getStatusStyle(station.status)}>
                        {station.status || "N/A"}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <select
                        disabled={savingId === station.id}
                        value={station.status}
                        onChange={(e) =>
                          handleStatusChange(station.id, e.target.value)
                        }
                        style={{
                          padding: "7px 10px",
                          borderRadius: "999px",
                          border: `1px solid ${CYAN}`,
                          background: "rgba(57,213,255,0.12)",
                          color: CYAN,
                          fontWeight: 800,
                          fontSize: "12px",
                          outline: "none",
                          cursor: "pointer",
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        {STATION_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
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
  flex: 1,
  maxWidth: "360px",
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

const getStatusStyle = (status) => {
  const isAvailable = status === "AVAILABLE";
  const isInUse = status === "IN_USE";

  return {
    padding: "4px 10px",
    borderRadius: "999px",
    background: isAvailable
      ? "rgba(34,197,94,0.14)"
      : isInUse
      ? "rgba(239,68,68,0.14)"
      : "rgba(57,213,255,0.12)",
    color: isAvailable ? "#22c55e" : isInUse ? "#ff9b9b" : CYAN,
    fontWeight: 800,
    fontSize: "12px",
  };
};