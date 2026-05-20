import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../auth/authService";
import { getMyFiles, uploadLinkedFile } from "./fileUploadService";
import NotificationBell from "../notifications/NotificationBell.jsx";

const CYAN = "#39d5ff";
const DARK_BG = "#000000";
const CARD_BG = "#1c1c1c";
const INNER_BG = "#111";
const MUTED = "#8a8f98";

function getUserImageUrl(user) {
  return user?.profileImageUrl || user?.profile_image_url || "";
}

export default function FileUploadPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "{}")
  );
  const [file, setFile] = useState(null);
  const [recordType, setRecordType] = useState("ORDER");
  const [recordId, setRecordId] = useState("");
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    try {
      setError("");

      const [userRes, filesRes] = await Promise.all([
        getCurrentUser(),
        getMyFiles(),
      ]);

      setUser(userRes.data);
      localStorage.setItem("user", JSON.stringify(userRes.data));
      setFiles(filesRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load uploaded files.");
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a file first.");
      return;
    }

    if (!recordId || Number(recordId) <= 0) {
      setError("Please enter a valid record ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await uploadLinkedFile({
        file,
        recordType,
        recordId: Number(recordId),
      });

      setMessage("File uploaded and linked successfully.");
      setFile(null);
      setRecordId("");
      await loadPage();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload linked file.");
    } finally {
      setLoading(false);
    }
  };

  const profileImageUrl = getUserImageUrl(user);
  const displayName = user?.fullName || "Player";
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${DARK_BG}; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: DARK_BG,
          color: "#fff",
          fontFamily: "'Montserrat', sans-serif",
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
            borderBottom: "1px solid #1a1a1a",
            position: "sticky",
            top: 0,
            zIndex: 100,
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
            {[
              ["Home", "/dashboard"],
              ["Book", "/booking"],
              ["Order", "/order"],
              ["Transactions", "/transactions"],
              ["Files", "/files"],
            ].map(([label, path]) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                style={{
                  padding: "8px 18px",
                  background: label === "Files" ? CYAN : "transparent",
                  color: label === "Files" ? "#000" : "#fff",
                  fontWeight: label === "Files" ? 800 : 500,
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <NotificationBell />

            <span style={{ fontSize: "14px", color: "#fff", fontWeight: 500 }}>
              Welcome, <span style={{ color: CYAN, fontWeight: 700 }}>{displayName}</span>
            </span>

            <button
              onClick={() => navigate("/profile")}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: profileImageUrl
                  ? "#111"
                  : `linear-gradient(135deg, ${CYAN}, #0070a8)`,
                border: `2px solid ${CYAN}`,
                overflow: "hidden",
                color: "#000",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                displayInitial
              )}
            </button>

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
              }}
            >
              Logout
            </button>
          </div>
        </nav>

        <main
          style={{
            flex: 1,
            padding: "42px 40px",
            maxWidth: "1100px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              fontSize: "30px",
              fontWeight: 900,
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            Linked <span style={{ color: CYAN }}>File Upload</span>
          </h1>

          {error && (
            <div
              style={{
                color: "#ff9b9b",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "12px",
                padding: "14px",
                marginBottom: "16px",
                fontWeight: 700,
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              style={{
                color: CYAN,
                background: "rgba(57,213,255,0.10)",
                border: "1px solid rgba(57,213,255,0.25)",
                borderRadius: "12px",
                padding: "14px",
                marginBottom: "16px",
                fontWeight: 700,
              }}
            >
              {message}
            </div>
          )}

          <div
            style={{
              background: CARD_BG,
              border: `1px solid ${CYAN}`,
              borderRadius: "20px",
              padding: "24px",
              marginBottom: "24px",
            }}
          >
            <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>
              Upload file and link to record
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr 1.5fr auto",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                style={inputStyle}
              >
                <option value="ORDER">ORDER</option>
                <option value="PAYMENT">PAYMENT</option>
                <option value="RESERVATION">RESERVATION</option>
              </select>

              <input
                type="number"
                min="1"
                placeholder="Record ID"
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
                style={inputStyle}
              />

              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={inputStyle}
              />

              <button
                onClick={handleUpload}
                disabled={loading}
                style={{
                  padding: "12px 18px",
                  borderRadius: "10px",
                  border: "none",
                  background: CYAN,
                  color: "#000",
                  fontWeight: 900,
                  cursor: "pointer",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>

            <p style={{ color: MUTED, fontSize: "12px", marginTop: "12px" }}>
              Use an existing Order ID, Payment ID, or Reservation ID. The backend links the uploaded file to that record.
            </p>
          </div>

          <div
            style={{
              background: CARD_BG,
              border: "1px solid #2a2a2a",
              borderRadius: "20px",
              padding: "24px",
            }}
          >
            <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>
              My Uploaded Files
            </h2>

            {files.length === 0 ? (
              <p style={{ color: MUTED }}>No uploaded files yet.</p>
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
                    <tr style={{ background: INNER_BG }}>
                      {["ID", "File", "Type", "Record ID", "Size", "Uploaded", "View"].map(
                        (header) => (
                          <th
                            key={header}
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: MUTED,
                              borderBottom: "1px solid #333",
                            }}
                          >
                            {header}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {files.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid #222" }}>
                        <td style={tdStyle}>#{item.id}</td>
                        <td style={tdStyle}>{item.fileName}</td>
                        <td style={tdStyle}>{item.recordType}</td>
                        <td style={tdStyle}>#{item.recordId}</td>
                        <td style={tdStyle}>
                          {item.fileSizeBytes
                            ? `${Math.round(item.fileSizeBytes / 1024)} KB`
                            : "N/A"}
                        </td>
                        <td style={tdStyle}>
                          {item.uploadedAt
                            ? new Date(item.uploadedAt).toLocaleString()
                            : "N/A"}
                        </td>
                        <td style={tdStyle}>
                          <a
                            href={item.secureUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: CYAN, fontWeight: 800 }}
                          >
                            Open
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

const inputStyle = {
  width: "100%",
  height: "44px",
  background: "#111",
  border: "1px solid #333",
  borderRadius: "10px",
  color: "#fff",
  padding: "0 12px",
  fontFamily: "'Montserrat', sans-serif",
};

const tdStyle = {
  padding: "12px",
  color: "#ddd",
  verticalAlign: "top",
};