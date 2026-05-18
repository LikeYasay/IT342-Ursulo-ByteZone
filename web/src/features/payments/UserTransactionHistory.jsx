import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyPayments } from "./paymentService";

const CYAN = "#39d5ff";
const DARK_BG = "#000000";
const CARD_BG = "#1c1c1c";
const MUTED = "#8a8f98";

export default function UserTransactionHistory() {
  const navigate = useNavigate();

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

      const response = await getMyPayments();
      setPayments(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load transaction history.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return payments;

    return payments.filter((payment) =>
      String(payment.id).includes(query) ||
      String(payment.type || "").toLowerCase().includes(query) ||
      String(payment.status || "").toLowerCase().includes(query) ||
      String(payment.method || "").toLowerCase().includes(query) ||
      String(payment.referenceNo || "").toLowerCase().includes(query) ||
      String(payment.amount || "").includes(query)
    );
  }, [payments, search]);

  return (
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
          maxWidth: "1100px",
          margin: "0 auto",
          background: CARD_BG,
          border: `1px solid ${CYAN}`,
          borderRadius: "18px",
          padding: "26px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h1 style={{ color: CYAN, marginBottom: "6px" }}>
              Transaction History
            </h1>
            <p style={{ color: MUTED, fontSize: "14px" }}>
              View your snack order and session extension payment records.
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
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
            Back to Dashboard
          </button>
        </div>

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
            placeholder="Search transactions..."
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
          <div style={{ color: "#ff9b9b", marginBottom: "16px", fontWeight: 700 }}>
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ color: MUTED }}>Loading transaction history...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#111" }}>
                  {["ID", "Type", "Amount", "Status", "Method", "Reference No", "Paid At", "Created At"].map(
                    (header) => (
                      <th key={header} style={thStyle}>
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        padding: "24px",
                        textAlign: "center",
                        color: MUTED,
                      }}
                    >
                      No transaction records found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} style={{ borderBottom: "1px solid #222" }}>
                      <td style={tdStyle}>#{payment.id}</td>
                      <td style={tdStyle}>{payment.type || "N/A"}</td>
                      <td style={tdStyle}>₱{Number(payment.amount || 0).toFixed(2)}</td>
                      <td style={tdStyle}>
                        <span style={getStatusStyle(payment.status)}>
                          {payment.status || "N/A"}
                        </span>
                      </td>
                      <td style={tdStyle}>{payment.method || "N/A"}</td>
                      <td style={tdStyle}>{payment.referenceNo || "N/A"}</td>
                      <td style={tdStyle}>
                        {payment.paidAt
                          ? new Date(payment.paidAt).toLocaleString()
                          : "N/A"}
                      </td>
                      <td style={tdStyle}>
                        {payment.createdAt
                          ? new Date(payment.createdAt).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

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
  const isPaid = status === "PAID";
  const isFailed = status === "FAILED" || status === "CANCELLED";

  return {
    padding: "4px 10px",
    borderRadius: "999px",
    background: isPaid
      ? "rgba(34,197,94,0.14)"
      : isFailed
      ? "rgba(239,68,68,0.14)"
      : "rgba(57,213,255,0.12)",
    color: isPaid ? "#22c55e" : isFailed ? "#ff9b9b" : CYAN,
    fontWeight: 800,
    fontSize: "12px",
  };
};