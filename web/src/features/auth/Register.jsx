import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "./authService";
import PublicNavbar from "../../shared/components/PublicNavbar";

const CYAN = "#39d5ff";
const DARK_BG = "#000000";
const CARD_BG = "#0d0d0d";
const MUTED = "#8a8f98";
const INPUT_BG = "#111111";
const INPUT_BORDER = "#2a2a2a";

export default function ByteZoneSignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.fullName || !form.email || !form.password || !form.confirm) {
      setError("Please complete all fields.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

    const response = await registerUser({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
    });

    localStorage.setItem("token", response.accessToken);
    localStorage.setItem("user", JSON.stringify(response.user));

      setSuccess("Registration successful!");
      navigate("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name) => ({
    width: "100%",
    height: "50px",
    background: INPUT_BG,
    border: `1px solid ${focused === name ? CYAN : INPUT_BORDER}`,
    borderRadius: "10px",
    color: "#fff",
    fontSize: "15px",
    fontFamily: "'Montserrat', sans-serif",
    padding: "0 16px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: focused === name ? `0 0 0 3px rgba(57,213,255,0.12)` : "none",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${DARK_BG}; }
      `}</style>

      <div
        style={{
          fontFamily: "'Montserrat', sans-serif",
          background: DARK_BG,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <PublicNavbar />

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "440px",
              background: CARD_BG,
              border: `1px solid ${CYAN}`,
              borderRadius: "20px",
              padding: "44px 40px 36px",
              boxShadow: `0 0 60px rgba(57,213,255,0.08)`,
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#fff",
                  marginBottom: "8px",
                }}
              >
                Create your account
              </h1>
              <p style={{ fontSize: "14px", color: MUTED }}>
                Please enter your details to sign up
              </p>
            </div>

            <form
              onSubmit={handleRegister}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: "8px",
                  }}
                >
                  Full Name
                </label>
                <input
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={handleChange}
                  onFocus={() => setFocused("fullName")}
                  onBlur={() => setFocused(null)}
                  style={inputStyle("fullName")}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: "8px",
                  }}
                >
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  style={inputStyle("email")}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: "8px",
                  }}
                >
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  style={inputStyle("password")}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: "8px",
                  }}
                >
                  Confirm Password
                </label>
                <input
                  name="confirm"
                  type="password"
                  placeholder="Confirm your password"
                  value={form.confirm}
                  onChange={handleChange}
                  onFocus={() => setFocused("confirm")}
                  onBlur={() => setFocused(null)}
                  style={inputStyle("confirm")}
                />
              </div>

              {error && (
                <div
                  style={{
                    background: "rgba(255,0,0,0.08)",
                    border: "1px solid rgba(255,0,0,0.28)",
                    color: "#ff8d8d",
                    fontSize: "13px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                  }}
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  style={{
                    background: "rgba(0,255,140,0.08)",
                    border: "1px solid rgba(0,255,140,0.28)",
                    color: "#8fffc2",
                    fontSize: "13px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                  }}
                >
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: "6px",
                  height: "50px",
                  border: "none",
                  borderRadius: "10px",
                  background: CYAN,
                  color: "#000",
                  fontWeight: 800,
                  fontSize: "15px",
                  cursor: "pointer",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}