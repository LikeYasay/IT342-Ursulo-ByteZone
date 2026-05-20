import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  logoutUser,
  uploadMyProfileImage,
  updateMyProfile,
} from "../auth/authService";
import NotificationBell from "../notifications/NotificationBell.jsx";

const CYAN = "#39d5ff";
const DARK_BG = "#000000";
const CARD_BG = "#1c1c1c";
const INNER_BG = "#111111";
const MUTED = "#8a8f98";

function getUserImageUrl(user) {
  return user?.profileImageUrl || user?.profile_image_url || "";
}

export default function UserProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await getCurrentUser();
      const currentUser = response.data;

      const savedImageUrl = getUserImageUrl(currentUser);

      setUser(currentUser);
      setProfilePreview(savedImageUrl);

      setForm({
        fullName: currentUser?.fullName || "",
        email: currentUser?.email || "",
        password: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleNav = (label) => {
    if (label === "Home") navigate("/dashboard");
    if (label === "Book") navigate("/booking");
    if (label === "Order") navigate("/order");
    if (label === "Transactions") navigate("/transactions");
  };

  const handleImageClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);

    setProfilePreview(localPreviewUrl);
    setMessage("");
    setError("");

    try {
      setUploading(true);

      const response = await uploadMyProfileImage(file);
      const updatedUser = response.data;
      const savedImageUrl = getUserImageUrl(updatedUser);

      setUser(updatedUser);
      setProfilePreview(savedImageUrl || localPreviewUrl);

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setMessage("Profile picture updated successfully.");

      await loadProfile();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to upload profile image."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleUpdate = async () => {
    if (!form.fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {};
      if (form.fullName.trim()) payload.fullName = form.fullName.trim();
      if (form.email.trim()) payload.email = form.email.trim();
      if (form.password.trim()) payload.password = form.password;

      const response = await updateMyProfile(payload);
      const updatedUser = response.data;

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setForm((prev) => ({
        ...prev,
        fullName: updatedUser.fullName || prev.fullName,
        email: updatedUser.email || prev.email,
        password: "",
      }));

      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.fullName || "Player";
  const displayInitial = displayName.charAt(0).toUpperCase();
  const imageUrl = profilePreview || getUserImageUrl(user);

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
            {["Home", "Book", "Order", "Transactions"].map((link) => (
              <button
                key={link}
                onClick={() => handleNav(link)}
                style={{
                  padding: "8px 22px",
                  background: "transparent",
                  color: "#fff",
                  fontWeight: 500,
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {link}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <NotificationBell />

            <span style={{ fontSize: "14px", color: "#fff", fontWeight: 500 }}>
              Welcome,{" "}
              <span style={{ color: CYAN, fontWeight: 700 }}>
                {displayName}
              </span>
            </span>

            <button
              onClick={() => navigate("/profile")}
              title="View Profile"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: imageUrl
                  ? "#111"
                  : `linear-gradient(135deg, ${CYAN}, #0070a8)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: 800,
                color: "#000",
                border: `2px solid ${CYAN}`,
                cursor: "pointer",
                fontFamily: "'Montserrat', sans-serif",
                overflow: "hidden",
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
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
            maxWidth: "1280px",
            width: "100%",
            margin: "0 auto",
            position: "relative",
          }}
        >
          <button
            onClick={() => navigate("/dashboard")}
            title="Back to Dashboard"
            style={{
              position: "absolute",
              left: "40px",
              top: "46px",
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              border: "1px solid #2a2a2a",
              background: CARD_BG,
              color: "#fff",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ←
          </button>

          <h1
            style={{
              textAlign: "center",
              fontSize: "30px",
              fontWeight: 900,
              marginBottom: "26px",
            }}
          >
            Account <span style={{ color: CYAN }}>Information</span>
          </h1>

          {loading ? (
            <p style={{ color: MUTED, textAlign: "center" }}>
              Loading profile...
            </p>
          ) : (
            <div
              style={{
                width: "430px",
                margin: "0 auto",
                background: CARD_BG,
                border: `1px solid ${CYAN}`,
                borderRadius: "18px",
                padding: "42px 28px 24px",
                boxShadow: "0 18px 45px rgba(57,213,255,0.08)",
              }}
            >
              {error && (
                <div
                  style={{
                    color: "#ff9b9b",
                    marginBottom: "14px",
                    fontSize: "13px",
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
              )}

              {message && (
                <div
                  style={{
                    color: CYAN,
                    marginBottom: "14px",
                    fontSize: "13px",
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                >
                  {message}
                </div>
              )}

              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <button
                  onClick={handleImageClick}
                  disabled={uploading}
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    border: `2px solid ${CYAN}`,
                    background: INNER_BG,
                    overflow: "hidden",
                    cursor: uploading ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: MUTED,
                    fontWeight: 800,
                    fontSize: "12px",
                    fontFamily: "'Montserrat', sans-serif",
                    boxShadow: "0 0 20px rgba(57,213,255,0.12)",
                    opacity: uploading ? 0.7 : 1,
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Profile preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    "120 × 120"
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />

                <p
                  style={{
                    fontSize: "11px",
                    color: MUTED,
                    marginTop: "12px",
                  }}
                >
                  {uploading
                    ? "Uploading profile picture..."
                    : "Click the icon to upload a new profile picture"}
                </p>
              </div>

              <ProfileInput
                label="Full Name"
                icon="👤"
                value={form.fullName}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    fullName: value,
                  }))
                }
              />

              <ProfileInput
                label="Email Address"
                icon="✉️"
                value={form.email}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    email: value,
                  }))
                }
              />

              <ProfileInput
                label="Password"
                icon="🔒"
                type="password"
                value={form.password}
                placeholder="••••••••••••"
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    password: value,
                  }))
                }
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "18px",
                }}
              >
                <button
                  onClick={handleUpdate}
                  disabled={saving || uploading}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "10px",
                    border: "none",
                    background: saving ? "#555" : CYAN,
                    color: "#000",
                    fontWeight: 900,
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: "0 0 18px rgba(57,213,255,0.25)",
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  {saving ? "Saving..." : "Update"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function ProfileInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  icon = "👤",
}) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        style={{
          display: "block",
          fontSize: "12px",
          fontWeight: 800,
          color: "#fff",
          marginBottom: "7px",
        }}
      >
        {label}
      </label>

      <div
        style={{
          height: "42px",
          border: "1px solid #333",
          borderRadius: "8px",
          background: INNER_BG,
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          gap: "10px",
        }}
      >
        <span
          style={{
            width: "22px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "15px",
            flexShrink: 0,
          }}
        >
          {icon}
        </span>

        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "#fff",
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "13px",
          }}
        />
      </div>
    </div>
  );
}