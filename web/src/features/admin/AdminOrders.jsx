import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./components/AdminLayout.jsx";
import { getAllOrders, updateOrderStatus } from "../orders/orderService";

const CYAN = "#39d5ff";
const MUTED = "#8a8f98";

const ORDER_STATUS_OPTIONS = [
  "PENDING",
  "PREPARING",
  "READY",
  "SERVED",
  "CANCELLED",
];


export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllOrders();
      setOrders(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

    const handleStatusChange = async (orderId, status) => {
    try {
        setError("");

        await updateOrderStatus(orderId, status);
        await loadOrders();
    } catch (err) {
        setError(err.response?.data?.message || "Failed to update order status.");
    }
    };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return orders;

    return orders.filter((order) => {
      const userName = order.user?.fullName || "";
      const userEmail = order.user?.email || "";
      const stationNo = order.station?.stationNo || "";

      return (
        String(order.id).includes(query) ||
        userName.toLowerCase().includes(query) ||
        userEmail.toLowerCase().includes(query) ||
        stationNo.toLowerCase().includes(query) ||
        String(order.status || "").toLowerCase().includes(query) ||
        String(order.total || "").includes(query)
      );
    });
  }, [orders, search]);

  return (
    <AdminLayout title="Orders">
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
          placeholder="Search orders..."
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
          onClick={loadOrders}
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
        <p style={{ color: MUTED }}>Loading orders...</p>
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
                  "Items",
                  "Total",
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
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: MUTED,
                    }}
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid #222" }}>
                    <td style={tdStyle}>#{order.id}</td>

                    <td style={tdStyle}>
                      <div style={{ color: "#fff", fontWeight: 700 }}>
                        {order.user?.fullName || "N/A"}
                      </div>
                      <div style={{ color: MUTED, fontSize: "12px" }}>
                        {order.user?.email || ""}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      {order.station?.stationNo || `Station ${order.station?.id || "N/A"}`}
                    </td>

                    <td style={tdStyle}>
                      {(order.items || []).length === 0 ? (
                        <span style={{ color: MUTED }}>No items</span>
                      ) : (
                        <div style={{ display: "grid", gap: "4px" }}>
                          {(order.items || []).map((item) => (
                            <span key={item.id}>
                              {item.snack?.name || "Snack"} × {item.qty}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td style={tdStyle}>₱{Number(order.total || 0).toFixed(2)}</td>

                    <td style={tdStyle}>
                        <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
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
                            {ORDER_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                            ))}
                        </select>
                        </td>

                    <td style={tdStyle}>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
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