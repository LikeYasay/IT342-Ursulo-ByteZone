import { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout.jsx";
import { getAdminMetrics } from "./adminService";

const CYAN = "#39d5ff";
const MUTED = "#8a8f98";

function MetricCard({ label, value, sub, icon }) {
  return (
    <div
      style={{
        background: "#111",
        border: "1px solid #2a2a2a",
        borderRadius: "14px",
        padding: "18px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <span
          style={{
            color: MUTED,
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: "20px" }}>{icon}</span>
      </div>

      <div
        style={{
          color: CYAN,
          fontSize: "34px",
          fontWeight: 900,
          marginBottom: "6px",
        }}
      >
        {value}
      </div>

      <div style={{ color: MUTED, fontSize: "13px" }}>{sub}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminMetrics();
      setMetrics(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2 style={{ color: CYAN, marginBottom: "8px" }}>
            Admin / Staff Dashboard
          </h2>

          <p style={{ color: MUTED }}>
            Welcome, {user.fullName || "Staff"} • Role:{" "}
            <strong style={{ color: "#fff" }}>{user.role || "N/A"}</strong>
          </p>
        </div>

        <button
          onClick={loadMetrics}
          style={{
            padding: "10px 18px",
            borderRadius: "10px",
            border: "none",
            background: CYAN,
            color: "#000",
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "'Montserrat', sans-serif",
            height: "40px",
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
        <p style={{ color: MUTED }}>Loading dashboard metrics...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "16px",
          }}
        >
          <MetricCard
            label="Total Users"
            value={metrics?.totalUsers ?? 0}
            sub="Registered accounts"
            icon="👥"
          />

          <MetricCard
            label="Total Orders"
            value={metrics?.totalOrders ?? 0}
            sub="Snack orders recorded"
            icon="🛒"
          />

          <MetricCard
            label="Active Sessions"
            value={metrics?.activeSessions ?? 0}
            sub="Currently running sessions"
            icon="🟢"
          />

          <MetricCard
            label="Pending Payments"
            value={metrics?.pendingPayments ?? 0}
            sub="Initiated, processing, or pending"
            icon="⏳"
          />

          <MetricCard
            label="Paid Payments"
            value={metrics?.paidPayments ?? 0}
            sub="Successfully paid records"
            icon="✅"
          />

          <MetricCard
            label="Total Payments"
            value={metrics?.totalPayments ?? 0}
            sub="All payment records"
            icon="💳"
          />
        </div>
      )}
    </AdminLayout>
  );
}