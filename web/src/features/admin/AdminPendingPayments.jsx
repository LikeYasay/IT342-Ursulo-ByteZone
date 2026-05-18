import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./components/AdminLayout.jsx";
import { getPendingPayments } from "../payments/paymentService";

const CYAN = "#39d5ff";
const MUTED = "#8a8f98";

export default function AdminPendingPayments() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPendingPayments();
      setPayments(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load pending payments."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return payments;

    return payments.filter((payment) => {
      const userName = payment.user?.fullName || "";
      const userEmail = payment.user?.email || "";

      return (
        String(payment.id).includes(query) ||
        userName.toLowerCase().includes(query) ||
        userEmail.toLowerCase().includes(query) ||
        String(payment.type || "").toLowerCase().includes(query) ||
        String(payment.status || "").toLowerCase().includes(query) ||
        String(payment.amount || "").includes(query)
      );
    });
  }, [payments, search]);

  return (
    <AdminLayout title="Pending Payments">
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "18px" }}>
        <input
          type="text"
          placeholder="Search payments..."
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
          onClick={loadPayments}
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
        <div style={{ color: "#ff9b9b", marginBottom: "16px", fontWeight: 600 }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: MUTED }}>Loading pending payments...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#111" }}>
                {["ID", "User", "Type", "Amount", "Status", "Method", "Reference"].map((header) => (
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
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: "24px", textAlign: "center", color: MUTED }}>
                    No pending payments found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: "1px solid #222" }}>
                    <td style={tdStyle}>#{payment.id}</td>
                    <td style={tdStyle}>
                      <div style={{ color: "#fff", fontWeight: 700 }}>
                        {payment.user?.fullName || "N/A"}
                      </div>
                      <div style={{ color: MUTED, fontSize: "12px" }}>
                        {payment.user?.email || ""}
                      </div>
                    </td>
                    <td style={tdStyle}>{payment.type}</td>
                    <td style={tdStyle}>₱{Number(payment.amount || 0).toFixed(2)}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "999px",
                          background: "rgba(57,213,255,0.12)",
                          color: CYAN,
                          fontWeight: 800,
                          fontSize: "12px",
                        }}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td style={tdStyle}>{payment.method || "N/A"}</td>
                    <td style={tdStyle}>{payment.referenceNo || "N/A"}</td>
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