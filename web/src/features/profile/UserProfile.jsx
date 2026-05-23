import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  logoutUser,
  uploadMyProfileImage,
  updateMyProfile,
  removeMyProfileImage,
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

function UserIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4 22C4 17.58 7.58 14 12 14C16.42 14 20 17.58 20 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5H20C21.1 5 22 5.9 22 7V17C22 18.1 21.1 19 20 19H4C2.9 19 2 18.1 2 17V7C2 5.9 2.9 5 4 5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M22 7L12 13L2 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 11V8C7 5.24 9.24 3 12 3C14.76 3 17 5.24 17 8V11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 11H18C19.1 11 20 11.9 20 13V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V13C4 11.9 4.9 11 6 11Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12C3.76 7.64 7.5 5 12 5C16.5 5 20.24 7.64 22 12C20.24 16.36 16.5 19 12 19C7.5 19 3.76 16.36 2 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3L21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10.58 10.58C10.21 10.95 10 11.45 10 12C10 13.1 10.9 14 12 14C12.55 14 13.05 13.79 13.42 13.42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9.88 5.09C10.56 5.03 11.26 5 12 5C16.5 5 20.24 7.64 22 12C21.5 13.24 20.79 14.33 19.91 15.24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6.61 6.61C4.63 7.86 3.06 9.72 2 12C3.76 16.36 7.5 19 12 19C13.54 19 14.98 18.69 16.26 18.12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
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

  const [showPassword, setShowPassword] = useState(false);
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
        err.response?.data?.message || "Failed to upload profile image.",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveImage = async () => {
    if (!imageUrl || uploading) return;

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const response = await removeMyProfileImage();
      const updatedUser = response.data;

      setUser(updatedUser);
      setProfilePreview("");
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setMessage("Profile picture removed successfully.");
      await loadProfile();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to remove profile picture.",
      );
    } finally {
      setUploading(false);
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
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                flexShrink: 0,
              }}
            >
              <img
                src="/ByteZoneLogo.png"
                alt="ByteZone Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
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
                    ? "Updating profile picture..."
                    : "Click the icon to upload a new profile picture"}
                </p>

                {imageUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={uploading}
                    style={{
                      marginTop: "10px",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "1px solid rgba(239,68,68,0.45)",
                      background: "rgba(239,68,68,0.10)",
                      color: "#ff9b9b",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: uploading ? "not-allowed" : "pointer",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    Remove Profile Picture
                  </button>
                )}
              </div>

              <ProfileInput
                label="Full Name"
                icon={<UserIcon />}
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
                icon={<MailIcon />}
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
                icon={<LockIcon />}
                type={showPassword ? "text" : "password"}
                value={form.password}
                placeholder="••••••••••••"
                rightAction={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    style={{
                      width: "28px",
                      height: "28px",
                      border: "none",
                      background: "transparent",
                      color: showPassword ? CYAN : MUTED,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
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
  icon = null,
  rightAction = null,
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
            color: MUTED,
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
            minWidth: 0,
          }}
        />

        {rightAction}
      </div>
    </div>
  );
}
