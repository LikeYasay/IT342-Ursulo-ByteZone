import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./components/AdminLayout.jsx";
import {
  getAllReservations,
  updateReservationStatus,
} from "../booking/bookingService";

const CYAN = "#39d5ff";
const MUTED = "#8a8f98";

const RESERVATION_STATUS_OPTIONS = [
  "PENDING",
  "APPROVED",
  "CHECKED_IN",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
];

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllReservations();
      setReservations(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return reservations;

    return reservations.filter((reservation) => {
      const userName = reservation.user?.fullName || "";
      const userEmail = reservation.user?.email || "";
      const stationNo = reservation.station?.stationNo || "";

      return (
        String(reservation.id).includes(query) ||
        userName.toLowerCase().includes(query) ||
        userEmail.toLowerCase().includes(query) ||
        String(stationNo).toLowerCase().includes(query) ||
        String(reservation.status || "").toLowerCase().includes(query) ||
        String(reservation.reservationDate || "").toLowerCase().includes(query)
      );
    });
  }, [reservations, search]);

  const handleStatusChange = async (reservationId, status) => {
    try {
      setSavingId(reservationId);
      setError("");

      await updateReservationStatus(reservationId, status);
      await loadReservations();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update reservation status."
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminLayout title="Reservations">
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
          placeholder="Search reservations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            maxWidth: "360px",
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid #333",
            background: "#111",
            color: "#fff",
            outline: "none",
            fontFamily: "'Montserrat', sans-serif",
          }}
        />

        <button
          onClick={loadReservations}
          style={{
            padding: "10px 18px",
            borderRadius: "10px",
            border: "none",
            background: CYAN,
            color: "#000",
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ color: "#ff9b9b", marginBottom: "16px", fontWeight: 700 }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: MUTED }}>Loading reservations...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr style={{ background: "#111" }}>
                {[
                  "ID",
                  "User",
                  "Station",
                  "Date",
                  "Start Time",
                  "Duration",
                  "Status",
                  "Created At",
                ].map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      color: MUTED,
                      borderBottom: "1px solid #333",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredReservations.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: MUTED,
                    }}
                  >
                    No reservations found.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((reservation) => (
                  <tr
                    key={reservation.id}
                    style={{ borderBottom: "1px solid #222" }}
                  >
                    <td style={tdStyle}>#{reservation.id}</td>

                    <td style={tdStyle}>
                      <div style={{ color: "#fff", fontWeight: 700 }}>
                        {reservation.user?.fullName || "N/A"}
                      </div>
                      <div style={{ color: MUTED, fontSize: "12px" }}>
                        {reservation.user?.email || ""}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      {reservation.station?.stationNo ||
                        `Station ${reservation.station?.id || "N/A"}`}
                    </td>

                    <td style={tdStyle}>
                      {reservation.reservationDate || "N/A"}
                    </td>

                    <td style={tdStyle}>{reservation.startTime || "N/A"}</td>

                    <td style={tdStyle}>
                      {reservation.durationHours
                        ? `${reservation.durationHours} hr(s)`
                        : "N/A"}
                    </td>

                    <td style={tdStyle}>
                      <select
                        disabled={savingId === reservation.id}
                        value={reservation.status}
                        onChange={(e) =>
                          handleStatusChange(reservation.id, e.target.value)
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
                        {RESERVATION_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td style={tdStyle}>
                      {reservation.createdAt
                        ? new Date(reservation.createdAt).toLocaleString()
                        : "N/A"}
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

const tdStyle = {
  padding: "12px",
  color: "#ddd",
  verticalAlign: "top",
  whiteSpace: "nowrap",
};