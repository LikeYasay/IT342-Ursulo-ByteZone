import { useEffect, useState } from "react";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
} from "./notificationService";

const CYAN = "#39d5ff";
const MUTED = "#8a8f98";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setError("");

      const [notificationResponse, countResponse] = await Promise.all([
        getMyNotifications(),
        getUnreadNotificationCount(),
      ]);

      setNotifications(notificationResponse.data || []);
      setUnreadCount(countResponse.data || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notifications.");
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.readStatus) {
        await markNotificationAsRead(notification.id);
        await loadNotifications();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update notification.");
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((value) => !value)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          position: "relative",
          fontSize: "20px",
        }}
      >
        🔔

        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              minWidth: "18px",
              height: "18px",
              padding: "0 5px",
              borderRadius: "999px",
              background: CYAN,
              color: "#000",
              fontSize: "11px",
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "34px",
            right: 0,
            width: "340px",
            maxHeight: "420px",
            overflowY: "auto",
            background: "#111",
            border: `1px solid ${CYAN}`,
            borderRadius: "14px",
            padding: "12px",
            zIndex: 500,
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <strong style={{ color: "#fff", fontSize: "14px" }}>
              Notifications
            </strong>

            <button
              onClick={loadNotifications}
              style={{
                background: "transparent",
                border: "none",
                color: CYAN,
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              Refresh
            </button>
          </div>

          {error && (
            <p style={{ color: "#ff9b9b", fontSize: "12px", marginBottom: "8px" }}>
              {error}
            </p>
          )}

          {notifications.length === 0 ? (
            <p style={{ color: MUTED, fontSize: "13px", padding: "18px 4px" }}>
              No notifications yet.
            </p>
          ) : (
            notifications.slice(0, 8).map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: notification.readStatus
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(57,213,255,0.10)",
                  border: "1px solid #222",
                  borderRadius: "10px",
                  padding: "10px",
                  marginBottom: "8px",
                  cursor: "pointer",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                <div
                  style={{
                    color: notification.readStatus ? "#fff" : CYAN,
                    fontSize: "13px",
                    fontWeight: 800,
                    marginBottom: "4px",
                  }}
                >
                  {notification.title}
                </div>

                <div style={{ color: MUTED, fontSize: "12px", lineHeight: 1.4 }}>
                  {notification.message}
                </div>

                <div style={{ color: "#555", fontSize: "11px", marginTop: "6px" }}>
                  {notification.createdAt
                    ? new Date(notification.createdAt).toLocaleString()
                    : ""}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}