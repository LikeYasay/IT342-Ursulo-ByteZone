import AdminLayout from "./components/AdminLayout.jsx";

const CYAN = "#39d5ff";
const MUTED = "#8a8f98";

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <AdminLayout title="Dashboard">
      <h2 style={{ color: CYAN, marginBottom: "12px" }}>
        Admin / Staff Dashboard
      </h2>

      <p style={{ color: MUTED, marginBottom: "18px" }}>
        Welcome, {user.fullName || "Staff"}.
      </p>

      <p style={{ marginBottom: "8px" }}>
        Role: <strong>{user.role || "N/A"}</strong>
      </p>

      <p style={{ color: MUTED }}>
        This dashboard layout is now ready. Next, we will connect real metrics,
        users, payments, orders, and announcements from the backend.
      </p>
    </AdminLayout>
  );
}